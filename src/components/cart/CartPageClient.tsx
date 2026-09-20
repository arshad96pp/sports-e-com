"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useBuyNow } from "@/lib/context/BuyNowContext";
import { useProductsByIds } from "@/lib/hooks/useProductsByIds";
import { formatPrice } from "@/lib/utils/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import { CartSkeleton } from "@/components/cart/CartSkeleton";

export function CartPageClient() {
  const { items, isInitialized, updateQuantity, removeItem } = useCart();
  const { toggle: toggleWishlist } = useWishlist();
  const { openBuyNow } = useBuyNow();

  const productIds = useMemo(() => items.map((i) => i.productId), [items]);
  const { products, loading: productsLoading, error: productsError, retry: retryProducts } =
    useProductsByIds(productIds);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (isInitialized && !productsLoading) {
      setReady(true);
    }
  }, [isInitialized, productsLoading]);

  const { subtotal, mrpTotal } = useMemo(() => {
    let subtotal = 0;
    let mrpTotal = 0;
    for (const item of items) {
      const product = products[item.productId];
      if (!product) continue;
      subtotal += product.price * item.quantity;
      mrpTotal += product.mrp * item.quantity;
    }
    return { subtotal, mrpTotal };
  }, [items, products]);

  if (!ready) {
    return <CartSkeleton />;
  }

  const discount = mrpTotal - subtotal;

  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 79;
  const total = subtotal + shipping;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const checkoutLines = items
    .map((item) => {
      const product = products[item.productId];
      if (!product) return null;
      return {
        name: product.name,
        productId: product.id,
        sku: product.sku,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color,
        imageUrl: product.images[0]?.url ?? null,
      };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  return (
    <section className="flex-1 pt-12 pb-28 sm:pt-20 md:pt-28 md:pb-20 lg:pb-20">
      <div className="container-app">
        <h1 className="mb-8 text-center font-display text-xl font-light tracking-[0.15em] text-ink sm:mb-12 sm:text-2xl md:mb-20 md:text-4xl">
          Shopping Cart
        </h1>

        {productsError && items.length > 0 && (
          <div className="mb-8 flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-surface px-4 py-4 text-center sm:flex-row sm:justify-between">
            <p role="alert" className="text-sm text-muted">
              We couldn&apos;t load your cart items. Please try again.
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

        {items.length === 0 ? (
          <div className="py-20 text-center lg:py-32">
            <ShoppingCart
              className="mx-auto mb-4 h-16 w-16 text-muted opacity-20"
              strokeWidth={1}
            />
            <p className="mb-8 text-xl font-light text-muted">Your cart is empty</p>
            <Link
              href="/"
              className="inline-flex h-auto items-center justify-center rounded-full bg-ink px-12 py-6 text-sm font-medium text-white transition-colors hover:bg-ink-soft"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-20">
            <div className="space-y-8 lg:col-span-2">
              {items.map((item) => {
                const product = products[item.productId];
                if (!product) return null;
                const key = `${item.productId}-${item.size}-${item.color}`;
                const attributes = [
                  item.size ? ["Size", item.size] : null,
                  item.color ? ["Color", item.color] : null,
                ].filter((entry): entry is [string, string] => entry !== null);

                return (
                  <div
                    key={key}
                    className="flex gap-4 border-b border-border/30 py-6 first:pt-0 md:gap-10 md:py-8"
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-surface sm:h-24 sm:w-24 md:h-32 md:w-32"
                    >
                      <ProductPhoto
                        product={product}
                        className="absolute inset-0 h-full w-full"
                        sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="mb-1 text-sm font-normal tracking-wider break-all md:text-base">
                            <Link href={`/product/${product.slug}`} className="hover:text-ink-soft">
                              {product.name}
                            </Link>
                          </h2>
                          {attributes.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
                              {attributes.map(([label, value]) => (
                                <span key={label} className="text-[10px] tracking-widest text-muted">
                                  {label}: <span className="text-ink">{value}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${product.name}`}
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          className="h-auto shrink-0 p-1 text-ink transition-colors hover:text-signal"
                        >
                          <X className="h-4 w-4" strokeWidth={1} />
                        </button>
                      </div>

                      <p className="mb-4 text-xs font-bold tracking-widest text-muted opacity-60 md:mb-6 md:text-sm">
                        {formatPrice(product.price)}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex h-10 items-center rounded-full border border-border/50 px-2">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={item.quantity >= 10}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.color,
                                Math.min(10, item.quantity + 1)
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full disabled:opacity-30"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="whitespace-nowrap text-sm font-normal tracking-wider md:hidden">
                          {formatPrice(product.price * item.quantity)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleWishlist(item.productId);
                          removeItem(item.productId, item.size, item.color);
                        }}
                        className="mt-3 text-[10px] font-bold tracking-widest text-muted uppercase transition-colors hover:text-ink"
                      >
                        Move to Wishlist
                      </button>
                    </div>

                    <div className="hidden shrink-0 text-right md:block">
                      <p className="whitespace-nowrap text-sm font-normal tracking-wider md:text-base">
                        {formatPrice(product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="space-y-6 rounded-2xl bg-surface/80 p-5 sm:space-y-8 sm:rounded-3xl sm:p-8 md:p-10 lg:sticky lg:top-24">
                <h2 className="text-sm font-bold tracking-[0.2em] text-ink">Order Summary</h2>

                <div className="space-y-4 border-b border-border/30 pb-8">
                  <div className="flex justify-between text-xs tracking-widest text-muted">
                    <span>Subtotal</span>
                    <span className="text-ink">{formatPrice(mrpTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs tracking-widest text-muted">
                      <span>Discount</span>
                      <span className="text-success">&minus; {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs tracking-widest text-muted">
                    <span>Shipping</span>
                    <span className="text-ink">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold tracking-[0.2em] text-ink">Total</span>
                  <span className="text-2xl font-normal tracking-wider text-ink">{formatPrice(total)}</span>
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    type="button"
                    onClick={() => openBuyNow(checkoutLines, { clearCartAfter: true, requireAuth: true })}
                    className="flex h-14 w-full items-center justify-center rounded-full bg-ink text-[10px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-ink-soft"
                  >
                    Proceed to Checkout
                  </button>
                  <Link
                    href="/"
                    className="flex h-14 w-full items-center justify-center rounded-full border-2 border-ink/15 text-[10px] font-bold tracking-widest text-ink uppercase transition-colors hover:bg-white"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {shipping > 0 && remainingForFreeShipping > 0 && (
                  <p className="mt-4 text-center text-[10px] tracking-widest text-muted uppercase">
                    Spend {formatPrice(remainingForFreeShipping)} more for FREE shipping
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
