import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface BannerFormValues {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  categoryId: string | null;
  sortOrder: number;
  isActive: boolean;
}

export async function createBanner(values: BannerFormValues): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_banners")
    .insert({
      eyebrow: values.eyebrow,
      title: values.title,
      subtitle: values.subtitle,
      cta_label: values.ctaLabel,
      cta_href: values.ctaHref,
      category_id: values.categoryId,
      sort_order: values.sortOrder,
      is_active: values.isActive,
      // Placeholder until images are uploaded right after creation.
      image_url_desktop: "",
      image_url_mobile: "",
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create banner.");
  return { id: data.id };
}

export async function updateBanner(id: string, values: BannerFormValues): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hero_banners")
    .update({
      eyebrow: values.eyebrow,
      title: values.title,
      subtitle: values.subtitle,
      cta_label: values.ctaLabel,
      cta_href: values.ctaHref,
      category_id: values.categoryId,
      sort_order: values.sortOrder,
      is_active: values.isActive,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export interface BannerImageUrls {
  imageUrlDesktop: string;
  imageUrlMobile: string;
}

export async function getBannerImageUrls(id: string): Promise<BannerImageUrls | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hero_banners")
    .select("image_url_desktop, image_url_mobile")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return { imageUrlDesktop: data.image_url_desktop, imageUrlMobile: data.image_url_mobile };
}

/** Returns the image URLs the deleted row held, so the caller can clean up Storage. */
export async function deleteBanner(id: string): Promise<BannerImageUrls | null> {
  const previous = await getBannerImageUrls(id);
  const supabase = await createClient();
  const { error } = await supabase.from("hero_banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return previous;
}

export async function setBannerImage(id: string, field: "imageUrlDesktop" | "imageUrlMobile", url: string): Promise<void> {
  const supabase = await createClient();
  const patch = field === "imageUrlDesktop" ? { image_url_desktop: url } : { image_url_mobile: url };
  const { error } = await supabase.from("hero_banners").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}
