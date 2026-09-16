"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, RotateCcw, ShieldCheck, Truck, ZoomIn } from "lucide-react";
import type { Product } from "@/lib/types";
import { getDiscountPercent } from "@/lib/data/products";
import type { ReviewDTO } from "@/lib/services/review-service";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProductArt } from "@/components/product/ProductArt";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import { ProductGrid } from "@/components/product/ProductGrid";
import { RatingStars } from "@/components/ui/RatingStars";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { DiscountBadge } from "@/components/ui/DiscountBadge";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { WishlistHeartButton } from "@/components/ui/WishlistHeartButton";
import { useCart } from "@/lib/context/CartContext";
import { useBuyNow } from "@/lib/context/BuyNowContext";

interface ProductDetailClientProps {
  product: Product;
  related: Product[];
  frequentlyBoughtWith: Product[];
  reviews: ReviewDTO[];
}

export function ProductDetailClient({ product, related, frequentlyBoughtWith, reviews }: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null);
  const [color, setColor] = useState<string | null>(product.colors[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zoomed, setZoomed] = useState(false);

  const { addItem } = useCart();
  const { openBuyNow } = useBuyNow();
  const discount = getDiscountPercent(product);
  const [fbtSelected, setFbtSelected] = useState<string[]>(() => frequentlyBoughtWith.map((p) => p.id));

  const activePhoto = product.images[activeImage] ?? product.images[0];

  function handleAddToCart() {
    addItem(product.id, { quantity, size, color, productName: product.name });
  }

  function handleBuyNow() {
    openBuyNow(
      [
        {
          name: product.name,
          productId: product.id,
          sku: product.sku,
          quantity,
          price: product.price,
          size,
          color,
          imageUrl: product.images[0]?.url ?? null,
        },
      ],
      { clearCartAfter: false }
    );
  }

  function addBundleToCart() {
    addItem(product.id, { quantity: 1, size, color, productName: product.name });
    frequentlyBoughtWith
      .filter((p) => fbtSelected.includes(p.id))
      .forEach((p) => addItem(p.id, { size: p.sizes[0] ?? null, productName: p.name }));
  }

  const bundleTotal =
    product.price + frequentlyBoughtWith.filter((p) => fbtSelected.includes(p.id)).reduce((s, p) => s + p.price, 0);

  return (
    <div className="container-app py-4 sm:py-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: product.category === "other-accessories" ? "Other Accessories" : product.subcategory, href: `/category/${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div>
          <div
            className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setZoomPos({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              });
            }}
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
          >
            {activePhoto ? (
              <Image
                src={activePhoto.url}
                alt={activePhoto.alt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-200 ease-out"
                style={{
                  transform: zoomed ? "scale(1.6)" : "scale(1)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
              />
            ) : (
              <ProductArt product={product} className="absolute inset-0 h-full w-full" />
            )}
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-muted">
              <ZoomIn className="h-3 w-3" /> Hover to zoom
            </span>
            <div className="absolute left-3 top-3">
              <DiscountBadge percent={discount} />
            </div>
          </div>

          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {product.images.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:h-20 sm:w-20 ${
                    activeImage === i ? "border-ink" : "border-border"
                  }`}
                >
                  <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{product.brand}</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {product.name}
          </h1>
          <div className="mt-2.5 flex items-center gap-3">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
            <span className="text-xs font-medium text-success">
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <PriceBlock price={product.price} mrp={product.mrp} size="lg" />
            <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
          </div>

          {product.colors.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink">
                Color{color ? `: ${color}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                      color === c ? "border-ink bg-ink text-white" : "border-border-strong text-ink-soft"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink">
                Size{size ? `: ${size}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-12 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      size === s ? "border-ink bg-ink text-white" : "border-border-strong text-ink-soft"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink">Quantity</p>
            <QuantityStepper quantity={quantity} onChange={setQuantity} />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="tap-target flex-1 rounded-full border-2 border-ink text-sm font-bold text-ink transition-colors hover:bg-surface"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="tap-target flex-1 rounded-full bg-ink text-sm font-bold text-white transition-transform active:scale-[0.98]"
            >
              Buy Now
            </button>
            <WishlistHeartButton
              productId={product.id}
              size="md"
              className="border border-border-strong bg-white shadow-none"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-border p-4 sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
              <p className="text-xs text-ink-soft">
                {product.price >= FREE_SHIPPING_THRESHOLD ? "Free delivery" : `Free delivery above ${formatPrice(FREE_SHIPPING_THRESHOLD)}`}, 3-5 business days
              </p>
            </div>
            <div className="flex items-start gap-2">
              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
              <p className="text-xs text-ink-soft">7-day easy returns on unused items</p>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
              <p className="text-xs text-ink-soft">6-month manufacturing warranty</p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink">Highlights</h3>
            <ul className="flex flex-col gap-2">
              {product.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="mt-12 max-w-2xl">
        <h2 className="font-display text-xl font-bold text-ink">Specifications</h2>
        <dl className="mt-4 divide-y divide-border rounded-xl border border-border">
          {product.specs.map((spec) => (
            <div key={spec.label} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm">
              <dt className="text-muted">{spec.label}</dt>
              <dd className="font-medium text-ink">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Frequently bought together */}
      {frequentlyBoughtWith.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-ink">Frequently Bought Together</h2>
          <div className="mt-4 flex flex-col gap-4 rounded-xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <ProductPhoto product={product} className="h-20 w-20 rounded-lg" sizes="80px" />
                <span className="max-w-20 truncate text-xs font-medium text-ink">This item</span>
              </div>
              {frequentlyBoughtWith.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-lg text-muted-soft">+</span>
                  <label className="flex cursor-pointer flex-col items-center gap-1.5 text-center">
                    <div className="relative">
                      <ProductPhoto
                        product={p}
                        className={`h-20 w-20 rounded-lg ${fbtSelected.includes(p.id) ? "" : "opacity-40 grayscale"}`}
                        sizes="80px"
                      />
                      <input
                        type="checkbox"
                        checked={fbtSelected.includes(p.id)}
                        onChange={() =>
                          setFbtSelected((prev) =>
                            prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                          )
                        }
                        className="absolute -right-1 -top-1 h-4 w-4 rounded border-border-strong"
                      />
                    </div>
                    <span className="max-w-20 truncate text-xs font-medium text-ink">{p.name}</span>
                    <span className="text-xs text-muted">{formatPrice(p.price)}</span>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
              <p className="text-sm text-muted">
                Total: <span className="font-display text-lg font-bold text-ink">{formatPrice(bundleTotal)}</span>
              </p>
              <button
                type="button"
                onClick={addBundleToCart}
                className="tap-target rounded-full bg-ink px-6 text-sm font-bold text-white"
              >
                Add Selected to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-12 max-w-3xl">
        <h2 className="font-display text-xl font-bold text-ink">Customer Reviews</h2>
        <div className="mt-4 flex flex-col gap-4">
          {reviews.map((review, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-xs font-bold text-ink">
                    {review.author[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{review.author}</p>
                    {review.verified && <p className="text-[11px] text-success">Verified Purchase</p>}
                  </div>
                </div>
                <span className="text-xs text-muted-soft">{formatDate(review.date)}</span>
              </div>
              <div className="mt-2.5">
                <RatingStars rating={review.rating} showCount={false} />
              </div>
              <p className="mt-2 text-sm font-semibold text-ink">{review.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-4 font-display text-xl font-bold text-ink">You May Also Like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
