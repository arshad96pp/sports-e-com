"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useProductsByIds } from "@/lib/hooks/useProductsByIds";
import { ProductGrid } from "@/components/product/ProductGrid";
import { WishlistSkeleton } from "@/components/wishlist/WishlistSkeleton";

export function WishlistPageClient() {
  const { productIds, isInitialized } = useWishlist();
  const {
    products: productMap,
    loading: productsLoading,
    error: productsError,
    retry: retryProducts,
  } = useProductsByIds(productIds);
  const products = productIds.map((id) => productMap[id]).filter((p): p is NonNullable<typeof p> => Boolean(p));

  // Sticky readiness: flips true once the wishlist is hydrated AND its
  // initial product data has resolved, then stays true. Using isInitialized/
  // productsLoading directly as the render gate would also re-show the
  // skeleton whenever a newly-added item's product data is still in
  // flight, wiping out the wishlist the user is actively looking at.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (isInitialized && !productsLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
    }
  }, [isInitialized, productsLoading]);

  if (!ready) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="mx-auto mb-10 max-w-lg text-center sm:mb-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Saved Items</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">My Wishlist</h1>
      </div>

      {productsError && productIds.length > 0 && (
        <div className="mx-auto mb-10 flex max-w-lg flex-col items-center gap-2 rounded-xl border border-border/60 bg-surface px-4 py-4 text-center sm:flex-row sm:justify-between">
          <p role="alert" className="text-sm text-muted">
            We couldn&apos;t load your wishlist items. Please try again.
          </p>
          <button
            type="button"
            onClick={retryProducts}
            className="shrink-0 rounded-full border border-ink/20 px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-muted">Your Wishlist is currently empty.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
          >
            Return To Shop
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
