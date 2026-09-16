import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllCategories, getCategoryBySlug } from "@/lib/repositories/category-repository";
import { queryProducts, getProductFilterOptions } from "@/lib/services/product-service";
import { ProductListing } from "@/components/product/ProductListing";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { parseFiltersFromSearchParams, filtersToQueryParams, searchParamsToURLSearchParams } from "@/lib/utils/product-filter-params";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: category.name,
      description: category.description,
      url: `/category/${category.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description: category.description,
    },
  };
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { filters, sort, page } = parseFiltersFromSearchParams(searchParamsToURLSearchParams(searchParams));

  const [{ products, total, pageCount }, filterOptions] = await Promise.all([
    queryProducts({ category: category.slug, ...filtersToQueryParams(filters, sort, page) }),
    getProductFilterOptions(category.slug),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: category.name, path: `/category/${category.slug}` },
        ])}
      />
      <ProductListing
        products={products}
        total={total}
        page={page}
        pageCount={pageCount}
        filterOptions={filterOptions}
        title={category.name}
        description={category.listingBlurb}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: category.name }]}
        emptyLabel={`No ${category.name.toLowerCase()} match your filters`}
      />
    </>
  );
}
