import type { CategorySlug, Product, ProductSpec, SortOption } from "@/lib/types";

export interface ProductQueryParams {
  category?: CategorySlug;
  search?: string;
  subcategories?: string[];
  brands?: string[];
  productTypes?: string[];
  colors?: string[];
  sizes?: string[];
  minRating?: number;
  minDiscount?: number;
  inStockOnly?: boolean;
  priceMin?: number;
  priceMax?: number;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface ProductQueryResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface ProductFilterOptions {
  subcategories: string[];
  brands: string[];
  sports: string[];
  productTypes: string[];
  colors: string[];
  sizes: string[];
  priceMin: number;
  priceMax: number;
}

export interface AdminProductListItem {
  id: string;
  name: string;
  sku: string;
  slug: string;
  categoryName: string;
  brand: string;
  price: number;
  mrp: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  thumbnailUrl: string | null;
}

export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  categoryId: string;
  subcategoryId: string | null;
  brand: string;
  sport: string;
  productType: string;
  price: number;
  mrp: number;
  stock: number;
  sizes: string[];
  colors: string[];
  highlights: string[];
  specifications: ProductSpec[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isDealOfTheDay: boolean;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface AdminProductDetail extends ProductFormValues {
  id: string;
  images: { id: string; url: string; altText: string; sortOrder: number }[];
}

/**
 * Everything that reads/writes the `products` domain. Business rules that
 * operate on already-fetched `Product` DTOs (e.g. "what counts as a deal",
 * discount math) live in `product-service.ts`, not here — this port only
 * covers "how do I ask the current provider for product data."
 */
export interface ProductRepository {
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  getAllProductSlugs(): Promise<string[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: CategorySlug): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getBestSellers(limit?: number): Promise<Product[]>;
  /** Active products, newest first, up to `limit` — the raw candidate pool `getDealProducts` applies its business rule to. */
  getRecentProducts(limit?: number): Promise<Product[]>;
  getRelatedProducts(product: Pick<Product, "id" | "category">, limit?: number): Promise<Product[]>;
  getFrequentlyBoughtWith(
    product: Pick<Product, "id" | "category" | "subcategory">,
    limit?: number
  ): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getProductFilterOptions(category?: CategorySlug): Promise<ProductFilterOptions>;
  queryProducts(params: ProductQueryParams): Promise<ProductQueryResult>;

  listProductsForAdmin(): Promise<AdminProductListItem[]>;
  getProductForAdmin(id: string): Promise<AdminProductDetail | null>;
  createProduct(values: ProductFormValues): Promise<{ id: string }>;
  updateProduct(id: string, values: ProductFormValues): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  setProductActive(id: string, isActive: boolean): Promise<void>;
  addProductImage(productId: string, url: string, altText: string, sortOrder: number): Promise<void>;
  deleteProductImage(imageId: string): Promise<void>;
}
