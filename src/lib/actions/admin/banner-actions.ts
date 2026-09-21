"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getSuperAdminOrNull } from "@/lib/auth/admin-guard";
import * as adminBannerService from "@/lib/services/admin-banner-service";
import type { BannerFormValues } from "@/lib/services/admin-banner-service";
import { processAndUploadImage, deleteImage, pathFromPublicUrl } from "@/lib/services/image-service";
import type { ActionResult } from "@/lib/actions/admin/product-actions";

async function deleteBannerImageIfAny(url: string): Promise<void> {
  if (!url) return;
  const path = pathFromPublicUrl("banner-images", url);
  if (path) await deleteImage("banner-images", path);
}

function revalidateStorefront() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
  revalidateTag("banners", { expire: 0 });
}

export async function createBannerAction(values: BannerFormValues): Promise<ActionResult<{ id: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    const result = await adminBannerService.createBanner(values);
    revalidateStorefront();
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create banner." };
  }
}

export async function updateBannerAction(id: string, values: BannerFormValues): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    await adminBannerService.updateBanner(id, values);
    revalidateStorefront();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update banner." };
  }
}

export async function deleteBannerAction(id: string): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    const removedImages = await adminBannerService.deleteBanner(id);
    if (removedImages) {
      await Promise.all([
        deleteBannerImageIfAny(removedImages.imageUrlDesktop),
        deleteBannerImageIfAny(removedImages.imageUrlMobile),
      ]);
    }
    revalidateStorefront();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not delete banner." };
  }
}

export async function uploadBannerImageAction(
  bannerId: string,
  field: "imageUrlDesktop" | "imageUrlMobile",
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };

  const previousUrls = await adminBannerService.getBannerImageUrls(bannerId);
  const result = await processAndUploadImage(file, "banner-images", bannerId);
  if (!result.ok) return { ok: false, error: result.error };

  try {
    await adminBannerService.setBannerImage(bannerId, field, result.publicUrl);
  } catch (error) {
    await deleteBannerImageIfAny(result.publicUrl);
    return { ok: false, error: error instanceof Error ? error.message : "Could not save image." };
  }

  const previousUrl = previousUrls ? previousUrls[field] : null;
  if (previousUrl) await deleteBannerImageIfAny(previousUrl);

  revalidateStorefront();
  return { ok: true, data: { url: result.publicUrl } };
}


export async function removeBannerImageAction(
  bannerId: string,
  field: "imageUrlDesktop" | "imageUrlMobile"
): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  try {
    const previousUrls = await adminBannerService.getBannerImageUrls(bannerId);
    await adminBannerService.setBannerImage(bannerId, field, "");
    const previousUrl = previousUrls ? previousUrls[field] : null;
    if (previousUrl) await deleteBannerImageIfAny(previousUrl);
    revalidateStorefront();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not remove image." };
  }
}
