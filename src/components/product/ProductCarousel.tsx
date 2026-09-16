"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductCarousel({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-2 md:gap-4"
      >
        {products.map((product) => (
          <div key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[32%] md:w-[23%] lg:w-[19%]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className="absolute -left-3 top-1/3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-md transition-transform hover:scale-105 lg:flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className="absolute -right-3 top-1/3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-md transition-transform hover:scale-105 lg:flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
