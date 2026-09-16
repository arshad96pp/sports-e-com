"use server";

import { revalidatePath } from "next/cache";
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
}

export async function createProductAction(values: ProductFormValues): Promise<ActionResult<{ id: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  try {
    const result = await adminProductService.createProduct(values);
    revalidateStorefront();
    revalidatePath("/admin/products");
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create product." };
  }
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
    await adminProductService.deleteProduct(id);
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

  await adminProductService.setProductActive(id, isActive);
  revalidateStorefront();
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function uploadProductImageAction(
  productId: string,
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };

  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const result = await processAndUploadImage(file, "product-images", productId);
  if (!result.ok) return { ok: false, error: result.error };

  try {
    await adminProductService.addProductImage(productId, result.publicUrl, "", sortOrder);
  } catch (error) {
    await deleteImage("product-images", result.path);
    return { ok: false, error: error instanceof Error ? error.message : "Could not save image." };
  }

  revalidateStorefront();
  revalidatePath(`/admin/products/${productId}/edit`);
  return { ok: true, data: { url: result.publicUrl } };
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
