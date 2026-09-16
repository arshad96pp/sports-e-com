import "server-only";

/**
 * Product repository — the only module pages/server components should
 * import product data from. This now delegates straight to the Prisma-backed
 * product service; kept as a thin re-export so page imports never had to
 * change when the mock `lib/data` source was swapped for the real database.
 */
export {
  getAllProducts,
  getAllProductSlugs,
  getProductBySlug,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  getBestSellers,
  getDealProducts,
  getRelatedProducts,
  getFrequentlyBoughtWith,
  searchProducts,
} from "@/lib/services/product-service";
