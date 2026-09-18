import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

export function HomeProductRail({
  products,
  priorityCount = 0,
}: {
  products: Product[];
  priorityCount?: number;
}) {
  return (
    <div className="mt-8 flex gap-4 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 sm:snap-none lg:grid-cols-4">
      {products.map((product, i) => (
        <div key={product.id} className="w-[70%] shrink-0 snap-start sm:w-auto sm:min-w-0">
          <ProductCard product={product} priority={i < priorityCount} />
        </div>
      ))}
    </div>
  );
}
