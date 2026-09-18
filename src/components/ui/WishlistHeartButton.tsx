"use client";

import { Heart } from "lucide-react";
import { cn } from "cn";
import { useWishlist } from "@/lib/context/WishlistContext";

interface WishlistHeartButtonProps {
  productId: string;
  size?: "sm" | "md";
  className?: string;
}

export function WishlistHeartButton({ productId, size = "sm", className = "" }: WishlistHeartButtonProps) {
  const { isWishlisted, toggle } = useWishlist();
  const active = isWishlisted(productId);
  const dim = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const iconDim = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={cn(
        `flex ${dim} shrink-0 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-transform duration-150 ease-out hover:scale-[1.05] active:scale-95`,
        className
      )}
    >
      <Heart
        className={`${iconDim} transition-colors duration-150 ${
          active ? "fill-signal text-signal" : "text-ink"
        }`}
      />
    </button>
  );
}
