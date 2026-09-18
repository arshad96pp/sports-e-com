import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
  /** Quieter listing hierarchy used by product cards. */
  tone?: "default" | "card";
}

export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
  className = "",
  tone = "default",
}: RatingStarsProps) {
  const dim = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  if (tone === "card") {
    return (
      <div className={`flex min-h-5 items-center gap-1 ${className}`}>
        <Star className="h-3 w-3 fill-[#C8A96A] text-[#C8A96A]" />
        <span className="text-[11px] font-medium tabular-nums leading-none text-ink/70">{rating.toFixed(1)}</span>
        {showCount && reviewCount !== undefined && (
          <span className="text-[10px] leading-none text-[#B0B0AA]">
            ({reviewCount.toLocaleString("en-IN")})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="flex items-center gap-0.5 rounded bg-ink px-1.5 py-0.5 text-white">
        <span className={`${size === "sm" ? "text-[11px]" : "text-xs"} font-semibold leading-none`}>
          {rating.toFixed(1)}
        </span>
        <Star className={`${dim} fill-current`} />
      </span>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-muted">({reviewCount.toLocaleString("en-IN")})</span>
      )}
    </div>
  );
}
