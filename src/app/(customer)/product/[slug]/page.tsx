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
import { getDiscountPercent, getFromPrice } from "@/lib/data/products";
import { sanitizeDescriptionHtml, descriptionToPlainText } from "@/lib/utils/sanitize-html";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const hasVariants = product.variants.length > 0;
  const discount = hasVariants ? 0 : getDiscountPercent(product);
  const priceLabel = hasVariants ? `from ${formatPrice(getFromPrice(product))}` : formatPrice(product.price);
  const description = `${product.shortInfo} — ${priceLabel}${
    discount > 0 ? ` (${discount}% off ${formatPrice(product.mrp)})` : ""
  }. ${descriptionToPlainText(product.description)}`;

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
  // Defense-in-depth re-sanitization at render time — the description is
  // already sanitized when the admin saves it (see admin-product-service.ts),
  // this just guarantees the storefront never trusts a raw DB value.
  const safeDescriptionHtml = sanitizeDescriptionHtml(product.description);

  return (
    <>
      <JsonLd data={productJsonLd({ ...product, description: descriptionToPlainText(product.description) })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: categoryLabel, path: `/category/${product.category}` },
          { name: product.name, path: `/product/${product.slug}` },
        ])}
      />
      <ProductDetailClient
        product={{ ...product, description: safeDescriptionHtml }}
        related={related}
        reviews={reviews}
      />
    </>
  );
}
