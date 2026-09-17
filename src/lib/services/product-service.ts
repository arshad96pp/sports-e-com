import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
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

/**
 * Home-page/listing product sets are public and don't need per-second
 * freshness — cached the same way as `getAllCategories`: `revalidate: 120`
 * as a safety net, `revalidateTag("products", { expire: 0 })` from admin
 * product actions for instant invalidation on create/update/delete.
 */
export const getFeaturedProducts = unstable_cache(
  async (limit = 8): Promise<Product[]> => getProductRepository().getFeaturedProducts(limit),
  ["products:featured"],
  { tags: ["products"], revalidate: 120 }
);

export const getBestSellers = unstable_cache(
  async (limit = 12): Promise<Product[]> => getProductRepository().getBestSellers(limit),
  ["products:best-sellers"],
  { tags: ["products"], revalidate: 120 }
);

/**
 * Business rule: a "deal" is anything flagged `dealOfTheDay`, or discounted
 * 25%+; flagged deals sort first, then by discount. Flagged deals are a
 * direct, cheap DB query; the discount-based fallback only runs (and only
 * scans a bounded 60-row pool, not the whole catalog) when flagged deals
 * don't fill the requested count.
 */
export const getDealProducts = unstable_cache(
  async (limit = 8): Promise<Product[]> => {
    const repo = getProductRepository();
    const flagged = await repo.getDealOfTheDayProducts(limit);
    if (flagged.length >= limit) return flagged;

    const pool = await repo.getRecentProducts(60);
    const flaggedIds = new Set(flagged.map((p) => p.id));
    const discounted = pool
      .filter((p) => !flaggedIds.has(p.id) && !p.dealOfTheDay && getDiscountPercent(p) >= 25)
      .sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));

    return [...flagged, ...discounted].slice(0, limit);
  },
  ["products:deals"],
  { tags: ["products"], revalidate: 120 }
);

export async function getRelatedProducts(product: Pick<Product, "id" | "category">, limit = 4): Promise<Product[]> {
  return getProductRepository().getRelatedProducts(product, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  return getProductRepository().searchProducts(query);
}

export { getDiscountPercent };

/** Aggregate facet scan over every active (category-scoped) product — expensive, cached like the rest of the public catalog reads above. */
export const getProductFilterOptions = unstable_cache(
  async (category?: CategorySlug): Promise<ProductFilterOptions> =>
    getProductRepository().getProductFilterOptions(category),
  ["products:filter-options"],
  { tags: ["products"], revalidate: 120 }
);

export async function queryProducts(params: ProductQueryParams): Promise<ProductQueryResult> {
  return getProductRepository().queryProducts(params);
}
