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
    const filled = Math.round(rating);
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="flex items-center gap-px">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={
                i < filled
                  ? "h-3 w-3 fill-ink/80 text-ink/80"
                  : "h-3 w-3 fill-none text-border-strong"
              }
              strokeWidth={1.5}
            />
          ))}
        </div>
        {showCount && reviewCount !== undefined && reviewCount > 0 && (
          <span className="text-[11px] leading-none text-muted-soft">
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
