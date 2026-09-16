import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
}

export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
  className = "",
}: RatingStarsProps) {
  const dim = size === "sm" ? "h-3 w-3" : "h-4 w-4";
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
