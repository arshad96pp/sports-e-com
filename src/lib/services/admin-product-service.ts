import "server-only";
import { getProductRepository } from "@/lib/config/providers";
import { sanitizeDescriptionHtml } from "@/lib/utils/sanitize-html";
import type {
  AdminProductDetail,
  AdminProductListItem,
  AdminProductQueryParams,
  AdminProductQueryResult,
  ProductFormValues,
} from "@/lib/core/ports/product.repository";

export type { AdminProductDetail, AdminProductListItem, AdminProductQueryParams, AdminProductQueryResult, ProductFormValues };

export async function listProductsForAdmin(params?: AdminProductQueryParams): Promise<AdminProductQueryResult> {
  return getProductRepository().listProductsForAdmin(params);
}

export async function getProductForAdmin(id: string): Promise<AdminProductDetail | null> {
  return getProductRepository().getProductForAdmin(id);
}

function assertValidPricing(values: ProductFormValues): void {
  if (values.price > values.mrp) {
    throw new Error("Price cannot be higher than MRP.");
  }
}

export async function createProduct(values: ProductFormValues, options?: { autoSku?: boolean }): Promise<{ id: string }> {
  assertValidPricing(values);
  const sanitized = { ...values, description: sanitizeDescriptionHtml(values.description) };
  return getProductRepository().createProduct(sanitized, options);
}

export async function previewNextSku(slugOrPrefix: string): Promise<string> {
  return getProductRepository().previewNextSku(slugOrPrefix);
}

export async function isSkuAvailable(sku: string, excludeId?: string): Promise<boolean> {
  return getProductRepository().isSkuAvailable(sku, excludeId);
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<void> {
  assertValidPricing(values);
  const sanitized = { ...values, description: sanitizeDescriptionHtml(values.description) };
  return getProductRepository().updateProduct(id, sanitized);
}

export async function deleteProduct(id: string): Promise<{ imageUrls: string[] }> {
  return getProductRepository().deleteProduct(id);
}

export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  return getProductRepository().setProductActive(id, isActive);
}

export async function addProductImage(productId: string, url: string, altText: string, sortOrder: number): Promise<{ id: string }> {
  return getProductRepository().addProductImage(productId, url, altText, sortOrder);
}

export async function deleteProductImage(imageId: string): Promise<void> {
  return getProductRepository().deleteProductImage(imageId);
}
