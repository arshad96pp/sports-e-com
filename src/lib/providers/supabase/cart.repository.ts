import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CartRepository } from "@/lib/core/ports/cart.repository";

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
 * frequently null, so every lookup needs `.is(col, null)` instead in that case. */
function matchVariant<Q extends { eq: (col: string, val: string) => Q; is: (col: string, val: null) => Q }>(
  query: Q,
  cartId: string,
  productId: string,
  variantId: string | null,
  size: string | null,
  color: string | null
): Q {
  let q = query.eq("cart_id", cartId).eq("product_id", productId);
  q = variantId === null ? q.is("variant_id", null) : q.eq("variant_id", variantId);
  q = size === null ? q.is("size", null) : q.eq("size", size);
  q = color === null ? q.is("color", null) : q.eq("color", color);
  return q;
}

export function createSupabaseCartRepository(): CartRepository {
  return {
    async getCartItems(userId) {
      const supabase = await createClient();
      const cartId = await getOrCreateCartId(userId);
      const { data } = await supabase
        .from("cart_items")
        .select("product_id, variant_id, quantity, size, color")
        .eq("cart_id", cartId)
        .order("created_at", { ascending: true });

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
          .select("id")
          .eq("id", variantId)
          .eq("product_id", productId)
          .maybeSingle();
        if (!variant) throw new Error("That size is no longer available.");
      }

      const { data: existing } = await matchVariant(
        supabase.from("cart_items").select("id, quantity"),
        cartId,
        productId,
        variantId,
        size,
        color
      ).maybeSingle();

      if (existing) {
        await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
        return;
      }

      await supabase.from("cart_items").insert({ cart_id: cartId, product_id: productId, variant_id: variantId, quantity, size, color });
    },

    async setCartItemQuantity(userId, productId, variantId, size, color, quantity) {
      const supabase = await createClient();
      const cartId = await getOrCreateCartId(userId);

      if (quantity <= 0) {
        await matchVariant(supabase.from("cart_items").delete(), cartId, productId, variantId, size, color);
        return;
      }
      await matchVariant(supabase.from("cart_items").update({ quantity }), cartId, productId, variantId, size, color);
    },

    async removeCartItem(userId, productId, variantId, size, color) {
      const supabase = await createClient();
      const cartId = await getOrCreateCartId(userId);
      await matchVariant(supabase.from("cart_items").delete(), cartId, productId, variantId, size, color);
    },

    async clearCart(userId) {
      const supabase = await createClient();
      const cartId = await getOrCreateCartId(userId);
      await supabase.from("cart_items").delete().eq("cart_id", cartId);
    },
  };
}
