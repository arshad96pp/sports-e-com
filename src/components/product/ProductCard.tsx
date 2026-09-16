"use client";

import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { getDiscountPercent } from "@/lib/data/products";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import { RatingStars } from "@/components/ui/RatingStars";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { DiscountBadge } from "@/components/ui/DiscountBadge";
import { WishlistHeartButton } from "@/components/ui/WishlistHeartButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/context/CartContext";
import { useQuickView } from "@/lib/context/QuickViewContext";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { openQuickView } = useQuickView();
  const discount = getDiscountPercent(product);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <Card className="gap-0 overflow-hidden rounded-xl border border-border bg-white p-0 py-0 ring-0 transition-shadow duration-200 hover:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.18)]">
        <div className="relative aspect-square w-full overflow-hidden">
          <ProductPhoto
            product={product}
            className="absolute inset-0 h-full w-full"
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
            priority={priority}
          />

          <div className="absolute left-2 top-2 flex flex-col gap-1">
            <DiscountBadge percent={discount} />
            {product.newArrival && (
              <Badge className="h-auto rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-bold text-accent">
                NEW
              </Badge>
            )}
          </div>

          <WishlistHeartButton productId={product.id} className="absolute right-2 top-2 shadow-sm" />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openQuickView(product);
            }}
            className="absolute inset-x-2 bottom-2 hidden translate-y-2 items-center justify-center gap-1.5 rounded-full bg-white/95 py-2 text-xs font-semibold text-ink opacity-0 shadow-sm backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:flex"
          >
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </button>
        </div>

        <CardContent className="flex flex-1 flex-col gap-1.5 p-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
            {product.brand}
          </span>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{product.name}</h3>
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          <PriceBlock price={product.price} mrp={product.mrp} className="mt-0.5" />

          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem(product.id, { size: product.sizes[0] ?? null, productName: product.name });
            }}
            className="tap-target mt-2 w-full gap-1.5 rounded-full border-ink text-xs font-semibold text-ink hover:bg-ink hover:text-white"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
