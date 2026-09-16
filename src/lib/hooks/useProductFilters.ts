import type { SortOption } from "@/lib/types";

/**
 * Shared filter vocabulary for the product listing UI (FilterPanel,
 * FilterSidebar, FilterDrawer, SortSelect, PriceRangeFilter). The actual
 * filtering/sorting/pagination happens server-side in `queryProducts`, driven
 * by URL search params via `useProductFilterParams` — this module only holds
 * the types and constants those pieces share, so none of them needed to
 * change when filtering moved from in-memory to server-side.
 */
export type PriceBounds = [number, number];

export const RATING_BUCKETS = [4, 3];
export const DISCOUNT_BUCKETS = [10, 20, 30, 50];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "discount", label: "Discount" },
  { value: "rating", label: "Customer Rating" },
];

export interface FilterState {
  priceRange: PriceBounds | null;
  subcategories: string[];
  brands: string[];
  sports: string[];
  productTypes: string[];
  colors: string[];
  sizes: string[];
  ratings: number[];
  discounts: number[];
  inStockOnly: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  priceRange: null,
  subcategories: [],
  brands: [],
  sports: [],
  productTypes: [],
  colors: [],
  sizes: [],
  ratings: [],
  discounts: [],
  inStockOnly: false,
};

export function countActiveFilters(filters: FilterState): number {
  return (
    (filters.priceRange ? 1 : 0) +
    filters.subcategories.length +
    filters.brands.length +
    filters.sports.length +
    filters.productTypes.length +
    filters.colors.length +
    filters.sizes.length +
    filters.ratings.length +
    filters.discounts.length +
    (filters.inStockOnly ? 1 : 0)
  );
}
