import "server-only";
import { getOfferRepository } from "@/lib/config/providers";
import type { AdminOffer, OfferFormValues } from "@/lib/core/ports/offer.repository";

export type { AdminOffer, OfferFormValues };

export async function listOffersForAdmin(): Promise<AdminOffer[]> {
  return getOfferRepository().listOffersForAdmin();
}

export async function createOffer(values: OfferFormValues): Promise<{ id: string }> {
  return getOfferRepository().createOffer(values);
}

export async function updateOffer(id: string, values: OfferFormValues): Promise<void> {
  return getOfferRepository().updateOffer(id, values);
}

export async function deleteOffer(id: string): Promise<void> {
  return getOfferRepository().deleteOffer(id);
}
