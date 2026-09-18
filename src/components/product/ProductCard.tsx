"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { getDiscountPercent } from "@/lib/data/products";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import { PriceBlock } from "@/components/ui/PriceBlock";
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
      <article className="flex h-full flex-col">
        <div className="product-card-image relative aspect-square overflow-hidden bg-[#F5F5F3]">
          <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.03]">
            <ProductPhoto
              product={product}
              className="absolute inset-0 h-full w-full"
              sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 70vw"
              priority={priority}
              fit="contain"
              studio
              swapOnHover
              imageClassName="p-4 sm:p-5"
            />
          </div>

          {discount > 0 && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-sm bg-signal px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
              {discount}% OFF
            </span>
          )}

          <WishlistHeartButton
            productId={product.id}
            className="absolute right-2.5 top-2.5 z-10 h-8 w-8 rounded-full border-0 bg-white shadow-none backdrop-blur-none"
          />
        </div>

        <div className="flex flex-1 flex-col pt-3">
          <span className="text-[11px] text-muted">{product.brand}</span>
          <h3 className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink">{product.name}</h3>
          <PriceBlock price={product.price} mrp={product.mrp} tone="card" className="mt-1.5" />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem(product.id, { size: product.sizes[0] ?? null, productName: product.name });
            }}
            className="tap-target mt-1.5 self-start text-left text-[13px] font-medium text-ink underline-offset-4 transition-colors duration-200 hover:underline group-hover:underline"
          >
            Add to cart
          </button>
        </div>
      </article>
    </Link>
  );
}
