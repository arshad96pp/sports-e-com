import type { Metadata } from "next";
import { queryProducts, getProductFilterOptions } from "@/lib/services/product-service";
import { getCategoryBySlug } from "@/lib/repositories/category-repository";
import { ProductListing } from "@/components/product/ProductListing";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { parseFiltersFromSearchParams, filtersToQueryParams, searchParamsToURLSearchParams } from "@/lib/utils/product-filter-params";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Shop All",
  description: `Browse ${STORE.name}'s full catalogue of football, cricket, tennis and multi-sport accessories.`,
  alternates: { canonical: "/products" },
  robots: { index: false, follow: true },
};

/**
 * Generic catalogue listing behind `/products`, shared by every "View All"
 * link that isn't a single category's own `/category/[slug]` page:
 * `?featured=true` (Featured Products), `?bestSeller=true` (Best Sellers),
 * `?deal=true` (Special Picks/deals) and `?category=<slug>` — each a mixed,
 * cross-category set by design, never narrowed to one category unless
 * `category` is also given.
 */
export default async function ProductsPage(props: PageProps<"/products">) {
  const searchParams = await props.searchParams;
  const featured = searchParams.featured === "true";
  const bestSeller = searchParams.bestSeller === "true";
  const deal = searchParams.deal === "true";
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : undefined;

  const { filters, sort, page } = parseFiltersFromSearchParams(searchParamsToURLSearchParams(searchParams));
  const category = categorySlug ? await getCategoryBySlug(categorySlug) : undefined;

  const [{ products, total, pageCount }, filterOptions] = await Promise.all([
    queryProducts({
      category: category?.slug,
      featured: featured || undefined,
      bestSeller: bestSeller || undefined,
      dealOfTheDay: deal || undefined,
      ...filtersToQueryParams(filters, sort, page),
    }),
    getProductFilterOptions(category?.slug),
  ]);

  const title = category
    ? category.name
    : featured
      ? "Featured Products"
      : bestSeller
        ? "Best Sellers"
        : deal
          ? "Special Picks"
          : "All Products";
  const description = category
    ? category.listingBlurb
    : featured
      ? "Popular picks across football, cricket, tennis and more."
      : bestSeller
        ? "Our most-loved gear, chosen by fellow players."
        : deal
          ? "Selected gear. Better prices."
          : undefined;
  const emptyLabel = category
    ? `No ${category.name.toLowerCase()} match your filters`
    : featured || bestSeller || deal
      ? `No ${title.toLowerCase()} match your filters`
      : "No products match your filters";

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: title, path: "/products" }])} />
      <ProductListing
        products={products}
        total={total}
        page={page}
        pageCount={pageCount}
        filterOptions={filterOptions}
        title={title}
        description={description}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
        emptyLabel={emptyLabel}
      />
    </>
  );
}
