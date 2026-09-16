"use server";

import { revalidatePath } from "next/cache";
import { getSuperAdminOrNull } from "@/lib/auth/admin-guard";
import { updateStoreSettings, type StoreSettingsDTO } from "@/lib/services/settings-service";
import { processAndUploadImage } from "@/lib/services/image-service";
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

export async function uploadStoreLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };

  const result = await processAndUploadImage(file, "store-assets", "logo");
  if (!result.ok) return { ok: false, error: result.error };

  await updateStoreSettings({ logoUrl: result.publicUrl });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true, data: { url: result.publicUrl } };
}
