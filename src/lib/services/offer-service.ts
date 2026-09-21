import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getOfferRepository } from "@/lib/config/providers";
import type { OfferDTO } from "@/lib/core/ports/offer.repository";
import { filterStorefrontOffers, pickBestOfferForCategory } from "@/lib/utils/offers";

export type { OfferDTO };

/**
 * Public, admin-managed, date-windowed offers. Short TTL because validity
 * depends on `now`; admin offer actions also call `revalidateTag("offers")`.
 */
export const getActiveOffers = unstable_cache(
  async (): Promise<OfferDTO[]> => getOfferRepository().getActiveOffers(),
  ["offers:active"],
  { tags: ["offers"], revalidate: 60 }
);

export async function getAllOffers(): Promise<OfferDTO[]> {
  return getOfferRepository().getAllOffers();
}

export const getStorefrontOffers = cache(async (): Promise<OfferDTO[]> => {
  try {
    return filterStorefrontOffers(await getActiveOffers());
  } catch {
    return [];
  }
});

export async function getStorefrontOfferForCategory(slug: string): Promise<OfferDTO | undefined> {
  return pickBestOfferForCategory(await getStorefrontOffers(), slug);
}
