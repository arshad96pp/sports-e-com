import "server-only";
import { getProductRepository } from "@/lib/config/providers";
import type { AdminProductDetail, AdminProductListItem, ProductFormValues } from "@/lib/core/ports/product.repository";

export type { AdminProductDetail, AdminProductListItem, ProductFormValues };

export async function listProductsForAdmin(): Promise<AdminProductListItem[]> {
  return getProductRepository().listProductsForAdmin();
}

export async function getProductForAdmin(id: string): Promise<AdminProductDetail | null> {
  return getProductRepository().getProductForAdmin(id);
}

export async function createProduct(values: ProductFormValues): Promise<{ id: string }> {
  return getProductRepository().createProduct(values);
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<void> {
  return getProductRepository().updateProduct(id, values);
}

export async function deleteProduct(id: string): Promise<void> {
  return getProductRepository().deleteProduct(id);
}

export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  return getProductRepository().setProductActive(id, isActive);
}

export async function addProductImage(productId: string, url: string, altText: string, sortOrder: number): Promise<void> {
  return getProductRepository().addProductImage(productId, url, altText, sortOrder);
}

export async function deleteProductImage(imageId: string): Promise<void> {
  return getProductRepository().deleteProductImage(imageId);
}
