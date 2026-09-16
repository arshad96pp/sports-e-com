"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SortOption } from "@/lib/types";
import { countActiveFilters, type PriceBounds } from "@/lib/hooks/useProductFilters";
import { parseFiltersFromSearchParams } from "@/lib/utils/product-filter-params";

/**
 * URL-search-param-backed equivalent of `useProductFilters` — same
 * `filters`/`sort`/`actions` shape (so FilterPanel/FilterSidebar/FilterDrawer/
 * SortSelect/PriceRangeFilter need no changes at all), but every change
 * navigates instead of touching local state, so the actual filtering/sorting/
 * pagination happens in the server-rendered page via `queryProducts`.
 */
export function useProductFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { filters, sort, page } = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);

  const navigate = useCallback(
    (mutate: (params: URLSearchParams) => void, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
      if (resetPage) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  function setList(key: string, values: string[]) {
    navigate((params) => {
      if (values.length === 0) params.delete(key);
      else params.set(key, values.join(","));
    });
  }

  function toggleInList(key: string, current: string[], value: string) {
    setList(key, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  }

  function toggleInNumberList(key: string, current: number[], value: number) {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    navigate((params) => {
      if (next.length === 0) params.delete(key);
      else params.set(key, next.join(","));
    });
  }

  const actions = {
    setPriceRange: (range: PriceBounds | null) =>
      navigate((params) => {
        if (!range) params.delete("price");
        else params.set("price", `${range[0]}-${range[1]}`);
      }),
    toggleSubcategory: (value: string) => toggleInList("sub", filters.subcategories, value),
    toggleBrand: (value: string) => toggleInList("brand", filters.brands, value),
    toggleSport: (value: string) => toggleInList("sport", filters.sports, value),
    toggleProductType: (value: string) => toggleInList("type", filters.productTypes, value),
    toggleColor: (value: string) => toggleInList("color", filters.colors, value),
    toggleSize: (value: string) => toggleInList("size", filters.sizes, value),
    toggleRating: (value: number) => toggleInNumberList("rating", filters.ratings, value),
    toggleDiscount: (value: number) => toggleInNumberList("discount", filters.discounts, value),
    toggleInStockOnly: () =>
      navigate((params) => {
        if (filters.inStockOnly) params.delete("stock");
        else params.set("stock", "1");
      }),
    clearAll: () =>
      navigate((params) => {
        for (const key of ["price", "sub", "brand", "sport", "type", "color", "size", "rating", "discount", "stock"]) {
          params.delete(key);
        }
      }),
  };

  const setSort = (value: SortOption) =>
    navigate((params) => {
      if (value === "recommended") params.delete("sort");
      else params.set("sort", value);
    });

  const setPage = (value: number) =>
    navigate((params) => {
      if (value <= 1) params.delete("page");
      else params.set("page", String(value));
    }, false);

  return { filters, sort, setSort, page, setPage, activeCount: countActiveFilters(filters), actions };
}
