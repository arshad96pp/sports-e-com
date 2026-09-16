import "server-only";
import { getWishlistRepository } from "@/lib/config/providers";

export async function getWishlistProductIds(userId: string): Promise<string[]> {
  return getWishlistRepository().getWishlistProductIds(userId);
}

/** Returns the new state: true if the item is now wishlisted, false if it was removed. */
export async function toggleWishlistItem(userId: string, productId: string): Promise<boolean> {
  return getWishlistRepository().toggleWishlistItem(userId, productId);
}

export async function removeWishlistItem(userId: string, productId: string): Promise<void> {
  return getWishlistRepository().removeWishlistItem(userId, productId);
}

export async function mergeWishlistItems(userId: string, productIds: string[]): Promise<void> {
  return getWishlistRepository().mergeWishlistItems(userId, productIds);
}
