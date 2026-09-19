import type { Product } from "@/lib/types";

export function getDiscountPercent(product: Pick<Product, "price" | "mrp">): number {
  if (product.mrp <= product.price) return 0;
  return Math.round(((product.mrp - product.price) / product.mrp) * 100);
}
