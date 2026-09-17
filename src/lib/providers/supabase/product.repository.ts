import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { getDiscountPercent } from "@/lib/data/products";
import type { CategorySlug, Product, ProductSpec } from "@/lib/types";
import type {
  AdminProductDetail,
  ProductFilterOptions,
  ProductFormValues,
  ProductQueryParams,
  ProductQueryResult,
  ProductRepository,
  AdminProductListItem,
} from "@/lib/core/ports/product.repository";

// `category` uses an inner join (`!inner`) so a product row always carries
// its category — every product has a required (NOT NULL) category, so this
// never drops rows a left join would have kept.
const PRODUCT_SELECT = `
  *,
  category:categories!inner ( slug, name ),
  subcategory:subcategories ( name ),
  product_images ( url, alt_text, sort_order )
`;

// Same as PRODUCT_SELECT minus `highlights`/`specifications` (the jsonb
// spec blob) — those are only rendered on the product detail page
// (`getProductBySlug`/`getProductById`), never in card/listing contexts
// (grid cards, Quick View, cart/wishlist rows), so listing-context queries
// use this lighter projection instead of `*`.
const PRODUCT_LIST_SELECT = `
  id, sku, slug, name, short_description, brand, sport, product_type,
  price, mrp, rating, review_count, colors, sizes, description, stock,
  is_best_seller, is_new_arrival, is_featured, is_deal_of_the_day,
  created_at, sold_count,
  category:categories!inner ( slug, name ),
  subcategory:subcategories ( name ),
  product_images ( url, alt_text, sort_order )
`;

/**
 * Resolves a category slug to its id for exact `category_id` filtering.
 * Filtering products by the FK column directly (instead of an embedded
 * `category.slug` filter) is the fix for PostgREST not reliably pushing
 * embedded-resource filters into `range()`/`limit()` — see the callers
 * below, which used to over-fetch and re-filter in JS to work around it.
 */
async function resolveCategoryId(
  supabase: ReturnType<typeof createPublicClient>,
  slug: string
): Promise<string | null> {
  const { data } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

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
  // Absent when the row came from PRODUCT_LIST_SELECT (listing/card contexts).
  highlights?: string[];
  specifications?: unknown;
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
    // Omitted by PRODUCT_LIST_SELECT (listing/card contexts never render these) —
    // fall back to empty rather than `undefined` when a row came from that projection.
    highlights: p.highlights ?? [],
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

function toAdminRow(values: ProductFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    description: values.description,
    short_description: values.shortDescription,
    sku: values.sku,
    category_id: values.categoryId,
    subcategory_id: values.subcategoryId,
    brand: values.brand,
    sport: values.sport,
    product_type: values.productType,
    price: values.price,
    mrp: values.mrp,
    stock: values.stock,
    sizes: values.sizes,
    colors: values.colors,
    highlights: values.highlights,
    specifications: values.specifications as unknown as never,
    is_featured: values.isFeatured,
    is_best_seller: values.isBestSeller,
    is_new_arrival: values.isNewArrival,
    is_deal_of_the_day: values.isDealOfTheDay,
    is_active: values.isActive,
    seo_title: values.seoTitle || null,
    seo_description: values.seoDescription || null,
  };
}

export function createSupabaseProductRepository(): ProductRepository {
  return {
    /**
     * Batch lookup for cart/wishlist rendering — deliberately doesn't filter
     * `is_active`, so a product an admin deactivated after it was added to a
     * cart/wishlist still renders (name, current price, image) instead of
     * silently vanishing; checkout still rejects it server-side via create_order.
     */
    async getProductsByIds(ids: string[]): Promise<Product[]> {
      if (ids.length === 0) return [];
      const supabase = createPublicClient();
      const { data } = await supabase.from("products").select(PRODUCT_LIST_SELECT).in("id", ids);
      return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
    },

    async getAllProducts(): Promise<Product[]> {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
    },

    async getAllProductSlugs(): Promise<string[]> {
      const supabase = createPublicClient();
      const { data } = await supabase.from("products").select("slug").eq("is_active", true);
      return (data ?? []).map((p) => p.slug);
    },

    async getProductBySlug(slug: string): Promise<Product | undefined> {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      return data ? toDTO(data as unknown as ProductRow) : undefined;
    },

    async getProductById(id: string): Promise<Product | undefined> {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();
      return data ? toDTO(data as unknown as ProductRow) : undefined;
    },

    async getProductsByCategory(category: CategorySlug): Promise<Product[]> {
      const supabase = createPublicClient();
      const categoryId = await resolveCategoryId(supabase, category);
      if (!categoryId) return [];
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .eq("is_active", true)
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false })
        .limit(200);
      return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
    },

    async getDealOfTheDayProducts(limit = 8): Promise<Product[]> {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .eq("is_active", true)
        .eq("is_deal_of_the_day", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
    },

    async getFeaturedProducts(limit = 8): Promise<Product[]> {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("rating", { ascending: false })
        .limit(limit);
      return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
    },

    async getBestSellers(limit = 12): Promise<Product[]> {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .eq("is_active", true)
        .eq("is_best_seller", true)
        .order("sold_count", { ascending: false })
        .limit(limit);
      return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
    },

    async getRecentProducts(limit = 200): Promise<Product[]> {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
    },

    async getRelatedProducts(product: Pick<Product, "id" | "category">, limit = 4): Promise<Product[]> {
      const supabase = createPublicClient();
      const categoryId = await resolveCategoryId(supabase, product.category);
      if (!categoryId) return [];
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .eq("is_active", true)
        .eq("category_id", categoryId)
        .neq("id", product.id)
        .order("rating", { ascending: false })
        .limit(limit);
      return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
    },

    async searchProducts(query: string): Promise<Product[]> {
      const q = query.trim();
      if (!q) return [];
      const supabase = createPublicClient();
      const like = `%${q}%`;
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .eq("is_active", true)
        .or(`name.ilike.${like},brand.ilike.${like},sport.ilike.${like},product_type.ilike.${like}`)
        .limit(40);
      return ((data as unknown as ProductRow[]) ?? []).map(toDTO);
    },

    /** Builds an aggregate option list for the filter UI from every active product in scope. */
    async getProductFilterOptions(category?: CategorySlug): Promise<ProductFilterOptions> {
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
    },

    async queryProducts(params: ProductQueryParams): Promise<ProductQueryResult> {
      const supabase = createPublicClient();
      const page = Math.max(1, params.page ?? 1);
      const pageSize = params.pageSize ?? 24;

      let categoryId: string | null = null;
      if (params.category) {
        categoryId = await resolveCategoryId(supabase, params.category);
        if (!categoryId) {
          return { products: [], total: 0, page, pageSize, pageCount: 1 };
        }
      }

      let query = supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT, { count: "exact" })
        .eq("is_active", true);

      if (categoryId) query = query.eq("category_id", categoryId);
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
          query = query
            .order("is_best_seller", { ascending: false })
            .order("is_featured", { ascending: false })
            .order("rating", { ascending: false });
          break;
      }

      // category_id (a real column) is filtered server-side above, so range()
      // pagination against `count` is now exact for it. Subcategory is only
      // available here as a joined name (no id to filter server-side on), so
      // it's still applied client-side after the page is fetched — pages with
      // a subcategory filter applied may return fewer than `pageSize` results.
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count } = await query;
      let rows = (data as unknown as ProductRow[]) ?? [];

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
    },

    async listProductsForAdmin(): Promise<AdminProductListItem[]> {
      const supabase = await createClient();
      const { data } = await supabase
        .from("products")
        .select(
          "id, name, sku, slug, brand, price, mrp, stock, is_active, is_featured, is_best_seller, category:categories(name), product_images(url, sort_order)"
        )
        .order("created_at", { ascending: false });

      return ((data ?? []) as unknown as Array<{
        id: string;
        name: string;
        sku: string;
        slug: string;
        brand: string;
        price: number;
        mrp: number;
        stock: number;
        is_active: boolean;
        is_featured: boolean;
        is_best_seller: boolean;
        category: { name: string } | null;
        product_images: { url: string; sort_order: number }[] | null;
      }>).map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        slug: p.slug,
        categoryName: p.category?.name ?? "—",
        brand: p.brand,
        price: Number(p.price),
        mrp: Number(p.mrp),
        stock: p.stock,
        isActive: p.is_active,
        isFeatured: p.is_featured,
        isBestSeller: p.is_best_seller,
        thumbnailUrl: [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null,
      }));
    },

    async getProductForAdmin(id: string): Promise<AdminProductDetail | null> {
      const supabase = await createClient();
      const { data } = await supabase
        .from("products")
        .select("*, product_images ( id, url, alt_text, sort_order )")
        .eq("id", id)
        .maybeSingle();
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.short_description,
        sku: data.sku,
        categoryId: data.category_id,
        subcategoryId: data.subcategory_id,
        brand: data.brand,
        sport: data.sport,
        productType: data.product_type,
        price: Number(data.price),
        mrp: Number(data.mrp),
        stock: data.stock,
        sizes: data.sizes,
        colors: data.colors,
        highlights: data.highlights,
        specifications: (data.specifications as unknown as ProductSpec[]) ?? [],
        isFeatured: data.is_featured,
        isBestSeller: data.is_best_seller,
        isNewArrival: data.is_new_arrival,
        isDealOfTheDay: data.is_deal_of_the_day,
        isActive: data.is_active,
        seoTitle: data.seo_title ?? "",
        seoDescription: data.seo_description ?? "",
        images: [...(data.product_images ?? [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((i) => ({ id: i.id, url: i.url, altText: i.alt_text, sortOrder: i.sort_order })),
      };
    },

    async createProduct(values: ProductFormValues): Promise<{ id: string }> {
      const supabase = await createClient();
      const { data, error } = await supabase.from("products").insert(toAdminRow(values)).select("id").single();
      if (error || !data) throw new Error(error?.message ?? "Could not create product.");
      return { id: data.id };
    },

    async updateProduct(id: string, values: ProductFormValues): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase.from("products").update(toAdminRow(values)).eq("id", id);
      if (error) throw new Error(error.message);
    },

    async deleteProduct(id: string): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },

    async setProductActive(id: string, isActive: boolean): Promise<void> {
      const supabase = await createClient();
      await supabase.from("products").update({ is_active: isActive }).eq("id", id);
    },

    async addProductImage(productId: string, url: string, altText: string, sortOrder: number): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase
        .from("product_images")
        .insert({ product_id: productId, url, alt_text: altText, sort_order: sortOrder });
      if (error) throw new Error(error.message);
    },

    async deleteProductImage(imageId: string): Promise<void> {
      const supabase = await createClient();
      await supabase.from("product_images").delete().eq("id", imageId);
    },
  };
}
