"use server";

import { getProductsByIds } from "@/lib/services/product-service";
import type { Product } from "@/lib/types";

/** Used by CartContext/WishlistContext to resolve live product data (name, price, image, stock) for whatever's in a cart/wishlist — never trust the client's own cached copy for money math. */
export async function getProductsByIdsAction(ids: string[]): Promise<Product[]> {
  return getProductsByIds(ids);
}
