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

/**
 * Never trust variant data from the client at face value — re-checked here
 * even though the `sync_product_variants` RPC also validates server-side,
 * so a bad submission fails fast with a specific message instead of a
 * generic RPC error.
 */
function assertValidVariants(values: ProductFormValues): void {
  const seenSizes = new Set<string>();
  for (const variant of values.variants) {
    const size = variant.size.trim();
    if (!size) throw new Error("Every variant needs a size.");
    const key = size.toLowerCase();
    if (seenSizes.has(key)) throw new Error(`Duplicate size "${size}" — each size can only be added once.`);
    seenSizes.add(key);
    const hasPrice = Number.isFinite(variant.price) && variant.price > 0;
    const hasMrp = Number.isFinite(variant.mrp) && variant.mrp > 0;
    const hasStock = Number.isFinite(variant.stock) && variant.stock >= 0;
    if (!hasPrice || !hasMrp || !hasStock) {
      throw new Error(`Please enter price, MRP and stock for ${size}.`);
    }
    if (variant.price > variant.mrp) {
      throw new Error(`Price cannot be higher than MRP for ${size}.`);
    }
  }
}

export async function createProduct(values: ProductFormValues, options?: { autoSku?: boolean }): Promise<{ id: string }> {
  assertValidPricing(values);
  assertValidVariants(values);
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
  assertValidVariants(values);
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
