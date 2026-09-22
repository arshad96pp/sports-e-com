import "server-only";
import { getCartRepository } from "@/lib/config/providers";
import type { CartItemRow } from "@/lib/core/ports/cart.repository";

export type { CartItemRow };

export async function getCartItems(userId: string): Promise<CartItemRow[]> {
  return getCartRepository().getCartItems(userId);
}

export async function addCartItem(
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
  size: string | null,
  color: string | null
): Promise<void> {
  return getCartRepository().addCartItem(userId, productId, variantId, quantity, size, color);
}

export async function setCartItemQuantity(
  userId: string,
  productId: string,
  variantId: string | null,
  size: string | null,
  color: string | null,
  quantity: number
): Promise<void> {
  return getCartRepository().setCartItemQuantity(userId, productId, variantId, size, color, quantity);
}

export async function removeCartItem(
  userId: string,
  productId: string,
  variantId: string | null,
  size: string | null,
  color: string | null
): Promise<void> {
  return getCartRepository().removeCartItem(userId, productId, variantId, size, color);
}

export async function clearCart(userId: string): Promise<void> {
  return getCartRepository().clearCart(userId);
}

/** Merge a guest's localStorage cart into the DB cart right after login. */
export async function mergeCartItems(
  userId: string,
  items: { productId: string; variantId: string | null; quantity: number; size: string | null; color: string | null }[]
): Promise<void> {
  return getCartRepository().mergeCartItems(userId, items);
}
