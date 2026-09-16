import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { CategorySlug } from "@/lib/types";

export interface CategoryDTO {
  id: string;
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  listingBlurb: string;
  imageUrl: string | null;
  subcategories: string[];
  icon: "football" | "cricket" | "tennis" | "other";
}

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  listing_blurb: string;
  image_url: string | null;
  icon: string;
  subcategories: { name: string }[] | null;
}

function toDTO(c: CategoryRow): CategoryDTO {
  return {
    id: c.id,
    slug: c.slug as CategorySlug,
    name: c.name,
    shortName: c.short_name,
    description: c.description,
    listingBlurb: c.listing_blurb,
    imageUrl: c.image_url,
    subcategories: (c.subcategories ?? []).map((s) => s.name),
    icon: c.icon as CategoryDTO["icon"],
  };
}

const CATEGORY_SELECT = `
  id, slug, name, short_name, description, listing_blurb, image_url, icon,
  subcategories ( name, is_active )
`;

export async function getAllCategories(): Promise<CategoryDTO[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return ((data as unknown as CategoryRow[]) ?? []).map((c) => ({
    ...toDTO(c),
    subcategories: (c.subcategories ?? [])
      .filter((s) => (s as { is_active?: boolean }).is_active !== false)
      .map((s) => s.name)
      .sort(),
  }));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDTO | undefined> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) return undefined;
  const row = data as unknown as CategoryRow;
  return {
    ...toDTO(row),
    subcategories: (row.subcategories ?? [])
      .filter((s) => (s as { is_active?: boolean }).is_active !== false)
      .map((s) => s.name)
      .sort(),
  };
}

export async function searchCategories(query: string): Promise<CategoryDTO[]> {
  const q = query.trim();
  if (!q) return [];
  const categories = await getAllCategories();
  const lower = q.toLowerCase();
  return categories.filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      c.subcategories.some((s) => s.toLowerCase().includes(lower))
  );
}
