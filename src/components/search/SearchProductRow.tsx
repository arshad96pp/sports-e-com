"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import { RatingStars } from "@/components/ui/RatingStars";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/context/CartContext";

interface SearchProductRowProps {
  product: Product;
  onNavigate: () => void;
}

/** Compact product card used in the search overlay's result grids. */
export function SearchProductRow({ product, onNavigate }: SearchProductRowProps) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col gap-2 rounded-2xl border border-border p-2.5 transition-all hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-lg hover:shadow-ink/5">
      <Link href={`/product/${product.slug}`} onClick={onNavigate} className="flex items-start gap-2.5">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          <ProductPhoto
            product={product}
            className="h-16 w-16 shrink-0 transition-transform duration-300 group-hover:scale-110"
            sizes="64px"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{product.brand}</p>
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{product.name}</p>
          <div className="mt-1">
            <RatingStars rating={product.rating} showCount={false} size="sm" />
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2">
        <PriceBlock price={product.price} mrp={product.mrp} size="sm" />
        <Button
          size="icon-sm"
          aria-label="Add to cart"
          onClick={() => addItem(product.id, { size: product.sizes[0] ?? null, productName: product.name })}
          className="h-8 w-8 shrink-0 rounded-full transition-transform hover:scale-105"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
