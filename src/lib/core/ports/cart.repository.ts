export interface CartItemRow {
  productId: string;
  variantId: string | null;
  quantity: number;
  size: string | null;
  color: string | null;
}

export interface CartRepository {
  getCartItems(userId: string): Promise<CartItemRow[]>;
  addCartItem(
    userId: string,
    productId: string,
    variantId: string | null,
    quantity: number,
    size: string | null,
    color: string | null
  ): Promise<void>;
  setCartItemQuantity(
    userId: string,
    productId: string,
    variantId: string | null,
    size: string | null,
    color: string | null,
    quantity: number
  ): Promise<void>;
  removeCartItem(userId: string, productId: string, variantId: string | null, size: string | null, color: string | null): Promise<void>;
  clearCart(userId: string): Promise<void>;
  /**
   * Merge guest cart lines into this user's DB cart. Same product+variant
   * quantities add; different variants stay separate. Invalid/unavailable
   * guest lines are skipped, not persisted. Must be atomic: either every
   * valid guest contribution lands, or the DB cart is left unchanged.
   */
  mergeCartItems(userId: string, items: CartItemRow[]): Promise<void>;
}
