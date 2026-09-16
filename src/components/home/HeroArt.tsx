import { categoryIcon } from "@/components/icons/SportIcons";
import type { CategorySlug } from "@/lib/types";

/**
 * Dark cinematic fallback for a hero slide with no uploaded photography yet
 * (a fresh/seeded store, or a banner an admin hasn't finished setting up) —
 * same visual language as <ProductArt>/<CategorySection>'s icon-on-tint
 * treatment, scaled up and darkened to match the hero's black/accent style
 * instead of using a mismatched stock photo.
 */
export function HeroArt({ category }: { category: string | null }) {
  const Icon = categoryIcon((category ?? "other") as CategorySlug);

  return (
    <div className="absolute inset-0 bg-linear-to-br from-ink via-ink to-[#161616]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 1px, transparent 18px)",
        }}
      />
      {/* Icon is chosen per-slide from a fixed set of stateless SVG icon components. */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon
        className="absolute -bottom-16 -right-16 h-[65vh] w-[65vh] max-w-none text-white/[0.07] sm:right-0"
        strokeWidth={0.75}
      />
    </div>
  );
}
