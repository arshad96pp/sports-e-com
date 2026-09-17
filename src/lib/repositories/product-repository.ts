import "server-only";


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
  searchProducts,
} from "@/lib/services/product-service";
