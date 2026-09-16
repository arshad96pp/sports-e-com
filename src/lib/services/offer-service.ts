import "server-only";
import { getOfferRepository } from "@/lib/config/providers";
import type { OfferDTO } from "@/lib/core/ports/offer.repository";

export type { OfferDTO };

export async function getActiveOffers(): Promise<OfferDTO[]> {
  return getOfferRepository().getActiveOffers();
}

export async function getAllOffers(): Promise<OfferDTO[]> {
  return getOfferRepository().getAllOffers();
}
