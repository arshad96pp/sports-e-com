import "server-only";
import { getHeroBannerRepository } from "@/lib/config/providers";
import type { HeroBannerDTO } from "@/lib/core/ports/hero-banner.repository";

export type { HeroBannerDTO };

export async function getActiveHeroBanners(): Promise<HeroBannerDTO[]> {
  return getHeroBannerRepository().getActiveHeroBanners();
}

export async function getAllHeroBanners(): Promise<HeroBannerDTO[]> {
  return getHeroBannerRepository().getAllHeroBanners();
}
