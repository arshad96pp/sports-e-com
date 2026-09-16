import "server-only";
import { unstable_cache } from "next/cache";
import { getCategoryRepository } from "@/lib/config/providers";
import type { CategoryDTO } from "@/lib/core/ports/category.repository";

export type { CategoryDTO };

/**
 * Categories are public, near-static (admin-edited rarely), and — before this
 * cache — were re-queried 2-3x per customer page load (Header + Footer, plus
 * CategorySection on home). `revalidate: 120` is a safety-net TTL; admin
 * category actions call `revalidateTag("categories", { expire: 0 })` for
 * instant invalidation on edit.
 */
export const getAllCategories = unstable_cache(
  async (): Promise<CategoryDTO[]> => getCategoryRepository().getAllCategories(),
  ["categories:all"],
  { tags: ["categories"], revalidate: 120 }
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<CategoryDTO | undefined> => getCategoryRepository().getCategoryBySlug(slug),
  ["categories:by-slug"],
  { tags: ["categories"], revalidate: 120 }
);

export async function searchCategories(query: string): Promise<CategoryDTO[]> {
  const q = query.trim();
  if (!q) return [];
  const categories = await getAllCategories();
  const lower = q.toLowerCase();
  return categories.filter(
    (c) => c.name.toLowerCase().includes(lower) || c.subcategories.some((s) => s.toLowerCase().includes(lower))
  );
}
