import { ShoppingBag } from "lucide-react";

interface ProductPlaceholderProps {
  className?: string;
}

/**
 * Shared placeholder for a product with no usable photo. Renders inside
 * everything from a 64px cart thumbnail up to a full-width detail gallery,
 * so it sizes itself off its own box (`@container`) rather than the
 * viewport — the "Product Image" label only shows once there's room for it
 * to read cleanly; small thumbnails fall back to the icon alone.
 */
export function ProductPlaceholder({ className = "" }: ProductPlaceholderProps) {
  return (
    <div className={`@container flex items-center justify-center bg-[#F7F7F5] ${className}`}>
      <div className="flex flex-col items-center gap-2 px-3 text-center">
        <ShoppingBag
          className="h-6 w-6 shrink-0 text-muted-soft @[140px]:h-8 @[140px]:w-8 @[320px]:h-10 @[320px]:w-10"
          strokeWidth={1.25}
        />
        <div className="hidden flex-col items-center gap-0.5 @[140px]:flex">
          <span className="text-[11px] font-medium text-muted @[320px]:text-sm">Product Image</span>
          <span className="text-[10px] text-muted-soft @[320px]:text-xs">Image coming soon</span>
        </div>
      </div>
    </div>
  );
}
