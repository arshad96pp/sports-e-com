export interface CartItemRow {
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
}

export interface CartRepository {
  getCartItems(userId: string): Promise<CartItemRow[]>;
  addCartItem(userId: string, productId: string, quantity: number, size: string | null, color: string | null): Promise<void>;
  setCartItemQuantity(
    userId: string,
    productId: string,
    size: string | null,
    color: string | null,
    quantity: number
  ): Promise<void>;
  removeCartItem(userId: string, productId: string, size: string | null, color: string | null): Promise<void>;
  clearCart(userId: string): Promise<void>;
}
