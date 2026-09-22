import type { CategorySlug, Product, ProductSpec, SortOption } from "@/lib/types";

export interface ProductQueryParams {
  category?: CategorySlug;
  featured?: boolean;
  bestSeller?: boolean;
  dealOfTheDay?: boolean;
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

export type AdminProductSort = "newest" | "oldest" | "name-asc" | "name-desc" | "price-low-high" | "price-high-low" | "stock-low-high";

export interface AdminProductQueryParams {
  search?: string;
  categoryId?: string;
  status?: "active" | "inactive";
  sort?: AdminProductSort;
  page?: number;
  pageSize?: number;
}

export interface AdminProductQueryResult {
  products: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** A variant row as the admin form edits it — `id` is absent/undefined for a not-yet-saved new variant. */
export interface VariantInput {
  id?: string;
  size: string;
  price: number;
  mrp: number;
  stock: number;
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
  variants: VariantInput[];
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


export interface ProductRepository {
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  getAllProductSlugs(): Promise<string[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: CategorySlug): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getBestSellers(limit?: number): Promise<Product[]>;
  getRecentProducts(limit?: number): Promise<Product[]>;
  getDealOfTheDayProducts(limit?: number): Promise<Product[]>;
  getRelatedProducts(product: Pick<Product, "id" | "category">, limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getProductFilterOptions(category?: CategorySlug): Promise<ProductFilterOptions>;
  queryProducts(params: ProductQueryParams): Promise<ProductQueryResult>;

  listProductsForAdmin(params?: AdminProductQueryParams): Promise<AdminProductQueryResult>;
  getProductForAdmin(id: string): Promise<AdminProductDetail | null>;
  createProduct(values: ProductFormValues, options?: { autoSku?: boolean }): Promise<{ id: string }>;
  updateProduct(id: string, values: ProductFormValues): Promise<void>;
  /** Returns the image URLs the deleted product held, so the caller can clean up Storage. */
  deleteProduct(id: string): Promise<{ imageUrls: string[] }>;
  setProductActive(id: string, isActive: boolean): Promise<void>;
  addProductImage(productId: string, url: string, altText: string, sortOrder: number): Promise<{ id: string }>;
  deleteProductImage(imageId: string): Promise<void>;
  /** Best-effort SKU preview for the create form: PREFIX-NNN, next free number for that prefix. */
  previewNextSku(slugOrPrefix: string): Promise<string>;
  /** Live uniqueness check for the SKU input (excludeId lets an existing product's own SKU pass). */
  isSkuAvailable(sku: string, excludeId?: string): Promise<boolean>;
}
