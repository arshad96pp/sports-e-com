"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { getDiscountPercent } from "@/lib/data/products";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { RatingStars } from "@/components/ui/RatingStars";
import { WishlistHeartButton } from "@/components/ui/WishlistHeartButton";
import { useCart } from "@/lib/context/CartContext";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const discount = getDiscountPercent(product);

  return (
    <Link href={`/product/${product.slug}`} className="product-card group relative z-0 block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/50 bg-white shadow-[0_1px_3px_rgba(16,24,32,0.04)] transition-shadow duration-300 ease-out hover:shadow-[0_6px_20px_-10px_rgba(16,24,32,0.14)]">
        <div className="product-card-image relative aspect-square overflow-hidden bg-[#F5F5F3]">
          <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.04]">
            <ProductPhoto
              product={product}
              className="absolute inset-0 h-full w-full"
              sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 70vw"
              priority={priority}
              fit="cover"
              studio
              swapOnHover
            />
          </div>

          {discount > 0 && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-signal px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
              {discount}% OFF
            </span>
          )}

          <WishlistHeartButton
            productId={product.id}
            className="absolute right-2.5 top-2.5 z-10 h-8 w-8 rounded-full border border-border/60 bg-white/95 shadow-sm backdrop-blur-none"
          />
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
          <h3 className="line-clamp-2 min-h-[2.6em] text-[13.5px] font-medium leading-snug text-ink sm:text-sm">
            {product.name}
          </h3>

          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <RatingStars rating={product.rating} tone="card" showCount={false} />
            <span
              className={
                product.inStock
                  ? "shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[9px] font-semibold tracking-wide text-success uppercase"
                  : "shrink-0 rounded-full bg-signal-soft px-2 py-0.5 text-[9px] font-semibold tracking-wide text-signal uppercase"
              }
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1 pt-1">
            <PriceBlock price={product.price} mrp={product.mrp} tone="card" />

            <button
              type="button"
              aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
              disabled={!product.inStock}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(product.id, { size: product.sizes[0] ?? null, productName: product.name });
              }}
              className="flex h-8 w-8 cursor-pointer shrink-0 items-center justify-center rounded-full border border-ink bg-ink text-white shadow-[0_1px_4px_rgba(16,24,32,0.08)] transition-all duration-200 ease-out hover:border-accent hover:bg-accent hover:text-accent-ink hover:shadow-[0_2px_10px_rgba(16,24,32,0.14)] active:scale-95 disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-border-strong disabled:text-muted-soft disabled:hover:border-border-strong disabled:hover:bg-border-strong disabled:hover:text-muted-soft sm:h-10 sm:w-10"
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
