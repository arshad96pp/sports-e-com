import "server-only";

/** Category repository — delegates to `category-service`, which calls the active `CategoryRepository` port (Supabase today, see `lib/config/providers.ts`). */
export {
  getAllCategories,
  getCategoryBySlug,
  searchCategories,
  type CategoryDTO,
} from "@/lib/services/category-service";
