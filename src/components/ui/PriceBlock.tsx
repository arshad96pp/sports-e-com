import { formatPrice } from "@/lib/utils/format";
import { getDiscountPercent } from "@/lib/data/products";

interface PriceBlockProps {
  price: number;
  mrp: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: { price: "text-sm", mrp: "text-xs", discount: "text-xs" },
  md: { price: "text-lg", mrp: "text-sm", discount: "text-sm" },
  lg: { price: "text-3xl", mrp: "text-base", discount: "text-sm" },
};

export function PriceBlock({ price, mrp, size = "sm", className = "" }: PriceBlockProps) {
  const discount = getDiscountPercent({ price, mrp });
  const classes = SIZE_CLASSES[size];
  return (
    <div className={`flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 ${className}`}>
      <span className={`font-display font-bold text-ink ${classes.price}`}>{formatPrice(price)}</span>
      {discount > 0 && (
        <>
          <span className={`text-muted-soft line-through ${classes.mrp}`}>{formatPrice(mrp)}</span>
          <span className={`font-semibold text-success ${classes.discount}`}>{discount}% off</span>
        </>
      )}
    </div>
  );
}
