import { categoryIcon, OTHER_ICONS } from "@/components/icons/SportIcons";
import type { Product } from "@/lib/types";

const TINTS = [
  "bg-surface",
  "bg-surface-strong",
  "bg-accent-soft",
  "bg-signal-soft",
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface ProductArtProps {
  product: Pick<Product, "id" | "category" | "name">;
  className?: string;
  variant?: number;
  iconClassName?: string;
  /** Neutral studio treatment for product cards — no tint, stripes, or rotation. */
  studio?: boolean;
}

const VARIANT_TRANSFORMS = [
  "rotate-0",
  "-rotate-6 scale-x-[-1]",
  "rotate-6",
  "rotate-[-3deg] scale-x-[-1]",
];

export function ProductArt({
  product,
  className = "",
  variant = 0,
  iconClassName = "",
  studio = false,
}: ProductArtProps) {
  const hash = hashString(product.id);
  const tint = studio ? "bg-[#fafafa]" : TINTS[hash % TINTS.length];
  const Icon =
    product.category === "other-accessories"
      ? OTHER_ICONS[hash % OTHER_ICONS.length]
      : categoryIcon(product.category);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${tint} ${className}`}
    >
      {!studio && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)",
          }}
        />
      )}
      {/* Icon is chosen per-product from a fixed set of stateless SVG icon components. */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon
        className={
          studio
            ? `h-[42%] w-[42%] text-ink/70 transition-transform duration-200 ease-out group-hover:scale-[1.03] ${iconClassName}`
            : `h-[42%] w-[42%] text-ink transition-transform duration-300 ease-out group-hover:scale-110 ${VARIANT_TRANSFORMS[variant % VARIANT_TRANSFORMS.length]} ${iconClassName}`
        }
        strokeWidth={1.5}
      />
    </div>
  );
}
