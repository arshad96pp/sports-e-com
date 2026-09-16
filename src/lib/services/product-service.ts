import "server-only";
import { cache } from "react";
import { getProductRepository } from "@/lib/config/providers";
import { getDiscountPercent } from "@/lib/data/products";
import type { CategorySlug, Product } from "@/lib/types";
import type {
  AdminProductDetail,
  AdminProductListItem,
  ProductFilterOptions,
  ProductFormValues,
  ProductQueryParams,
  ProductQueryResult,
} from "@/lib/core/ports/product.repository";

export type { ProductFilterOptions, ProductFormValues, ProductQueryParams, ProductQueryResult };
export type { AdminProductDetail, AdminProductListItem };

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return getProductRepository().getProductsByIds(ids);
}

export async function getAllProducts(): Promise<Product[]> {
  return getProductRepository().getAllProducts();
}

export async function getAllProductSlugs(): Promise<string[]> {
  return getProductRepository().getAllProductSlugs();
}

/**
 * Wrapped in `React.cache` because `generateMetadata` and the page component
 * both need the same product and Supabase reads aren't auto-deduped like
 * `fetch` is — this collapses the two into one query per request.
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | undefined> => {
  return getProductRepository().getProductBySlug(slug);
});

export async function getProductById(id: string): Promise<Product | undefined> {
  return getProductRepository().getProductById(id);
}

export async function getProductsByCategory(category: CategorySlug): Promise<Product[]> {
  return getProductRepository().getProductsByCategory(category);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return getProductRepository().getFeaturedProducts(limit);
}

export async function getBestSellers(limit = 12): Promise<Product[]> {
  return getProductRepository().getBestSellers(limit);
}

/** Business rule: a "deal" is anything flagged `dealOfTheDay`, or discounted 25%+; flagged deals sort first, then by discount. */
export async function getDealProducts(limit = 8): Promise<Product[]> {
  const products = await getProductRepository().getRecentProducts(200);
  return products
    .filter((p) => p.dealOfTheDay || getDiscountPercent(p) >= 25)
    .sort((a, b) => Number(b.dealOfTheDay) - Number(a.dealOfTheDay) || getDiscountPercent(b) - getDiscountPercent(a))
    .slice(0, limit);
}

export async function getRelatedProducts(product: Pick<Product, "id" | "category">, limit = 4): Promise<Product[]> {
  return getProductRepository().getRelatedProducts(product, limit);
}

export async function getFrequentlyBoughtWith(
  product: Pick<Product, "id" | "category" | "subcategory">,
  limit = 3
): Promise<Product[]> {
  return getProductRepository().getFrequentlyBoughtWith(product, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  return getProductRepository().searchProducts(query);
}

export { getDiscountPercent };

export async function getProductFilterOptions(category?: CategorySlug): Promise<ProductFilterOptions> {
  return getProductRepository().getProductFilterOptions(category);
}

export async function queryProducts(params: ProductQueryParams): Promise<ProductQueryResult> {
  return getProductRepository().queryProducts(params);
}
