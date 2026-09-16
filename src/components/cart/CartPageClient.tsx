"use client";

import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useBuyNow } from "@/lib/context/BuyNowContext";
import { formatPrice } from "@/lib/utils/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export function CartPageClient() {
  const { items, products, subtotal, mrpTotal, discount, updateQuantity, removeItem } = useCart();
  const { toggle: toggleWishlist } = useWishlist();
  const { openBuyNow } = useBuyNow();

  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 79;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-app py-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
        <h1 className="mt-3 mb-6 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Shopping Cart
        </h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Let's fix that."
          ctaLabel="Start Shopping"
          ctaHref="/"
        />
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 className="mt-3 mb-6 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Shopping Cart <span className="text-muted">({items.length})</span>
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col divide-y divide-border rounded-xl border border-border">
          {items.map((item) => {
            const product = products[item.productId];
            if (!product) return null;
            return (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 p-4 sm:gap-4">
                <Link href={`/product/${product.slug}`} className="shrink-0">
                  <ProductPhoto product={product} className="h-24 w-24 rounded-lg sm:h-28 sm:w-28" sizes="112px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-ink hover:underline">
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span className="shrink-0 font-display text-sm font-bold text-ink sm:text-base">
                      {formatPrice(product.price * item.quantity)}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantityStepper
                      quantity={item.quantity}
                      onChange={(q) => updateQuantity(item.productId, item.size, item.color, q)}
                      size="sm"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          toggleWishlist(item.productId);
                          removeItem(item.productId, item.size, item.color);
                        }}
                        className="text-xs font-medium text-muted transition-colors hover:text-ink"
                      >
                        Move to Wishlist
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        aria-label="Remove item"
                        className="tap-target flex items-center justify-center text-muted transition-colors hover:text-signal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full shrink-0 lg:w-80">
          <div className="sticky top-24 rounded-xl border border-border p-5">
            <h2 className="font-display text-base font-bold text-ink">Order Summary</h2>
            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal (MRP)</span>
                <span>{formatPrice(mrpTotal)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>&minus; {formatPrice(discount)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold text-ink">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              onClick={() =>
                openBuyNow(
                  items
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
                    .filter((l): l is NonNullable<typeof l> => l !== null),
                  { clearCartAfter: true }
                )
              }
              className="mt-5 h-12 w-full rounded-full text-sm font-bold"
            >
              Proceed to Buy
            </Button>
            <Button asChild variant="outline" className="mt-3 h-11 w-full rounded-full text-sm font-semibold">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
