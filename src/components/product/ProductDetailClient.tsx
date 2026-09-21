"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, RotateCcw, ShieldCheck, Truck, ZoomIn } from "lucide-react";
import type { Product } from "@/lib/types";
import { getDiscountPercent } from "@/lib/data/products";
import type { ReviewDTO } from "@/lib/services/review-service";
import { ProductReviewForm } from "@/components/product/ProductReviewForm";
import { RichText } from "@/components/product/RichText";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProductArt } from "@/components/product/ProductArt";
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
  reviews: ReviewDTO[];
}

export function ProductDetailClient({ product, related, reviews }: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null);
  const [color, setColor] = useState<string | null>(product.colors[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zoomed, setZoomed] = useState(false);
  // Tracks gallery images whose Storage object 404s/fails to load (a stale
  // DB row pointing at a deleted file) — swaps just that image to the shared
  // placeholder instead of the browser's broken-image icon.
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  const { addItem } = useCart();
  const { openBuyNow } = useBuyNow();
  const discount = getDiscountPercent(product);
  const [reviewList, setReviewList] = useState(reviews);

  const activePhoto = product.images[activeImage] ?? product.images[0];
  const activePhotoSrc = brokenImages[activeImage] ? null : activePhoto?.url;

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

  return (
    <div className="container-app py-4 sm:py-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: product.category === "other-accessories" ? "Other Accessories" : product.subcategory, href: `/category/${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Gallery */}
        <div>
          <div
            className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-[#f5f5f3] shadow-[0_1px_3px_rgba(16,24,32,0.04)]"
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
            {activePhoto && activePhotoSrc ? (
              <Image
                src={activePhotoSrc}
                alt={activePhoto.alt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-200 ease-out"
                style={{
                  transform: zoomed ? "scale(1.6)" : "scale(1)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
                onError={() =>
                  setBrokenImages((prev) => (prev[activeImage] ? prev : { ...prev, [activeImage]: true }))
                }
              />
            ) : (
              <ProductArt product={product} className="absolute inset-0 h-full w-full" />
            )}
            <span className="pointer-events-none absolute right-3 top-3 hidden items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-muted sm:flex">
              <ZoomIn className="h-3 w-3" /> Hover to zoom
            </span>
            <div className="absolute left-3 top-3">
              <DiscountBadge percent={discount} />
            </div>
          </div>

          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={activeImage === i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors sm:h-20 sm:w-20 ${
                    activeImage === i ? "border-ink" : "border-border hover:border-border-strong"
                  }`}
                >
                  {brokenImages[i] ? (
                    <ProductArt product={product} className="absolute inset-0 h-full w-full" />
                  ) : (
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="80px"
                      className="object-cover"
                      onError={() => setBrokenImages((prev) => (prev[i] ? prev : { ...prev, [i]: true }))}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{product.brand}</p>
          <h1 className="mt-1 font-display text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
            {product.name}
          </h1>
          <div className="mt-2.5 flex items-center gap-3">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
            <span className={`text-xs font-semibold ${product.inStock ? "text-success" : "text-signal"}`}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <PriceBlock price={product.price} mrp={product.mrp} size="lg" />
            <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
          </div>

          {product.shortInfo && (
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.shortInfo}</p>
          )}

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
                    aria-pressed={color === c}
                    onClick={() => setColor(c)}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                      color === c
                        ? "border-ink bg-ink text-white"
                        : "border-border-strong text-ink-soft hover:border-ink"
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
                    aria-pressed={size === s}
                    onClick={() => setSize(s)}
                    className={`min-w-12 cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      size === s
                        ? "border-ink bg-ink text-white"
                        : "border-border-strong text-ink-soft hover:border-ink"
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
              disabled={!product.inStock}
              className="tap-target flex-1 cursor-pointer rounded-full border-2 border-ink text-sm font-bold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:border-border-strong disabled:text-muted-soft disabled:hover:bg-transparent"
            >
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="tap-target flex-1 cursor-pointer rounded-full bg-ink text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-muted-soft disabled:active:scale-100"
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
        </div>
      </div>

      {/* Product details: description, highlights, specifications */}
      <div className="mt-14 grid grid-cols-1 gap-10 border-t border-border pt-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-ink">Product Details</h2>
          <div className="mt-4">
            <RichText html={product.description} />
          </div>

          {product.highlights.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-wide text-ink">Highlights</h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {product.specs.length > 0 && (
          <div className="lg:border-l lg:border-border lg:pl-10">
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink">Specifications</h3>
            <dl className="mt-4 flex flex-col divide-y divide-border">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="text-right font-medium text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-14 max-w-3xl border-t border-border pt-10">
        {reviewList.length > 0 && (
          <h2 className="font-display text-xl font-bold text-ink">Customer Reviews</h2>
        )}

        <div className="mt-4">
          <ProductReviewForm
            productId={product.id}
            onReviewAdded={(review) => setReviewList((prev) => [review, ...prev])}
          />
        </div>

        {reviewList.length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            {reviewList.map((review) => (
              <div key={review.id} className="rounded-xl border border-border p-4">
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
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-14 border-t border-border pt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-ink">You May Also Like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
