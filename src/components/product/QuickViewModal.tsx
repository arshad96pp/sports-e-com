"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuickView } from "@/lib/context/QuickViewContext";
import { useCart } from "@/lib/context/CartContext";
import { resolveVariantMrp, resolveVariantPrice } from "@/lib/data/products";
import { stripHtmlToText } from "@/lib/utils/format";
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
  const [variantId, setVariantId] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      const hasVariants = product.variants.length > 0;
      const defaultVariant = hasVariants ? (product.variants.find((v) => v.stock > 0) ?? product.variants[0]) : null;
      // Reset selection each time a new product opens in quick view.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVariantId(defaultVariant?.id ?? null);
      setSize(defaultVariant ? defaultVariant.size : (product.sizes[0] ?? null));
      setQuantity(1);
    }
  }, [product]);

  const hasVariants = Boolean(product && product.variants.length > 0);
  const displayPrice = product ? resolveVariantPrice(product, variantId) : 0;
  const displayMrp = product ? resolveVariantMrp(product, variantId) : 0;
  const selectedVariant = product && hasVariants ? product.variants.find((v) => v.id === variantId) : undefined;
  const inStock = product ? (hasVariants ? (selectedVariant?.stock ?? 0) > 0 : product.inStock) : false;

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
                <PriceBlock price={displayPrice} mrp={displayMrp} size="md" />
              </div>
              {!inStock && <p className="mt-2 text-xs font-medium text-signal">Out of Stock</p>}
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">{stripHtmlToText(product.description)}</p>

              {hasVariants ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const outOfStock = v.stock <= 0;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={outOfStock}
                          title={outOfStock ? `${v.size} is out of stock` : undefined}
                          onClick={() => {
                            setVariantId(v.id);
                            setSize(v.size);
                          }}
                          className={`min-w-11 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:border-border disabled:text-muted-soft disabled:opacity-50 ${
                            variantId === v.id ? "border-ink bg-ink text-white" : "border-border-strong text-ink-soft"
                          }`}
                        >
                          {v.size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                product.sizes.length > 0 && (
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
                )
              )}

              <div className="mt-4 flex items-center gap-3">
                <QuantityStepper quantity={quantity} onChange={setQuantity} size="sm" />
                <WishlistHeartButton productId={product.id} className="border border-border-strong bg-white shadow-none" />
              </div>

              <div className="mt-5 flex items-center gap-3">
                <Button
                  onClick={() => {
                    addItem(product.id, { quantity, variantId, size, productName: product.name });
                    closeQuickView();
                  }}
                  disabled={!inStock}
                  className="h-11 flex-1 rounded-full text-sm font-bold"
                >
                  {inStock ? "Add to Cart" : "Out of Stock"}
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
