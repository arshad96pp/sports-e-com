import "server-only";
import { getHeroBannerRepository } from "@/lib/config/providers";
import type { AdminHeroBannerListItem, BannerFormValues, BannerImageUrls } from "@/lib/core/ports/hero-banner.repository";

export type { AdminHeroBannerListItem, BannerFormValues, BannerImageUrls };

/** Admin list view — every banner (not just active), with the raw `categoryId` the edit dialog needs. */
export async function listBannersForAdmin(): Promise<AdminHeroBannerListItem[]> {
  return getHeroBannerRepository().listBannersForAdmin();
}

export async function createBanner(values: BannerFormValues): Promise<{ id: string }> {
  return getHeroBannerRepository().createBanner(values);
}

export async function updateBanner(id: string, values: BannerFormValues): Promise<void> {
  return getHeroBannerRepository().updateBanner(id, values);
}

export async function getBannerImageUrls(id: string): Promise<BannerImageUrls | null> {
  return getHeroBannerRepository().getBannerImageUrls(id);
}

/** Returns the image URLs the deleted row held, so the caller can clean up Storage. */
export async function deleteBanner(id: string): Promise<BannerImageUrls | null> {
  return getHeroBannerRepository().deleteBanner(id);
}

export async function setBannerImage(id: string, field: "imageUrlDesktop" | "imageUrlMobile", url: string): Promise<void> {
  return getHeroBannerRepository().setBannerImage(id, field, url);
}
