"use server";

import { revalidatePath } from "next/cache";
import { getSuperAdminOrNull } from "@/lib/auth/admin-guard";
import { updateStoreSettings, type StoreSettingsDTO } from "@/lib/services/settings-service";
import type { ActionResult } from "@/lib/actions/admin/product-actions";

export async function updateStoreSettingsAction(
  values: Partial<Omit<StoreSettingsDTO, "id">>
): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  try {
    await updateStoreSettings(values);
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save settings." };
  }
}
