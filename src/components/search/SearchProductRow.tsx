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

/** Compact horizontal product card used in the search overlay's scrollable strips. */
export function SearchProductRow({ product, onNavigate }: SearchProductRowProps) {
  const { addItem } = useCart();

  return (
    <div className="flex w-64 shrink-0 snap-start flex-col gap-2 rounded-xl border border-border p-2.5 sm:w-60">
      <Link href={`/product/${product.slug}`} onClick={onNavigate} className="flex items-start gap-2.5">
        <ProductPhoto product={product} className="h-16 w-16 shrink-0 rounded-lg" sizes="64px" />
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
          className="h-8 w-8 shrink-0 rounded-full"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
