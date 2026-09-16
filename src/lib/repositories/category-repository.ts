import "server-only";

/** Category repository — delegates to the Prisma-backed category service. */
export {
  getAllCategories,
  getCategoryBySlug,
  searchCategories,
  type CategoryDTO,
} from "@/lib/services/category-service";
