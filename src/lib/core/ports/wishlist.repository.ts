export interface WishlistRepository {
  getWishlistProductIds(userId: string): Promise<string[]>;
  /** Returns the new state: true if the item is now wishlisted, false if it was removed. */
  toggleWishlistItem(userId: string, productId: string): Promise<boolean>;
  removeWishlistItem(userId: string, productId: string): Promise<void>;
  /** Bulk upsert (guest-cart-style merge on login) — a single provider call, not a loop over `toggleWishlistItem`. */
  mergeWishlistItems(userId: string, productIds: string[]): Promise<void>;
}
