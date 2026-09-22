import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CartRepository } from "@/lib/core/ports/cart.repository";
import {
  canonicalizeGuestLines,
  cartLineKey,
  toGuestCartPayload,
  type CartLine,
  type CatalogVariant,
} from "@/lib/utils/cart-merge";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function getOrCreateCartId(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error || !created) throw new Error("Could not create cart.");
  return created.id;
}

/** PostgREST's `.eq()` can't match NULL — variant selectors (variant_id/size/color) are
 * frequently null, so every lookup needs `.is(col, null)` instead in that case.
 *
 * When a variant_id is present, identity is (product, variant) — size/color are
 * not part of the match, so M and L of the same product stay separate rows
 * while two M's (even with a stale size string) collapse. */
function matchLine<Q extends { eq: (col: string, val: string) => Q; is: (col: string, val: null) => Q }>(
  query: Q,
  cartId: string,
  productId: string,
  variantId: string | null,
  size: string | null,
  color: string | null
): Q {
  let q = query.eq("cart_id", cartId).eq("product_id", productId);
  if (variantId !== null) {
    return q.eq("variant_id", variantId);
  }
  q = q.is("variant_id", null);
  q = size === null ? q.is("size", null) : q.eq("size", size);
  q = color === null ? q.is("color", null) : q.eq("color", color);
  return q;
}

function isMissingMergeRpc(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "PGRST202") return true;
  const message = error.message?.toLowerCase() ?? "";
  return message.includes("merge_guest_cart") && (message.includes("does not exist") || message.includes("could not find"));
}

async function loadCatalogForGuestLines(
  supabase: SupabaseClient,
  guest: CartLine[]
): Promise<{ productIds: Set<string>; variants: Map<string, CatalogVariant> }> {
  const requestedProductIds = [...new Set(guest.map((i) => i.productId).filter(Boolean))];
  const requestedVariantIds = [...new Set(guest.map((i) => i.variantId).filter((id): id is string => Boolean(id)))];

  const productIds = new Set<string>();
  if (requestedProductIds.length > 0) {
    const { data: products, error } = await supabase.from("products").select("id").in("id", requestedProductIds);
    if (error) throw new Error("Could not validate cart products.");
    for (const p of products ?? []) productIds.add(p.id);
  }

  const variants = new Map<string, CatalogVariant>();
  if (requestedVariantIds.length > 0) {
    const { data: rows, error } = await supabase
      .from("product_variants")
      .select("id, product_id, size, color")
      .in("id", requestedVariantIds);
    if (error) throw new Error("Could not validate cart sizes.");
    for (const v of rows ?? []) {
      variants.set(v.id, { id: v.id, productId: v.product_id, size: v.size, color: v.color });
    }
  }

  return { productIds, variants };
}

/**
 * Sequential fallback used only when the atomic `merge_guest_cart` RPC is
 * not yet applied. Validates every guest line first, then writes, so a
 * stale/deleted variant cannot abort (or partially apply) the rest.
 */
async function mergeCartItemsFallback(userId: string, guestItems: CartLine[]): Promise<void> {
  const supabase = await createClient();
  const cartId = await getOrCreateCartId(userId);

  const { data: dbRows, error: dbError } = await supabase
    .from("cart_items")
    .select("id, product_id, variant_id, quantity, size, color")
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });
  if (dbError) throw new Error("Could not load cart.");

  const { productIds, variants } = await loadCatalogForGuestLines(supabase, guestItems);
  const validGuest = canonicalizeGuestLines(guestItems, productIds, variants);
  if (validGuest.length === 0) return;

  const dbByKey = new Map<string, { id: string; quantity: number }>();
  for (const row of dbRows ?? []) {
    const key = cartLineKey({
      productId: row.product_id,
      variantId: row.variant_id,
      size: row.size,
      color: row.color,
    });
    if (!dbByKey.has(key)) dbByKey.set(key, { id: row.id, quantity: row.quantity });
  }

  for (const line of validGuest) {
    const existing = dbByKey.get(cartLineKey(line));
    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + line.quantity })
        .eq("id", existing.id);
      if (error) throw new Error("Could not merge cart.");
    } else {
      const { error } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        product_id: line.productId,
        variant_id: line.variantId,
        quantity: line.quantity,
        size: line.size,
        color: line.color,
      });
      if (error) throw new Error("Could not merge cart.");
    }
  }
}

export function createSupabaseCartRepository(): CartRepository {
  return {
    async getCartItems(userId) {
      const supabase = await createClient();
      const cartId = await getOrCreateCartId(userId);
      const { data, error } = await supabase
        .from("cart_items")
        .select("product_id, variant_id, quantity, size, color")
        .eq("cart_id", cartId)
        .order("created_at", { ascending: true });
      if (error) throw new Error("Could not load cart.");

      return (data ?? []).map((i) => ({
        productId: i.product_id,
        variantId: i.variant_id,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      }));
    },

    async addCartItem(userId, productId, variantId, quantity, size, color) {
      const supabase = await createClient();
      const cartId = await getOrCreateCartId(userId);

      // A variant_id is only trusted once it's confirmed to belong to this
      // same product — stops a client from pinning a cart line to another
      // product's variant (wrong size label, wrong price at resolve time).
      if (variantId !== null) {
        const { data: variant } = await supabase
          .from("product_variants")
          .select("id, size, color")
          .eq("id", variantId)
          .eq("product_id", productId)
          .maybeSingle();
        if (!variant) throw new Error("That size is no longer available.");
        size = variant.size;
        color = variant.color;
      }

      const { data: existing, error: lookupError } = await matchLine(
        supabase.from("cart_items").select("id, quantity"),
        cartId,
        productId,
        variantId,
        size,
        color
      ).maybeSingle();
      if (lookupError) throw new Error("Could not add item to cart.");

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        if (error) throw new Error("Could not add item to cart.");
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .insert({ cart_id: cartId, product_id: productId, variant_id: variantId, quantity, size, color });
      if (error) throw new Error("Could not add item to cart.");
    },

    async setCartItemQuantity(userId, productId, variantId, size, color, quantity) {
      const supabase = await createClient();
      const cartId = await getOrCreateCartId(userId);

      if (quantity <= 0) {
        const { error } = await matchLine(supabase.from("cart_items").delete(), cartId, productId, variantId, size, color);
        if (error) throw new Error("Could not update cart.");
        return;
      }
      const { error } = await matchLine(
        supabase.from("cart_items").update({ quantity }),
        cartId,
        productId,
        variantId,
        size,
        color
      );
      if (error) throw new Error("Could not update cart.");
    },

    async removeCartItem(userId, productId, variantId, size, color) {
      const supabase = await createClient();
      const cartId = await getOrCreateCartId(userId);
      const { error } = await matchLine(supabase.from("cart_items").delete(), cartId, productId, variantId, size, color);
      if (error) throw new Error("Could not update cart.");
    },

    async clearCart(userId) {
      const supabase = await createClient();
      const cartId = await getOrCreateCartId(userId);
      const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartId);
      if (error) throw new Error("Could not clear cart.");
    },

    async mergeCartItems(userId, items) {
      const guestItems = toGuestCartPayload(items);
      if (guestItems.length === 0) return;

      const supabase = await createClient();
      const { error } = await supabase.rpc("merge_guest_cart", {
        p_items: guestItems.map((i) => ({
          product_id: i.productId,
          variant_id: i.variantId,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
        })),
      });

      if (!error) return;
      if (isMissingMergeRpc(error)) {
        await mergeCartItemsFallback(userId, guestItems);
        return;
      }
      throw new Error(error.message || "Could not merge cart.");
    },
  };
}
