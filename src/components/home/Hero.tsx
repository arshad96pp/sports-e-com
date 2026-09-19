"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { HeroBannerDTO } from "@/lib/services/hero-banner-service";
import { HeroArt } from "@/components/home/HeroArt";
import "swiper/css";

const TRUST_BADGES = [
  { icon: Truck, label: "Fast Delivery", sublabel: "Across India" },
  { icon: ShieldCheck, label: "Genuine Products", sublabel: "Trusted by athletes" },
  { icon: RotateCcw, label: "Easy Returns", sublabel: "Hassle free" },
];

interface HeroProps {
  /** Active banners from Supabase (`hero_banners`), admin-managed via /admin/banners. */
  banners: HeroBannerDTO[];
}

export function Hero({ banners }: HeroProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = banners;
  if (slides.length === 0) return null;
  const isSingleSlide = slides.length === 1;

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <Swiper
        modules={[Navigation, Autoplay, A11y]}
        speed={700}
        loop={!isSingleSlide}
        autoplay={isSingleSlide ? false : { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        onSwiper={(s) => {
          swiperRef.current = s;
        }}
        onSlideChange={(s) => setActiveIndex(s.realIndex)}
        onBeforeInit={(s) => {
          if (typeof s.params.navigation === "object") {
            s.params.navigation.prevEl = prevRef.current;
            s.params.navigation.nextEl = nextRef.current;
          }
        }}
        navigation={{ prevEl: null, nextEl: null }}
        className="hero-swiper"
      >
        {slides.map((slide, index) => {
          // Desktop/mobile are uploaded independently in the admin — a banner
          // with only one crop set should still show that photo instead of
          // silently falling back to the placeholder art on both breakpoints.
          const desktopSrc = slide.imageUrlDesktop || slide.imageUrlMobile;
          const mobileSrc = slide.imageUrlMobile || slide.imageUrlDesktop;
          return (
            <SwiperSlide key={slide.id}>
              <div className="relative flex min-h-[76vh] flex-col justify-center overflow-hidden sm:min-h-[72vh] lg:min-h-[74vh]">
                {desktopSrc ? (
                  <>
                    {/* Photography — desktop/tablet crop */}
                    <Image
                      src={desktopSrc}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                      sizes="100vw"
                      className="hidden object-cover object-center sm:block"
                    />
                    {/* Photography — mobile crop (different framing, not just a shrink) */}
                    <Image
                      src={mobileSrc}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                      sizes="100vw"
                      className="object-cover object-center sm:hidden"
                    />
                  </>
                ) : (
                  <HeroArt category={slide.categorySlug} />
                )}

                {/* Dark gradient from the text side only — the photo stays visible on the right */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/85 via-black/45 to-black/10 sm:from-black/80 sm:via-black/35 sm:to-transparent" />
                {/* Mobile: extra lift from the bottom so text sits on a readable base */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-black/10 sm:hidden" />

                <div className="container-app relative">
                  <div className="hero-slide-content max-w-xl py-6">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-accent">
                      {slide.eyebrow}
                    </span>
                    <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                      {slide.title}
                    </h1>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
                      {slide.subtitle}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <Link
                        href={slide.ctaHref}
                        className="tap-target inline-flex items-center gap-2 rounded-full bg-accent px-7 text-sm font-bold text-accent-ink transition-transform hover:scale-[1.03] active:scale-[0.98]"
                      >
                        {slide.ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      {/* {slide.categorySlug && (
                        <Link
                          href={`/category/${slide.categorySlug}`}
                          className="tap-target inline-flex items-center gap-2 rounded-full border border-white/30 px-7 text-sm font-bold text-white transition-colors hover:border-white"
                        >
                          Explore Category
                        </Link>
                      )} */}
                    </div>

                    <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-white/15 pt-6">
                      {TRUST_BADGES.map((badge) => (
                        <div key={badge.label} className="flex items-center gap-2.5">
                          <badge.icon className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.6} />
                          <div className="leading-tight">
                            <p className="text-xs font-semibold text-white">{badge.label}</p>
                            <p className="text-[11px] text-white/55">{badge.sublabel}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/*
        Pagination (left) and nav arrows (right) share one bottom row, both
        anchored inside `container-app` — same left edge as the hero text,
        and both fixed to the bottom regardless of how tall a slide's copy
        happens to be, so neither ever sits on top of the body text.
        Skipped entirely for a single banner — nothing to navigate to.
      */}
      {!isSingleSlide && (
        <div className="container-app pointer-events-none absolute inset-x-0 bottom-5 z-10 flex items-center justify-between sm:bottom-6">
          <div className="pointer-events-auto flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}: ${slide.eyebrow}`}
                aria-current={index === activeIndex}
                onClick={() => swiperRef.current?.slideToLoop(index)}
                className={`h-0.75 rounded-sm transition-all duration-200 ${
                  index === activeIndex ? "w-9 bg-white" : "w-5.5 bg-white/35 hover:bg-white/55"
                }`}
              />
            ))}
          </div>

          <div className="pointer-events-auto hidden items-center gap-2 sm:flex">
            <button
              ref={prevRef}
              type="button"
              aria-label="Previous slide"
              onClick={() => swiperRef.current?.slidePrev()}
              className="tap-target flex items-center justify-center rounded-full bg-white text-ink shadow-lg transition-transform hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              ref={nextRef}
              type="button"
              aria-label="Next slide"
              onClick={() => swiperRef.current?.slideNext()}
              className="tap-target flex items-center justify-center rounded-full bg-white text-ink shadow-lg transition-transform hover:scale-105"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
