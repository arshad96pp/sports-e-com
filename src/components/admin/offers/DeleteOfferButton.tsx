"use client";

import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteOfferAction } from "@/lib/actions/admin/offer-actions";

export function DeleteOfferButton({ offerId, offerTitle }: { offerId: string; offerTitle: string }) {
  return <ConfirmDeleteButton itemLabel={offerTitle} onConfirm={() => deleteOfferAction(offerId)} />;
}
