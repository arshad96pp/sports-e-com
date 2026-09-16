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
