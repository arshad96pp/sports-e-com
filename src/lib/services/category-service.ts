import "server-only";
import { getCategoryRepository } from "@/lib/config/providers";
import type { CategoryDTO } from "@/lib/core/ports/category.repository";

export type { CategoryDTO };

export async function getAllCategories(): Promise<CategoryDTO[]> {
  return getCategoryRepository().getAllCategories();
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDTO | undefined> {
  return getCategoryRepository().getCategoryBySlug(slug);
}

export async function searchCategories(query: string): Promise<CategoryDTO[]> {
  const q = query.trim();
  if (!q) return [];
  const categories = await getAllCategories();
  const lower = q.toLowerCase();
  return categories.filter(
    (c) => c.name.toLowerCase().includes(lower) || c.subcategories.some((s) => s.toLowerCase().includes(lower))
  );
}
