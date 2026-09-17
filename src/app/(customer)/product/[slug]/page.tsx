import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/repositories/product-repository";
import { getReviewsForProduct } from "@/lib/repositories/review-repository";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/structured-data";
import { formatPrice } from "@/lib/utils/format";
import { getDiscountPercent } from "@/lib/data/products";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const discount = getDiscountPercent(product);
  const description = `${product.shortInfo} — ${formatPrice(product.price)}${
    discount > 0 ? ` (${discount}% off ${formatPrice(product.mrp)})` : ""
  }. ${product.description}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/product/${product.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
    },
  };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product),
    getReviewsForProduct(product.id),
  ]);

  const categoryLabel = product.category === "other-accessories" ? "Other Accessories" : product.subcategory;

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: categoryLabel, path: `/category/${product.category}` },
          { name: product.name, path: `/product/${product.slug}` },
        ])}
      />
      <ProductDetailClient product={product} related={related} reviews={reviews} />
    </>
  );
}
