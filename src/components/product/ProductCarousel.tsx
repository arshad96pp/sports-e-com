"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { HomeSectionHeader, ViewAllLink } from "@/components/home/HomeSectionHeader";
import "swiper/css";

interface ProductCarouselProps {
  products: Product[];
  eyebrow?: string;
  title?: string;
  description?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  density?: "full" | "compact";
}

function RailArrows({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <button
        type="button"
        aria-label="Previous products"
        onClick={onPrev}
        className="tap-target flex items-center justify-center text-ink transition-colors duration-200 hover:bg-surface"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Next products"
        onClick={onNext}
        className="tap-target flex items-center justify-center text-ink transition-colors duration-200 hover:bg-surface"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProductCarousel({
  products,
  eyebrow,
  title,
  description,
  viewAllHref,
  viewAllLabel,
  density = "full",
}: ProductCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const arrows = !isLocked && (
    <RailArrows
      onPrev={() => swiperRef.current?.slidePrev()}
      onNext={() => swiperRef.current?.slideNext()}
    />
  );

  const compact = density === "compact";

  return (
    <div>
      {title ? (
        <div className="mb-8">
          <HomeSectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            action={
              <div className="flex items-center gap-4">
                {viewAllHref && <ViewAllLink href={viewAllHref} label={viewAllLabel} />}
                {arrows}
              </div>
            }
          />
        </div>
      ) : (
        <div className="mb-4 flex justify-end">{arrows}</div>
      )}

      <Swiper
        modules={[A11y]}
        onSwiper={(s) => {
          swiperRef.current = s;
          setIsLocked(s.isLocked);
        }}
        onLock={() => setIsLocked(true)}
        onUnlock={() => setIsLocked(false)}
        slidesPerView={1.35}
        spaceBetween={12}
        watchOverflow
        grabCursor
        breakpoints={
          compact
            ? {
                620: { slidesPerView: 2.15, spaceBetween: 16 },
                810: { slidesPerView: 2.4, spaceBetween: 16 },
                1280: { slidesPerView: 3, spaceBetween: 20 },
              }
            : {
                620: { slidesPerView: 2.2, spaceBetween: 16 },
                810: { slidesPerView: 3, spaceBetween: 16 },
                1280: { slidesPerView: 4, spaceBetween: 20 },
              }
        }
        className="product-rail"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
