"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { getCheapestVariant } from "@/lib/data/products";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import { formatPrice } from "@/lib/utils/format";

interface SearchProductRowProps {
  product: Product;
  onNavigate: () => void;
  /** Staggers this row's entrance animation — pass the row's index in the list. */
  index?: number;
}

/** Dark, editorial-style result row used by the search overlay — image, brand, name, price. */
export function SearchProductRow({ product, onNavigate, index = 0 }: SearchProductRowProps) {
  const cheapestVariant = getCheapestVariant(product);
  const hasVariants = product.variants.length > 0;
  const price = cheapestVariant?.price ?? product.price;
  const mrp = cheapestVariant?.mrp ?? product.mrp;
  const hasDiscount = mrp > price;

  return (
    <Link
      href={`/product/${product.slug}`}
      onClick={onNavigate}
      className="group flex animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-3 transition-all duration-300 hover:border-white/10 hover:bg-white/10 sm:gap-6 sm:p-4"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg transition-transform duration-500 group-hover:scale-105 sm:h-20 sm:w-20 md:h-24 md:w-24">
        <ProductPhoto
          product={product}
          className="absolute inset-0 h-full w-full"
          imageClassName="opacity-80 transition-opacity group-hover:opacity-100"
          sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="mb-1 text-[10px] font-bold tracking-widest text-accent uppercase">{product.brand}</p>
        <h3 className="truncate text-base font-light text-white sm:text-lg">{product.name}</h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          {hasVariants && <span className="text-[10px] font-medium text-white/50">From</span>}
          <span className="text-sm font-semibold text-white">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-xs text-white/40 line-through">{formatPrice(mrp)}</span>
          )}
        </div>
      </div>

      <ArrowRight className="h-5 w-5 shrink-0 text-white/50 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
