"use client";

import { useState } from "react";
import { SlidersHorizontal, SearchX } from "lucide-react";
import type { Crumb } from "@/components/common/Breadcrumbs";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { useProductFilterParams } from "@/lib/hooks/useProductFilterParams";
import type { ProductFilterOptions } from "@/lib/services/product-service";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { FilterDrawer } from "@/components/filters/FilterDrawer";
import { SortSelect } from "@/components/filters/SortSelect";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/product/Pagination";
import type { Product } from "@/lib/types";

interface ProductListingProps {
  products: Product[];
  total: number;
  page: number;
  pageCount: number;
  filterOptions: ProductFilterOptions;
  title: string;
  description?: string;
  breadcrumbs: Crumb[];
  emptyLabel?: string;
}

export function ProductListing({
  products,
  total,
  page,
  pageCount,
  filterOptions,
  title,
  description,
  breadcrumbs,
  emptyLabel = "No products match your filters",
}: ProductListingProps) {
  const { filters, sort, setSort, setPage, activeCount, actions } = useProductFilterParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const priceBounds: [number, number] = [filterOptions.priceMin, Math.max(filterOptions.priceMax, filterOptions.priceMin + 50)];
  const options = {
    subcategories: filterOptions.subcategories,
    brands: filterOptions.brands,
    sports: filterOptions.sports,
    productTypes: filterOptions.productTypes,
    colors: filterOptions.colors,
    sizes: filterOptions.sizes,
  };

  return (
    <div className="container-app py-4 sm:py-6">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-3 mb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
        <p className="mt-2 text-xs font-medium text-muted-soft">
          {total} {total === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="flex gap-6">
        <FilterSidebar
          filters={filters}
          priceBounds={priceBounds}
          options={options}
          actions={actions}
          activeCount={activeCount}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="tap-target flex items-center gap-1.5 rounded-full border border-border-strong px-3.5 text-xs font-semibold text-ink sm:px-4 sm:text-sm lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-ink">
                  {activeCount}
                </span>
              )}
            </button>
            <SortSelect value={sort} onChange={setSort} />
          </div>

          {products.length > 0 ? (
            <>
              <ProductGrid products={products} priority />
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-20 text-center">
              <SearchX className="mb-4 h-10 w-10 text-muted-soft" strokeWidth={1.5} />
              <p className="font-medium text-ink">{emptyLabel}</p>
              <button
                type="button"
                onClick={actions.clearAll}
                className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        priceBounds={priceBounds}
        options={options}
        actions={actions}
        resultCount={total}
      />
    </div>
  );
}
