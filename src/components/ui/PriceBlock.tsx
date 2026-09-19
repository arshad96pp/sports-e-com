import { formatPrice } from "@/lib/utils/format";
import { getDiscountPercent } from "@/lib/data/products";

interface PriceBlockProps {
  price: number;
  mrp: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Quieter listing hierarchy used by product cards. */
  tone?: "default" | "card";
}

const SIZE_CLASSES = {
  sm: { price: "text-sm", mrp: "text-xs", discount: "text-xs" },
  md: { price: "text-lg", mrp: "text-sm", discount: "text-sm" },
  lg: { price: "text-3xl", mrp: "text-base", discount: "text-sm" },
};

export function PriceBlock({ price, mrp, size = "sm", className = "", tone = "default" }: PriceBlockProps) {
  const discount = getDiscountPercent({ price, mrp });
  const classes = SIZE_CLASSES[size];
  const isCard = tone === "card";
  return (
    <div className={`flex items-baseline gap-x-1.5 gap-y-0.5 ${isCard ? "flex-nowrap" : "flex-wrap"} ${className}`}>
      {isCard && <span className="text-[11px] font-medium text-muted-soft">From</span>}
      <span
        className={
          isCard
            ? "text-[15px] font-semibold leading-none tracking-tight text-ink tabular-nums"
            : `font-display font-bold text-ink ${classes.price}`
        }
      >
        {formatPrice(price)}
      </span>
      {discount > 0 && (
        <span
          className={
            isCard
              ? "text-[12px] tabular-nums text-muted-soft line-through"
              : `text-muted-soft line-through ${classes.mrp}`
          }
        >
          {formatPrice(mrp)}
        </span>
      )}
      {!isCard && discount > 0 && (
        <span className={`font-semibold text-success ${classes.discount}`}>{discount}% off</span>
      )}
    </div>
  );
}
