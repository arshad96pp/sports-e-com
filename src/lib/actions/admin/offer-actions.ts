"use server";

import { revalidatePath } from "next/cache";
import { getSuperAdminOrNull } from "@/lib/auth/admin-guard";
import * as adminOfferService from "@/lib/services/admin-offer-service";
import type { OfferFormValues } from "@/lib/services/admin-offer-service";
import type { ActionResult } from "@/lib/actions/admin/product-actions";

export async function createOfferAction(values: OfferFormValues): Promise<ActionResult<{ id: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    const result = await adminOfferService.createOffer(values);
    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create offer." };
  }
}

export async function updateOfferAction(id: string, values: OfferFormValues): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    await adminOfferService.updateOffer(id, values);
    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update offer." };
  }
}

export async function deleteOfferAction(id: string): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    await adminOfferService.deleteOffer(id);
    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not delete offer." };
  }
}
