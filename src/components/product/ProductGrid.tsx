import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

interface ProductGridProps {
  products: Product[];
  /**
   * Only pass `true` from a grid that's actually above the fold (e.g. the
   * first product section on the home page) — this competes with the hero
   * image for browser preload bandwidth, so marking a below-the-fold grid
   * (deals, listing pages) priority hurts LCP instead of helping it.
   */
  priority?: boolean;
}

export function ProductGrid({ products, priority = false }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={priority && i < 4} />
      ))}
    </div>
  );
}
