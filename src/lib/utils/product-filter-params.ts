import type { SortOption } from "@/lib/types";
import { EMPTY_FILTERS, type FilterState } from "@/lib/hooks/useProductFilters";

function parseList(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

function parseNumberList(value: string | null): number[] {
  return parseList(value).map(Number).filter((n) => !Number.isNaN(n));
}

/**
 * Shared by the client-side filter hook and every server-rendered listing
 * page, so the URL query-param scheme (`sort`, `price`, `sub`, `brand`, …) is
 * defined in exactly one place.
 */
export function parseFiltersFromSearchParams(params: URLSearchParams): {
  filters: FilterState;
  sort: SortOption;
  page: number;
} {
  const priceRaw = params.get("price");
  const [min, max] = priceRaw ? priceRaw.split("-").map(Number) : [NaN, NaN];

  const filters: FilterState = {
    ...EMPTY_FILTERS,
    priceRange: !Number.isNaN(min) && !Number.isNaN(max) ? [min, max] : null,
    subcategories: parseList(params.get("sub")),
    brands: parseList(params.get("brand")),
    sports: parseList(params.get("sport")),
    productTypes: parseList(params.get("type")),
    colors: parseList(params.get("color")),
    sizes: parseList(params.get("size")),
    ratings: parseNumberList(params.get("rating")),
    discounts: parseNumberList(params.get("discount")),
    inStockOnly: params.get("stock") === "1",
  };

  const sort = (params.get("sort") as SortOption | null) ?? "recommended";
  const page = Math.max(1, Number(params.get("page")) || 1);

  return { filters, sort, page };
}

/** Builds the params object `queryProducts` expects from a parsed `FilterState`. */
export function filtersToQueryParams(filters: FilterState, sort: SortOption, page: number) {
  return {
    subcategories: filters.subcategories.length ? filters.subcategories : undefined,
    brands: filters.brands.length ? filters.brands : undefined,
    productTypes: filters.productTypes.length ? filters.productTypes : undefined,
    colors: filters.colors.length ? filters.colors : undefined,
    sizes: filters.sizes.length ? filters.sizes : undefined,
    minRating: filters.ratings.length ? Math.min(...filters.ratings) : undefined,
    minDiscount: filters.discounts.length ? Math.min(...filters.discounts) : undefined,
    inStockOnly: filters.inStockOnly || undefined,
    priceMin: filters.priceRange?.[0],
    priceMax: filters.priceRange?.[1],
    sort,
    page,
  };
}

/** Converts a Next.js `PageProps` `searchParams` object (already awaited) into `URLSearchParams`. */
export function searchParamsToURLSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): URLSearchParams {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") usp.set(key, value);
    else if (Array.isArray(value) && value[0] !== undefined) usp.set(key, value[0]);
  }
  return usp;
}
