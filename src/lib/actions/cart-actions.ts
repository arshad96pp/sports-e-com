"use server";

import { getCurrentCustomerId } from "@/lib/auth/session";
import * as cartService from "@/lib/services/cart-service";

export interface CartItemDTO {
  productId: string;
  variantId: string | null;
  quantity: number;
  size: string | null;
  color: string | null;
}

export async function getCartAction(): Promise<CartItemDTO[]> {
  const userId = await getCurrentCustomerId();
  if (!userId) return [];
  const items = await cartService.getCartItems(userId);
  return items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity, size: i.size, color: i.color }));
}

export async function addCartItemAction(
  productId: string,
  variantId: string | null,
  quantity: number,
  size: string | null,
  color: string | null
): Promise<{ ok: boolean; error?: string }> {
  const userId = await getCurrentCustomerId();
  if (!userId) return { ok: false };
  try {
    await cartService.addCartItem(userId, productId, variantId, quantity, size, color);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not add item to cart." };
  }
}

export async function setCartItemQuantityAction(
  productId: string,
  variantId: string | null,
  size: string | null,
  color: string | null,
  quantity: number
): Promise<{ ok: boolean }> {
  const userId = await getCurrentCustomerId();
  if (!userId) return { ok: false };
  await cartService.setCartItemQuantity(userId, productId, variantId, size, color, quantity);
  return { ok: true };
}

export async function removeCartItemAction(
  productId: string,
  variantId: string | null,
  size: string | null,
  color: string | null
): Promise<{ ok: boolean }> {
  const userId = await getCurrentCustomerId();
  if (!userId) return { ok: false };
  await cartService.removeCartItem(userId, productId, variantId, size, color);
  return { ok: true };
}

export async function clearCartAction(): Promise<{ ok: boolean }> {
  const userId = await getCurrentCustomerId();
  if (!userId) return { ok: false };
  await cartService.clearCart(userId);
  return { ok: true };
}

export async function mergeCartAction(items: CartItemDTO[]): Promise<{ ok: boolean }> {
  const userId = await getCurrentCustomerId();
  if (!userId) return { ok: false };
  await cartService.mergeCartItems(userId, items);
  return { ok: true };
}
