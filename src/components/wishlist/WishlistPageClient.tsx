"use client";

import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useCart } from "@/lib/context/CartContext";
import { useProductsByIds } from "@/lib/hooks/useProductsByIds";
import { getDiscountPercent } from "@/lib/data/products";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { RatingStars } from "@/components/ui/RatingStars";
import { DiscountBadge } from "@/components/ui/DiscountBadge";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { EmptyState } from "@/components/common/EmptyState";

export function WishlistPageClient() {
  const { productIds, remove } = useWishlist();
  const { addItem } = useCart();
  const { products: productMap } = useProductsByIds(productIds);
  const products = productIds.map((id) => productMap[id]).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (products.length === 0) {
    return (
      <div className="container-app py-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
        <h1 className="mt-3 mb-6 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Wishlist
        </h1>
        <EmptyState
          icon={Heart}
          title="Your wishlist is waiting for some game-changing gear."
          description="Save the products you love and come back to them anytime."
          ctaLabel="Explore Products"
          ctaHref="/"
        />
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <h1 className="mt-3 mb-6 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Wishlist <span className="text-muted">({products.length})</span>
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {products.map((product) => {
          const discount = getDiscountPercent(product);
          return (
            <div key={product.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-white">
              <div className="relative aspect-square w-full">
                <Link href={`/product/${product.slug}`}>
                  <ProductPhoto product={product} className="absolute inset-0 h-full w-full" sizes="(min-width: 1024px) 23vw, 45vw" />
                </Link>
                <div className="absolute left-2 top-2">
                  <DiscountBadge percent={discount} />
                </div>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3">
                <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-ink">
                  {product.name}
                </Link>
                <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
                <PriceBlock price={product.price} mrp={product.mrp} className="mt-0.5" />
                <button
                  type="button"
                  onClick={() => addItem(product.id, { size: product.sizes[0] ?? null, productName: product.name })}
                  className="tap-target mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-ink py-2.5 text-xs font-semibold text-white"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
