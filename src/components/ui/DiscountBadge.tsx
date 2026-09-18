import { cn } from "cn";
import { Badge } from "@/components/ui/badge";

interface DiscountBadgeProps {
  percent: number;
  className?: string;
}

export function DiscountBadge({ percent, className = "" }: DiscountBadgeProps) {
  if (percent <= 0) return null;
  return (
    <Badge
      variant="destructive"
      className={cn(
        "h-auto rounded-md bg-signal px-1.5 py-0.5 text-[11px] font-bold text-white",
        className
      )}
    >
      {percent}% OFF
    </Badge>
  );
}
