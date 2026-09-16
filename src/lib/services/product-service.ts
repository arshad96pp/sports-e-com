import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { CategorySlug, Product, ProductSpec, SortOption } from "@/lib/types";

// `category` uses an inner join (`!inner`) so that `.eq("category.slug", …)`
// actually restricts which product rows come back — and therefore makes the
// paired `count`/`range()` pagination on `queryProducts` accurate — instead of
// PostgREST's default embed behaviour, which only filters the embedded object
// and leaves every parent row in place. Safe to always use: every product has
// a required (NOT NULL) category, so this never drops rows a left join would
// have kept.
const PRODUCT_SELECT = `
  *,
  category:categories!inner ( slug, name ),
  subcategory:subcategories ( name ),
  product_images ( url, alt_text, sort_order )
`;

interface ProductRow {
  id: string;
  sku: string;
  slug: string;
  name: string;
  short_description: string;
  brand: string;
  sport: string;
  product_type: string;
  price: number;
  mrp: number;
  rating: number;
  review_count: number;
  colors: string[];
  sizes: string[];
  description: string;
  highlights: string[];
  specifications: unknown;
  stock: number;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_featured: boolean;
  is_deal_of_the_day: boolean;
  created_at: string;
  sold_count: number;
  category: { slug: string; name: string } | null;
  subcategory: { name: string } | null;
  product_images: { url: string; alt_text: string; sort_order: number }[] | null;
}

function toDTO(p: ProductRow): Product {
  const images = [...(p.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({ url: img.url, alt: img.alt_text || p.name }));

  return {
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    shortInfo: p.short_description,
    category: (p.category?.slug ?? "other-accessories") as CategorySlug,
    subcategory: p.subcategory?.name ?? p.category?.name ?? "",
    brand: p.brand,
    sport: p.sport,
    productType: p.product_type,
    price: Number(p.price),
    mrp: Number(p.mrp),
    rating: Number(p.rating),
    reviewCount: p.review_count,
    colors: p.colors,
    sizes: p.sizes,
    description: p.description,
    highlights: p.highlights,
    specs: (p.specifications as unknown as ProductSpec[]) ?? [],
    images,
    inStock: p.stock > 0,
    bestSeller: p.is_best_seller,
    newArrival: p.is_new_arrival,
    featured: p.is_featured,
    dealOfTheDay: p.is_deal_of_the_day,
    createdAt: p.created_at,
    soldCount: p.sold_count,
  };
}

/**
 * Batch lookup for cart/wishlist rendering — deliberately doesn't filter
 * `is_active`, so a product an admin deactivated after it was added to a
 * cart/wishlist still renders (name, current price, image) instead of
 * silently vanishing; checkout still rejects it server-side via create_order.
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = createPublicClient();
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).in("id", ids);
  return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("products").select("slug").eq("is_active", true);
  return (data ?? []).map((p) => p.slug);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data ? toDTO(data as unknown as ProductRow) : undefined;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  return data ? toDTO(data as unknown as ProductRow) : undefined;
}

export async function getProductsByCategory(category: CategorySlug): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category.slug", category)
    .order("created_at", { ascending: false });
  const rows = ((data as unknown as ProductRow[]) ?? []).filter((r) => r.category?.slug === category);
  return rows.map(toDTO);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("rating", { ascending: false })
    .limit(limit);
  return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
}

export async function getBestSellers(limit = 12): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_best_seller", true)
    .order("sold_count", { ascending: false })
    .limit(limit);
  return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
}

export async function getDealProducts(limit = 8): Promise<Product[]> {
  const supabase = createPublicClient();
  // Discount is derived from price vs mrp, which PostgREST can't compare
  // column-to-column in a filter — deal-of-the-day products first, then
  // fall back to sorting the rest by discount in memory (dataset is small).
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(200);
  const products = ((data as unknown as ProductRow[]) ?? []).map(toDTO);
  return products
    .filter((p) => p.dealOfTheDay || getDiscountPercent(p) >= 25)
    .sort((a, b) => Number(b.dealOfTheDay) - Number(a.dealOfTheDay) || getDiscountPercent(b) - getDiscountPercent(a))
    .slice(0, limit);
}

export async function getRelatedProducts(product: Pick<Product, "id" | "category">, limit = 4): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category.slug", product.category)
    .neq("id", product.id)
    .order("rating", { ascending: false })
    .limit(limit * 3);
  const rows = ((data as unknown as ProductRow[]) ?? []).filter((r) => r.category?.slug === product.category);
  return rows.slice(0, limit).map(toDTO);
}

export async function getFrequentlyBoughtWith(
  product: Pick<Product, "id" | "category" | "subcategory">,
  limit = 3
): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category.slug", product.category)
    .neq("id", product.id)
    .limit(limit * 4);
  const rows = ((data as unknown as ProductRow[]) ?? []).filter(
    (r) => r.category?.slug === product.category && r.subcategory?.name !== product.subcategory
  );
  return rows.slice(0, limit).map(toDTO);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];
  const supabase = createPublicClient();
  const like = `%${q}%`;
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .or(`name.ilike.${like},brand.ilike.${like},sport.ilike.${like},product_type.ilike.${like}`)
    .limit(40);
  return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
}

export function getDiscountPercent(product: Pick<Product, "price" | "mrp">): number {
  if (product.mrp <= product.price) return 0;
  return Math.round(((product.mrp - product.price) / product.mrp) * 100);
}

// ---------------------------------------------------------------------------
// Server-driven listing query — filters/sorts/paginates in the database, not
// in the browser. Powers /category/[slug] and /search via URL search params.
// ---------------------------------------------------------------------------

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

/** Builds an aggregate option list for the filter UI from every active product in scope. */
export async function getProductFilterOptions(category?: CategorySlug): Promise<ProductFilterOptions> {
  const supabase = createPublicClient();
  let query = supabase
    .from("products")
    .select(
      "brand, sport, product_type, colors, sizes, price, category:categories!inner(slug), subcategory:subcategories(name)"
    )
    .eq("is_active", true);
  if (category) query = query.eq("category.slug", category);

  const { data } = await query;
  const rows = ((data ?? []) as unknown as {
    brand: string;
    sport: string;
    product_type: string;
    colors: string[];
    sizes: string[];
    price: number;
    category: { slug: string } | null;
    subcategory: { name: string } | null;
  }[]).filter((r) => !category || r.category?.slug === category);

  const uniq = (values: (string | undefined)[]) =>
    Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort();

  const prices = rows.map((r) => Number(r.price));
  return {
    subcategories: uniq(rows.map((r) => r.subcategory?.name)),
    brands: uniq(rows.map((r) => r.brand)),
    sports: uniq(rows.map((r) => r.sport)),
    productTypes: uniq(rows.map((r) => r.product_type)),
    colors: uniq(rows.flatMap((r) => r.colors)),
    sizes: uniq(rows.flatMap((r) => r.sizes)),
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
  };
}

export async function queryProducts(params: ProductQueryParams): Promise<ProductQueryResult> {
  const supabase = createPublicClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? 24;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_active", true);

  if (params.category) query = query.eq("category.slug", params.category);
  if (params.search?.trim()) {
    const like = `%${params.search.trim()}%`;
    query = query.or(`name.ilike.${like},brand.ilike.${like},sport.ilike.${like},product_type.ilike.${like}`);
  }
  if (params.brands?.length) query = query.in("brand", params.brands);
  if (params.productTypes?.length) query = query.in("product_type", params.productTypes);
  if (params.colors?.length) query = query.overlaps("colors", params.colors);
  if (params.sizes?.length) query = query.overlaps("sizes", params.sizes);
  if (params.minRating) query = query.gte("rating", params.minRating);
  if (params.inStockOnly) query = query.gt("stock", 0);
  if (params.priceMin != null) query = query.gte("price", params.priceMin);
  if (params.priceMax != null) query = query.lte("price", params.priceMax);

  switch (params.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "popular":
      query = query.order("sold_count", { ascending: false });
      break;
    case "price-low-high":
      query = query.order("price", { ascending: true });
      break;
    case "price-high-low":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "discount":
      // No generated discount column to sort on server-side; approximate with
      // rating+bestseller as a reasonable proxy, then refine client-side per page.
      query = query.order("is_best_seller", { ascending: false }).order("rating", { ascending: false });
      break;
    case "recommended":
    default:
      query = query.order("is_best_seller", { ascending: false }).order("is_featured", { ascending: false }).order("rating", { ascending: false });
      break;
  }

  // category filter above is applied to the embedded resource, which PostgREST
  // doesn't push down to limit/range correctly when combined with embedded
  // filters in all versions — fetch a wide page and slice defensively.
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  let rows = ((data as unknown as ProductRow[]) ?? []).filter(
    (r) => !params.category || r.category?.slug === params.category
  );

  if (params.subcategories?.length) {
    rows = rows.filter((r) => r.subcategory?.name && params.subcategories!.includes(r.subcategory.name));
  }

  let products = rows.map(toDTO);
  if (params.minDiscount) {
    products = products.filter((p) => getDiscountPercent(p) >= params.minDiscount!);
  }
  if (params.sort === "discount") {
    products = [...products].sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
  }

  return {
    products,
    total: count ?? products.length,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count ?? products.length) / pageSize)),
  };
}
