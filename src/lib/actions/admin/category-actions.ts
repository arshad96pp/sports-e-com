"use server";

import { revalidatePath } from "next/cache";
import { getSuperAdminOrNull } from "@/lib/auth/admin-guard";
import * as adminCategoryService from "@/lib/services/admin-category-service";
import type { CategoryFormValues, SubcategoryFormValues } from "@/lib/services/admin-category-service";
import { processAndUploadImage } from "@/lib/services/image-service";
import type { ActionResult } from "@/lib/actions/admin/product-actions";

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/category/[slug]", "page");
}

export async function createCategoryAction(values: CategoryFormValues): Promise<ActionResult<{ id: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    const result = await adminCategoryService.createCategory(values);
    revalidateStorefront();
    revalidatePath("/admin/categories");
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create category." };
  }
}

export async function updateCategoryAction(id: string, values: CategoryFormValues): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    await adminCategoryService.updateCategory(id, values);
    revalidateStorefront();
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update category." };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    await adminCategoryService.deleteCategory(id);
    revalidateStorefront();
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not delete category. Remove its products/subcategories first." };
  }
}

export async function uploadCategoryImageAction(categoryId: string, formData: FormData): Promise<ActionResult<{ url: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };

  const result = await processAndUploadImage(file, "category-images", categoryId);
  if (!result.ok) return { ok: false, error: result.error };

  await adminCategoryService.setCategoryImage(categoryId, result.publicUrl);
  revalidateStorefront();
  revalidatePath("/admin/categories");
  return { ok: true, data: { url: result.publicUrl } };
}

export async function createSubcategoryAction(values: SubcategoryFormValues): Promise<ActionResult<{ id: string }>> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    const result = await adminCategoryService.createSubcategory(values);
    revalidateStorefront();
    revalidatePath("/admin/subcategories");
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create subcategory." };
  }
}

export async function updateSubcategoryAction(id: string, values: SubcategoryFormValues): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    await adminCategoryService.updateSubcategory(id, values);
    revalidateStorefront();
    revalidatePath("/admin/subcategories");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update subcategory." };
  }
}

export async function deleteSubcategoryAction(id: string): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  try {
    await adminCategoryService.deleteSubcategory(id);
    revalidateStorefront();
    revalidatePath("/admin/subcategories");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not delete subcategory." };
  }
}
