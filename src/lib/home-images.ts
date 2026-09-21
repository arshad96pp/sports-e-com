import type { CategorySlug } from "@/lib/types";

/**
 * Static homepage photography. Swap the files in `/public/images/home`
 * to update campaign/category visuals — no CMS or API required.
 */
export const HOME_IMAGES = {
  categories: {
    football: "/images/home/category-football.webp",
    cricket: "/images/home/category-cricket.webp",
    tennis: "/images/home/category-tennis.webp",
    "other-accessories": "/images/home/category-other.webp",
  } satisfies Partial<Record<CategorySlug, string>>,
  campaign: "/images/home/campaign-gear-up.webp",
  sportStory: "/images/home/story-football.webp",
  /** Used only when no admin-managed hero banners are active — keep distinct from `campaign` so the fallback hero and the mid-page campaign banner never show the same photo. */
  fallbackHero: "/images/home/story-football.webp",
} as const;

export function categoryImageSrc(slug: string): string | undefined {
  return HOME_IMAGES.categories[slug as CategorySlug];
}
