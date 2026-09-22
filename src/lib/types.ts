export type CategorySlug = "football" | "cricket" | "tennis" | "other-accessories";

export type SortOption =
  | "recommended"
  | "newest"
  | "popular"
  | "price-low-high"
  | "price-high-low"
  | "discount"
  | "rating";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductImage {
  url: string;
  alt: string;
}

/**
 * A purchasable size variant of a product — its own authoritative price.
 * The one canonical variant shape used everywhere (product detail, cart,
 * checkout, admin form) instead of ad-hoc duplicates.
 */
export interface ProductVariant {
  id: string;
  size: string;
  price: number;
  mrp: number;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortInfo: string;
  category: CategorySlug;
  subcategory: string;
  brand: string;
  sport: string;
  productType: string;
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  colors: string[];
  sizes: string[];
  /** Purchasable size variants, each with its own price. Empty for a product that only has the base `price` above. */
  variants: ProductVariant[];
  description: string;
  highlights: string[];
  specs: ProductSpec[];
  images: ProductImage[];
  inStock: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  featured: boolean;
  dealOfTheDay: boolean;
  createdAt: string;
  soldCount: number;
}

export interface CartItem {
  productId: string;
  /** Identifies which size variant this line is for — the authoritative reference, never trust `size` alone for pricing. Null for a product with no variants. */
  variantId: string | null;
  quantity: number;
  size: string | null;
  color: string | null;
}

export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
}
