"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getSuperAdminOrNull } from "@/lib/auth/admin-guard";
import * as adminProductService from "@/lib/services/admin-product-service";
import type { ProductFormValues } from "@/lib/services/admin-product-service";
import { processAndUploadImage, deleteImage, pathFromPublicUrl } from "@/lib/services/image-service";

export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/search");
  // `revalidatePath` above only busts the route cache — the `unstable_cache`
  // wrappers in product-service.ts (featured/best-sellers/deals/filter
  // options) need their own tag invalidated so edits show up immediately
  // instead of waiting out the 120s safety-net TTL.
  revalidateTag("products", { expire: 0 });
}

export async function createProductAction(
  values: ProductFormValues,
  options?: { autoSku?: boolean }
): Promise<ActionResult<{ id: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  try {
    const result = await adminProductService.createProduct(values, options);
    revalidateStorefront();
    revalidatePath("/admin/products");
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create product." };
  }
}

export async function previewSkuAction(slugOrPrefix: string): Promise<ActionResult<{ sku: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const sku = await adminProductService.previewNextSku(slugOrPrefix);
  return { ok: true, data: { sku } };
}

export async function checkSkuAvailableAction(sku: string, excludeId?: string): Promise<ActionResult<{ available: boolean }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const available = await adminProductService.isSkuAvailable(sku, excludeId);
  return { ok: true, data: { available } };
}

export async function updateProductAction(id: string, values: ProductFormValues): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  try {
    await adminProductService.updateProduct(id, values);
    revalidateStorefront();
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update product." };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  try {
    const { imageUrls } = await adminProductService.deleteProduct(id);
    await Promise.all(
      imageUrls.map((url) => {
        const path = pathFromPublicUrl("product-images", url);
        return path ? deleteImage("product-images", path) : Promise.resolve();
      })
    );
    revalidateStorefront();
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not delete product." };
  }
}

export async function setProductActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  try {
    await adminProductService.setProductActive(id, isActive);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update product." };
  }
  revalidateStorefront();
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function uploadProductImageAction(
  productId: string,
  formData: FormData
): Promise<ActionResult<{ url: string; id: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };

  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const result = await processAndUploadImage(file, "product-images", productId);
  if (!result.ok) return { ok: false, error: result.error };

  let image: { id: string };
  try {
    image = await adminProductService.addProductImage(productId, result.publicUrl, "", sortOrder);
  } catch (error) {
    await deleteImage("product-images", result.path);
    return { ok: false, error: error instanceof Error ? error.message : "Could not save image." };
  }

  revalidateStorefront();
  revalidatePath(`/admin/products/${productId}/edit`);
  return { ok: true, data: { url: result.publicUrl, id: image.id } };
}

export async function deleteProductImageAction(productId: string, imageId: string, imageUrl: string): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  await adminProductService.deleteProductImage(imageId);
  const path = pathFromPublicUrl("product-images", imageUrl);
  if (path) await deleteImage("product-images", path);

  revalidateStorefront();
  revalidatePath(`/admin/products/${productId}/edit`);
  return { ok: true };
}
