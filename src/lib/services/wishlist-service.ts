import "server-only";
import { createClient } from "@/lib/supabase/server";

async function getOrCreateWishlistId(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("wishlists").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("wishlists")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error || !created) throw new Error("Could not create wishlist.");
  return created.id;
}

export async function getWishlistProductIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const wishlistId = await getOrCreateWishlistId(userId);
  const { data } = await supabase.from("wishlist_items").select("product_id").eq("wishlist_id", wishlistId);
  return (data ?? []).map((i) => i.product_id);
}

/** Returns the new state: true if the item is now wishlisted, false if it was removed. */
export async function toggleWishlistItem(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  const wishlistId = await getOrCreateWishlistId(userId);

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlist_items").delete().eq("id", existing.id);
    return false;
  }

  await supabase.from("wishlist_items").insert({ wishlist_id: wishlistId, product_id: productId });
  return true;
}

export async function removeWishlistItem(userId: string, productId: string): Promise<void> {
  const supabase = await createClient();
  const wishlistId = await getOrCreateWishlistId(userId);
  await supabase.from("wishlist_items").delete().eq("wishlist_id", wishlistId).eq("product_id", productId);
}

export async function mergeWishlistItems(userId: string, productIds: string[]): Promise<void> {
  if (productIds.length === 0) return;
  const supabase = await createClient();
  const wishlistId = await getOrCreateWishlistId(userId);
  await supabase
    .from("wishlist_items")
    .upsert(
      productIds.map((productId) => ({ wishlist_id: wishlistId, product_id: productId })),
      { onConflict: "wishlist_id,product_id", ignoreDuplicates: true }
    );
}
