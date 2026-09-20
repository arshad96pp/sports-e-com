import type { Metadata } from "next";
import { queryProducts, getProductFilterOptions, type ProductQueryResult } from "@/lib/services/product-service";
import { ProductListing } from "@/components/product/ProductListing";
import { parseFiltersFromSearchParams, filtersToQueryParams, searchParamsToURLSearchParams } from "@/lib/utils/product-filter-params";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Search",
  description: `Search ${STORE.name}'s catalogue of football, cricket, tennis and multi-sport accessories.`,
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";

  const { filters, sort, page } = parseFiltersFromSearchParams(searchParamsToURLSearchParams(searchParams));

  const emptyResult: ProductQueryResult = { products: [], total: 0, page: 1, pageSize: 24, pageCount: 1 };
  const [{ products, total, pageCount }, filterOptions] = q.trim()
    ? await Promise.all([queryProducts({ search: q, ...filtersToQueryParams(filters, sort, page) }), getProductFilterOptions()])
    : ([emptyResult, await getProductFilterOptions()] as const);

  return (
    <ProductListing
      products={products}
      total={total}
      page={page}
      pageCount={pageCount}
      filterOptions={filterOptions}
      title={q ? `Search results for "${q}"` : "Search"}
      description={q ? undefined : "Try searching for a product, brand or category."}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
      emptyLabel={q ? `No products found for "${q}"` : "Start typing to search our catalogue"}
      hideFilters={!q.trim()}
    />
  );
}
