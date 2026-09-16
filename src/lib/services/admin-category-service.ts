import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  description: string;
  listingBlurb: string;
  seoTitle: string;
  seoDescription: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  subcategories: AdminSubcategory[];
}

export interface AdminSubcategory {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
}

export async function listCategoriesForAdmin(): Promise<AdminCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select(
      "id, name, slug, short_name, description, listing_blurb, seo_title, seo_description, image_url, sort_order, is_active, subcategories ( id, category_id, name, slug, image_url, is_active )"
    )
    .order("sort_order", { ascending: true });

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    shortName: c.short_name,
    description: c.description,
    listingBlurb: c.listing_blurb,
    seoTitle: c.seo_title ?? "",
    seoDescription: c.seo_description ?? "",
    imageUrl: c.image_url,
    sortOrder: c.sort_order,
    isActive: c.is_active,
    subcategories: (c.subcategories ?? []).map((s) => ({
      id: s.id,
      categoryId: s.category_id,
      categoryName: c.name,
      name: s.name,
      slug: s.slug,
      imageUrl: s.image_url,
      isActive: s.is_active,
    })),
  }));
}

export async function listSubcategoriesForAdmin(): Promise<AdminSubcategory[]> {
  const categories = await listCategoriesForAdmin();
  return categories.flatMap((c) => c.subcategories);
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  shortName: string;
  description: string;
  listingBlurb: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  isActive: boolean;
  icon: string;
}

export async function createCategory(values: CategoryFormValues): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: values.name,
      slug: values.slug,
      short_name: values.shortName,
      description: values.description,
      listing_blurb: values.listingBlurb,
      seo_title: values.seoTitle || null,
      seo_description: values.seoDescription || null,
      sort_order: values.sortOrder,
      is_active: values.isActive,
      icon: values.icon,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create category.");
  return { id: data.id };
}

export async function updateCategory(id: string, values: CategoryFormValues): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: values.name,
      slug: values.slug,
      short_name: values.shortName,
      description: values.description,
      listing_blurb: values.listingBlurb,
      seo_title: values.seoTitle || null,
      seo_description: values.seoDescription || null,
      sort_order: values.sortOrder,
      is_active: values.isActive,
      icon: values.icon,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setCategoryImage(id: string, imageUrl: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("categories").update({ image_url: imageUrl }).eq("id", id);
}

export interface SubcategoryFormValues {
  categoryId: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export async function createSubcategory(values: SubcategoryFormValues): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subcategories")
    .insert({ category_id: values.categoryId, name: values.name, slug: values.slug, is_active: values.isActive })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create subcategory.");
  return { id: data.id };
}

export async function updateSubcategory(id: string, values: SubcategoryFormValues): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("subcategories")
    .update({ category_id: values.categoryId, name: values.name, slug: values.slug, is_active: values.isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteSubcategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
