"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "cn";
import type { Product } from "@/lib/types";

export const FALLBACK_PRODUCT_IMAGE = "/images/product-placeholder-dark.webp";

const STUDIO_SURFACE = "bg-[#F7F7F5]";
const FALLBACK_SURFACE = "bg-[#121212]";

interface ProductPhotoProps {
  product: Pick<Product, "id" | "category" | "name" | "images">;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  imageClassName?: string;
  /** Neutral studio fallback art — used by product cards only. */
  studio?: boolean;
  /** Fade to `images[1]` on parent `.group` hover when a second photo exists. */
  swapOnHover?: boolean;
}

function isAllowedRemoteUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return parsed.hostname === "127.0.0.1" || parsed.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

export function resolveProductImageSrc(url: string | null | undefined): string {
  if (typeof url !== "string") return FALLBACK_PRODUCT_IMAGE;
  const trimmed = url.trim();
  if (!trimmed) return FALLBACK_PRODUCT_IMAGE;
  if (trimmed.startsWith("/")) return trimmed;
  if (isAllowedRemoteUrl(trimmed)) return trimmed;
  return FALLBACK_PRODUCT_IMAGE;
}

/** True when the product has no usable photo and will render the dark studio fallback. */
export function usesFallbackProductImage(product: Pick<Product, "images">): boolean {
  return resolveProductImageSrc(product.images[0]?.url) === FALLBACK_PRODUCT_IMAGE;
}

/** A product's primary photo, falling back to a shared studio placeholder when the image is missing or invalid. */
export function ProductPhoto({
  product,
  className = "",
  sizes = "400px",
  priority = false,
  fit = "cover",
  imageClassName = "",
  studio = false,
  swapOnHover = false,
}: ProductPhotoProps) {
  const photo = product.images[0];
  const resolvedSrc = resolveProductImageSrc(photo?.url);
  const resolvedHoverSrc = resolveProductImageSrc(product.images[1]?.url);
  const [src, setSrc] = useState(resolvedSrc);
  const [hoverSrc, setHoverSrc] = useState(resolvedHoverSrc);

  useEffect(() => {
    setSrc(resolvedSrc);
    setHoverSrc(resolvedHoverSrc);
  }, [resolvedSrc, resolvedHoverSrc]);

  // `fill` needs a positioned ancestor. Callers sometimes pass their own
  // "absolute inset-0 …" (to overlay a sibling badge/button in an already-
  // `relative` parent, matching how <ProductArt> is used) — in that case
  // don't also add `relative`, which would win the position property in
  // Tailwind's cascade and break the overlay.
  const needsRelative = !/\babsolute\b/.test(className);
  const isFallback = src === FALLBACK_PRODUCT_IMAGE;
  const showHover =
    swapOnHover &&
    hoverSrc !== FALLBACK_PRODUCT_IMAGE &&
    hoverSrc !== src;
  const objectFit = fit === "contain" && !isFallback ? "object-contain" : "object-cover";
  const surface = isFallback
    ? FALLBACK_SURFACE
    : studio || fit === "contain"
      ? STUDIO_SURFACE
      : "";

  return (
    <div className={`overflow-hidden ${surface}${surface ? " " : ""}${needsRelative ? "relative " : ""}${className}`}>
      <Image
        src={src}
        alt={photo?.alt || product.name}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          objectFit,
          imageClassName,
          isFallback && "p-0",
          showHover && "transition-opacity duration-300 ease-out group-hover:opacity-0"
        )}
        onError={() => {
          if (src !== FALLBACK_PRODUCT_IMAGE) setSrc(FALLBACK_PRODUCT_IMAGE);
        }}
      />
      {showHover && (
        <Image
          src={hoverSrc}
          alt={product.images[1]?.alt || product.name}
          fill
          sizes={sizes}
          className={cn(
            objectFit,
            imageClassName,
            "opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
          )}
          onError={() => {
            if (hoverSrc !== FALLBACK_PRODUCT_IMAGE) setHoverSrc(FALLBACK_PRODUCT_IMAGE);
          }}
        />
      )}
    </div>
  );
}
