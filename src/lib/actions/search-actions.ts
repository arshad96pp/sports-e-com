"use server";

import { getBestSellers, getFeaturedProducts, searchProducts } from "@/lib/services/product-service";
import { searchCategories } from "@/lib/services/category-service";
import type { Product } from "@/lib/types";

export interface SearchCategoryHit {
  slug: string;
  name: string;
}

export interface SearchSuggestions {
  products: Product[];
  categories: SearchCategoryHit[];
}

/** Powers the search overlay's live results — runs an ILIKE query in the database, never fetches the full catalogue to filter client-side. */
export async function searchSuggestionsAction(query: string): Promise<SearchSuggestions> {
  const [products, categories] = await Promise.all([searchProducts(query), searchCategories(query)]);
  return { products, categories: categories.map((c) => ({ slug: c.slug, name: c.name })) };
}

export interface SearchIdleContent {
  bestSellers: Product[];
  curatedForYou: Product[];
}

/** The overlay's default (no query yet) content — bestsellers + featured picks. */
export async function getSearchIdleContentAction(): Promise<SearchIdleContent> {
  const [bestSellers, curatedForYou] = await Promise.all([getBestSellers(8), getFeaturedProducts(8)]);
  return { bestSellers, curatedForYou };
}
