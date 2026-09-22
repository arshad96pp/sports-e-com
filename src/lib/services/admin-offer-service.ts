import "server-only";
import { getOfferRepository } from "@/lib/config/providers";
import type { AdminOffer, OfferFormValues } from "@/lib/core/ports/offer.repository";

export type { AdminOffer, OfferFormValues };

export async function listOffersForAdmin(): Promise<AdminOffer[]> {
  return getOfferRepository().listOffersForAdmin();
}

function assertValidOffer(values: OfferFormValues): void {
  if (!Number.isFinite(values.discountPercent) || values.discountPercent < 0 || values.discountPercent > 100) {
    throw new Error("Discount must be between 0 and 100%.");
  }
  if (new Date(values.startDate) >= new Date(values.endDate)) {
    throw new Error("The end date must be after the start date.");
  }
  if (!values.categoryIds[0]) {
    throw new Error("Select a category.");
  }
}

export async function createOffer(values: OfferFormValues): Promise<{ id: string }> {
  assertValidOffer(values);
  return getOfferRepository().createOffer(values);
}

export async function updateOffer(id: string, values: OfferFormValues): Promise<void> {
  assertValidOffer(values);
  return getOfferRepository().updateOffer(id, values);
}

export async function deleteOffer(id: string): Promise<void> {
  return getOfferRepository().deleteOffer(id);
}
