import "server-only";
import { getCategoryRepository } from "@/lib/config/providers";
import type {
  AdminCategory,
  AdminSubcategory,
  CategoryFormValues,
  SubcategoryFormValues,
} from "@/lib/core/ports/category.repository";

export type { AdminCategory, AdminSubcategory, CategoryFormValues, SubcategoryFormValues };

export async function listCategoriesForAdmin(): Promise<AdminCategory[]> {
  return getCategoryRepository().listCategoriesForAdmin();
}

export async function listSubcategoriesForAdmin(): Promise<AdminSubcategory[]> {
  const categories = await listCategoriesForAdmin();
  return categories.flatMap((c) => c.subcategories);
}

export async function createCategory(values: CategoryFormValues): Promise<{ id: string }> {
  return getCategoryRepository().createCategory(values);
}

export async function updateCategory(id: string, values: CategoryFormValues): Promise<void> {
  return getCategoryRepository().updateCategory(id, values);
}

export async function deleteCategory(id: string): Promise<void> {
  return getCategoryRepository().deleteCategory(id);
}

export async function setCategoryImage(id: string, imageUrl: string): Promise<void> {
  return getCategoryRepository().setCategoryImage(id, imageUrl);
}

export async function createSubcategory(values: SubcategoryFormValues): Promise<{ id: string }> {
  return getCategoryRepository().createSubcategory(values);
}

export async function updateSubcategory(id: string, values: SubcategoryFormValues): Promise<void> {
  return getCategoryRepository().updateSubcategory(id, values);
}

export async function deleteSubcategory(id: string): Promise<void> {
  return getCategoryRepository().deleteSubcategory(id);
}
