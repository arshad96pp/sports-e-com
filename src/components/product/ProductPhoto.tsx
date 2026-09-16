import Image from "next/image";
import type { Product } from "@/lib/types";
import { ProductArt } from "@/components/product/ProductArt";

interface ProductPhotoProps {
  product: Pick<Product, "id" | "category" | "name" | "images">;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/** A product's primary photo, falling back to the generated icon art for products with no uploaded images yet. */
export function ProductPhoto({ product, className = "", sizes = "400px", priority = false }: ProductPhotoProps) {
  const photo = product.images[0];
  if (!photo) return <ProductArt product={product} className={className} />;

  // `fill` needs a positioned ancestor. Callers sometimes pass their own
  // "absolute inset-0 …" (to overlay a sibling badge/button in an already-
  // `relative` parent, matching how <ProductArt> is used) — in that case
  // don't also add `relative`, which would win the position property in
  // Tailwind's cascade and break the overlay.
  const needsRelative = !/\babsolute\b/.test(className);
  return (
    <div className={`overflow-hidden ${needsRelative ? "relative " : ""}${className}`}>
      <Image src={photo.url} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
