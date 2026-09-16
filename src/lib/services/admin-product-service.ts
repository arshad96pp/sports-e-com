import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProductSpec } from "@/lib/types";

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

export async function listProductsForAdmin(): Promise<AdminProductListItem[]> {
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

export async function getProductForAdmin(id: string): Promise<AdminProductDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "*, product_images ( id, url, alt_text, sort_order )"
    )
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
}

function toRow(values: ProductFormValues) {
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

export async function createProduct(values: ProductFormValues): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert(toRow(values)).select("id").single();
  if (error || !data) throw new Error(error?.message ?? "Could not create product.");
  return { id: data.id };
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update(toRow(values)).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from("products").update({ is_active: isActive }).eq("id", id);
}

export async function addProductImage(productId: string, url: string, altText: string, sortOrder: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("product_images").insert({ product_id: productId, url, alt_text: altText, sort_order: sortOrder });
  if (error) throw new Error(error.message);
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("product_images").delete().eq("id", imageId);
}
