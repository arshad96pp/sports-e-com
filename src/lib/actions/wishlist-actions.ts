"use server";

import { getCurrentCustomerId } from "@/lib/auth/session";
import * as wishlistService from "@/lib/services/wishlist-service";

export async function getWishlistAction(): Promise<string[]> {
  const userId = await getCurrentCustomerId();
  if (!userId) return [];
  return wishlistService.getWishlistProductIds(userId);
}

export async function toggleWishlistAction(productId: string): Promise<{ ok: boolean; wishlisted?: boolean }> {
  const userId = await getCurrentCustomerId();
  if (!userId) return { ok: false };
  const wishlisted = await wishlistService.toggleWishlistItem(userId, productId);
  return { ok: true, wishlisted };
}

export async function removeWishlistItemAction(productId: string): Promise<{ ok: boolean }> {
  const userId = await getCurrentCustomerId();
  if (!userId) return { ok: false };
  await wishlistService.removeWishlistItem(userId, productId);
  return { ok: true };
}

export async function mergeWishlistAction(productIds: string[]): Promise<{ ok: boolean }> {
  const userId = await getCurrentCustomerId();
  if (!userId) return { ok: false };
  await wishlistService.mergeWishlistItems(userId, productIds);
  return { ok: true };
}
