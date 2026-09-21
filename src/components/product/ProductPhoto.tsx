"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "cn";
import type { Product } from "@/lib/types";
import { ProductPlaceholder } from "@/components/product/ProductPlaceholder";

const STUDIO_SURFACE = "bg-[#F7F7F5]";

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

/** Resolves a usable photo URL, or `null` when it's missing/invalid and the shared placeholder should render instead. */
export function resolveProductImageSrc(url: string | null | undefined): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  if (isAllowedRemoteUrl(trimmed)) return trimmed;
  return null;
}

/** True when the product has no usable photo and will render the shared placeholder. */
export function usesFallbackProductImage(product: Pick<Product, "images">): boolean {
  return resolveProductImageSrc(product.images[0]?.url) === null;
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
  // Local state can diverge from the resolved props (`onError` below sets it
  // to null to fall back to the placeholder), so it can't be a pure derived
  // value — but it still needs to reset when the underlying product/image
  // changes. Tracking the previous resolved values and adjusting state
  // directly in the render body (React's recommended pattern for this) does
  // that without the extra effect render pass.
  const [prevResolvedSrc, setPrevResolvedSrc] = useState(resolvedSrc);
  const [prevResolvedHoverSrc, setPrevResolvedHoverSrc] = useState(resolvedHoverSrc);
  if (resolvedSrc !== prevResolvedSrc || resolvedHoverSrc !== prevResolvedHoverSrc) {
    setPrevResolvedSrc(resolvedSrc);
    setPrevResolvedHoverSrc(resolvedHoverSrc);
    setSrc(resolvedSrc);
    setHoverSrc(resolvedHoverSrc);
  }

  // `fill` needs a positioned ancestor. Callers sometimes pass their own
  // "absolute inset-0 …" (to overlay a sibling badge/button in an already-
  // `relative` parent, matching how <ProductArt> is used) — in that case
  // don't also add `relative`, which would win the position property in
  // Tailwind's cascade and break the overlay.
  const needsRelative = !/\babsolute\b/.test(className);
  const isFallback = src === null;
  const showHover = swapOnHover && hoverSrc !== null && hoverSrc !== src;
  const objectFit = fit === "contain" ? "object-contain" : "object-cover";
  const surface = !isFallback && (studio || fit === "contain") ? STUDIO_SURFACE : "";

  return (
    <div className={`overflow-hidden ${surface}${surface ? " " : ""}${needsRelative ? "relative " : ""}${className}`}>
      {isFallback ? (
        <ProductPlaceholder className="absolute inset-0 h-full w-full" />
      ) : (
        <Image
          src={src}
          alt={photo?.alt || product.name}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            objectFit,
            imageClassName,
            showHover && "transition-opacity duration-300 ease-out group-hover:opacity-0"
          )}
          onError={() => setSrc(null)}
        />
      )}
      {showHover && hoverSrc && (
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
          onError={() => setHoverSrc(null)}
        />
      )}
    </div>
  );
}
