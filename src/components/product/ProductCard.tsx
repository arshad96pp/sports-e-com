"use client";

import Link from "next/link";
import { Eye, ShoppingCart } from "lucide-react";
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
    <Link href={`/product/${product.slug}`} className="product-card group relative z-0 block h-full">
      <Card className="product-card-surface h-full gap-0 overflow-hidden rounded-[12px] border border-[#EAEAEA] bg-white p-0 py-0 shadow-none ring-0">
        <div className="relative aspect-square w-full overflow-hidden bg-[#F7F7F5]">
          <ProductPhoto
            product={product}
            className="absolute inset-0 h-full w-full"
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
            priority={priority}
            fit="contain"
            studio
            imageClassName="p-6 [transition:transform_300ms_ease] group-hover:scale-[1.03]"
          />

          <div className="absolute left-2 top-2 flex flex-col gap-1">
            <DiscountBadge
              percent={discount}
              className="rounded-md bg-[#C45C42] px-1.5 py-px text-[9px] font-medium tracking-[0.06em] text-white shadow-none"
            />
            {product.newArrival && (
              <Badge className="h-auto rounded-md border border-[#EAEAEA] bg-white px-1.5 py-px text-[9px] font-medium tracking-[0.14em] text-[#8A8A86] shadow-none">
                NEW
              </Badge>
            )}
          </div>

          <WishlistHeartButton
            productId={product.id}
            className="absolute right-2 top-2 h-7 w-7 border border-[#EAEAEA] bg-white shadow-none backdrop-blur-none transition-colors duration-200 hover:border-[#D0D0D0] hover:bg-white"
          />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openQuickView(product);
            }}
            className="absolute inset-x-2.5 bottom-2.5 hidden items-center justify-center gap-1.5 rounded-md border border-[#EAEAEA] bg-white/95 py-1.5 text-[10px] font-medium tracking-wide text-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex"
          >
            <Eye className="h-3 w-3" />
            Quick View
          </button>
        </div>

        <CardContent className="flex flex-1 flex-col gap-1.5 p-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A8A86]">
            {product.brand}
          </span>
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-[1.35] tracking-[-0.01em] text-ink">
            {product.name}
          </h3>
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} tone="card" />
          <PriceBlock price={product.price} mrp={product.mrp} tone="card" className="mt-0.5" />

          <div className="mt-auto">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(product.id, { size: product.sizes[0] ?? null, productName: product.name });
              }}
              className="tap-target mt-2 w-full gap-1.5 rounded-[8px] border-[#EAEAEA] bg-white text-[12px] font-medium tracking-wide text-ink shadow-none transition-[background-color,border-color] duration-200 ease-out hover:border-[#D0D0D0] hover:bg-[#F7F7F5] hover:text-ink"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
