"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuickView } from "@/lib/context/QuickViewContext";
import { useCart } from "@/lib/context/CartContext";
import { getDiscountPercent } from "@/lib/data/products";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import { RatingStars } from "@/components/ui/RatingStars";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { WishlistHeartButton } from "@/components/ui/WishlistHeartButton";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function QuickViewModal() {
  const { product, closeQuickView } = useQuickView();
  const { addItem } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      // Reset selection each time a new product opens in quick view.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSize(product.sizes[0] ?? null);
      setQuantity(1);
    }
  }, [product]);

  const discount = product ? getDiscountPercent(product) : 0;

  return (
    <Dialog open={!!product} onOpenChange={(next) => !next && closeQuickView()}>
      <DialogContent
        showCloseButton
        className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl sm:flex-row"
      >
        {product && (
          <div className="flex flex-col sm:flex-row">
            <ProductPhoto product={product} className="aspect-square w-full sm:aspect-auto sm:w-2/5" sizes="(min-width: 640px) 40vw, 100vw" />

            <div className="flex-1 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{product.brand}</p>
              <DialogTitle asChild>
                <h2 className="mt-1 font-display text-xl font-bold text-ink">{product.name}</h2>
              </DialogTitle>
              <DialogDescription className="sr-only">Quick view for {product.name}</DialogDescription>
              <div className="mt-2">
                <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
              </div>
              <div className="mt-3">
                <PriceBlock price={product.price} mrp={product.mrp} size="md" />
                {discount > 0 && <p className="mt-1 text-xs text-muted">You save on this deal</p>}
              </div>
              {!product.inStock && <p className="mt-2 text-xs font-medium text-signal">Out of Stock</p>}
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">{product.description}</p>

              {product.sizes.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`min-w-11 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                          size === s ? "border-ink bg-ink text-white" : "border-border-strong text-ink-soft"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <QuantityStepper quantity={quantity} onChange={setQuantity} size="sm" />
                <WishlistHeartButton productId={product.id} className="border border-border-strong bg-white shadow-none" />
              </div>

              <div className="mt-5 flex items-center gap-3">
                <Button
                  onClick={() => {
                    addItem(product.id, { quantity, size, productName: product.name });
                    closeQuickView();
                  }}
                  disabled={!product.inStock}
                  className="h-11 flex-1 rounded-full text-sm font-bold"
                >
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button asChild variant="outline" className="h-11 flex-1 rounded-full text-sm font-semibold">
                  <Link href={`/product/${product.slug}`} onClick={closeQuickView}>
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
