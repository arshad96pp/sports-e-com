import "server-only";
import { unstable_cache } from "next/cache";
import { getHeroBannerRepository } from "@/lib/config/providers";
import type { HeroBannerDTO } from "@/lib/core/ports/hero-banner.repository";

export type { HeroBannerDTO };

/** Public, admin-managed, rendered on every home page load — see category-service's getAllCategories for the same pattern. */
export const getActiveHeroBanners = unstable_cache(
  async (): Promise<HeroBannerDTO[]> => getHeroBannerRepository().getActiveHeroBanners(),
  ["hero-banners:active"],
  { tags: ["banners"], revalidate: 120 }
);

export async function getAllHeroBanners(): Promise<HeroBannerDTO[]> {
  return getHeroBannerRepository().getAllHeroBanners();
}
