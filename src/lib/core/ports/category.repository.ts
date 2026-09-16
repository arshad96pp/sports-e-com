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

export interface AdminSubcategory {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
}

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

export interface SubcategoryFormValues {
  categoryId: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface CategoryRepository {
  getAllCategories(): Promise<CategoryDTO[]>;
  getCategoryBySlug(slug: string): Promise<CategoryDTO | undefined>;

  listCategoriesForAdmin(): Promise<AdminCategory[]>;
  createCategory(values: CategoryFormValues): Promise<{ id: string }>;
  updateCategory(id: string, values: CategoryFormValues): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  setCategoryImage(id: string, imageUrl: string): Promise<void>;

  createSubcategory(values: SubcategoryFormValues): Promise<{ id: string }>;
  updateSubcategory(id: string, values: SubcategoryFormValues): Promise<void>;
  deleteSubcategory(id: string): Promise<void>;
}
