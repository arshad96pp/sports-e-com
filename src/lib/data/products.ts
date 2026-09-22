import type { Product } from "@/lib/types";

export function getDiscountPercent(product: Pick<Product, "price" | "mrp">): number {
  if (product.mrp <= product.price) return 0;
  return Math.round(((product.mrp - product.price) / product.mrp) * 100);
}

/**
 * The authoritative price for a specific variant selection — the frontend
 * never computes this on its own. Falls back to the product's base price
 * when there's no variant (or the requested one is no longer available,
 * e.g. an admin removed it after it was added to a cart).
 */
export function resolveVariantPrice(product: Pick<Product, "price" | "variants">, variantId: string | null): number {
  if (!variantId) return product.price;
  return product.variants.find((v) => v.id === variantId)?.price ?? product.price;
}

/** Same as `resolveVariantPrice`, for the variant's own MRP (used for the discount display). */
export function resolveVariantMrp(product: Pick<Product, "mrp" | "variants">, variantId: string | null): number {
  if (!variantId) return product.mrp;
  return product.variants.find((v) => v.id === variantId)?.mrp ?? product.mrp;
}

/** The cheapest variant, if any — what a "From ₹X" listing price and its quick-add button refer to. */
export function getCheapestVariant(product: Pick<Product, "variants">) {
  if (product.variants.length === 0) return null;
  return product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
}

/** Lowest variant price — what listing/card contexts show as "From ₹X" for a variant product. */
export function getFromPrice(product: Pick<Product, "price" | "variants">): number {
  return getCheapestVariant(product)?.price ?? product.price;
}
