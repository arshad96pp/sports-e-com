import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { isUniqueViolation } from "@/lib/utils/db-errors";
import type { CategorySlug } from "@/lib/types";
import type {
  AdminCategory,
  CategoryDTO,
  CategoryFormValues,
  CategoryRepository,
  SubcategoryFormValues,
} from "@/lib/core/ports/category.repository";

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  listing_blurb: string;
  image_url: string | null;
  icon: string;
  subcategories: { name: string; is_active?: boolean }[] | null;
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

export function createSupabaseCategoryRepository(): CategoryRepository {
  return {
    async getAllCategories(): Promise<CategoryDTO[]> {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("categories")
        .select(CATEGORY_SELECT)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      return ((data as unknown as CategoryRow[]) ?? []).map((c) => ({
        ...toDTO(c),
        subcategories: (c.subcategories ?? [])
          .filter((s) => s.is_active !== false)
          .map((s) => s.name)
          .sort(),
      }));
    },

    async getCategoryBySlug(slug: string): Promise<CategoryDTO | undefined> {
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
          .filter((s) => s.is_active !== false)
          .map((s) => s.name)
          .sort(),
      };
    },

    async listCategoriesForAdmin(): Promise<AdminCategory[]> {
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
    },

    async createCategory(values: CategoryFormValues): Promise<{ id: string }> {
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
      if (error) {
        if (isUniqueViolation(error, "slug")) throw new Error(`Slug "${values.slug}" is already in use. Choose a different slug.`);
        throw new Error(error.message);
      }
      if (!data) throw new Error("Could not create category.");
      return { id: data.id };
    },

    async updateCategory(id: string, values: CategoryFormValues): Promise<void> {
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
      if (error) {
        if (isUniqueViolation(error, "slug")) throw new Error(`Slug "${values.slug}" is already in use. Choose a different slug.`);
        throw new Error(error.message);
      }
    },

    async deleteCategory(id: string): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },

    async setCategoryImage(id: string, imageUrl: string): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase.from("categories").update({ image_url: imageUrl }).eq("id", id);
      if (error) throw new Error(error.message);
    },

    async createSubcategory(values: SubcategoryFormValues): Promise<{ id: string }> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("subcategories")
        .insert({ category_id: values.categoryId, name: values.name, slug: values.slug, is_active: values.isActive })
        .select("id")
        .single();
      if (error) {
        if (isUniqueViolation(error, "slug")) {
          throw new Error(`Slug "${values.slug}" is already used by another subcategory in this category.`);
        }
        throw new Error(error.message);
      }
      if (!data) throw new Error("Could not create subcategory.");
      return { id: data.id };
    },

    async updateSubcategory(id: string, values: SubcategoryFormValues): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase
        .from("subcategories")
        .update({ category_id: values.categoryId, name: values.name, slug: values.slug, is_active: values.isActive })
        .eq("id", id);
      if (error) {
        if (isUniqueViolation(error, "slug")) {
          throw new Error(`Slug "${values.slug}" is already used by another subcategory in this category.`);
        }
        throw new Error(error.message);
      }
    },

    async deleteSubcategory(id: string): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase.from("subcategories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  };
}
