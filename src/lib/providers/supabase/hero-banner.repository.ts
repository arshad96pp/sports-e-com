import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  AdminHeroBannerListItem,
  BannerFormValues,
  BannerImageUrls,
  HeroBannerDTO,
  HeroBannerRepository,
} from "@/lib/core/ports/hero-banner.repository";

const BANNER_SELECT =
  "id, eyebrow, title, subtitle, cta_label, cta_href, image_url_desktop, image_url_mobile, is_active, sort_order, category:categories ( slug )";

function toDTO(b: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_href: string;
  image_url_desktop: string;
  image_url_mobile: string;
  is_active: boolean;
  sort_order: number;
  category: { slug: string } | null;
}): HeroBannerDTO {
  return {
    id: b.id,
    eyebrow: b.eyebrow,
    title: b.title,
    subtitle: b.subtitle,
    ctaLabel: b.cta_label,
    ctaHref: b.cta_href,
    imageUrlDesktop: b.image_url_desktop,
    imageUrlMobile: b.image_url_mobile,
    categorySlug: b.category?.slug ?? null,
    isActive: b.is_active,
    sortOrder: b.sort_order,
  };
}

export function createSupabaseHeroBannerRepository(): HeroBannerRepository {
  return {
    async getActiveHeroBanners(): Promise<HeroBannerDTO[]> {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("hero_banners")
        .select(BANNER_SELECT)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      return ((data ?? []) as unknown as Parameters<typeof toDTO>[0][]).map(toDTO);
    },

    async getAllHeroBanners(): Promise<HeroBannerDTO[]> {
      const supabase = await createClient();
      const { data } = await supabase.from("hero_banners").select(BANNER_SELECT).order("sort_order", { ascending: true });
      return ((data ?? []) as unknown as Parameters<typeof toDTO>[0][]).map(toDTO);
    },

    async listBannersForAdmin(): Promise<AdminHeroBannerListItem[]> {
      const supabase = await createClient();
      const { data } = await supabase
        .from("hero_banners")
        .select(
          "id, eyebrow, title, subtitle, cta_label, cta_href, category_id, sort_order, is_active, image_url_desktop, image_url_mobile"
        )
        .order("sort_order", { ascending: true });

      return (data ?? []).map((b) => ({
        id: b.id,
        eyebrow: b.eyebrow,
        title: b.title,
        subtitle: b.subtitle,
        ctaLabel: b.cta_label,
        ctaHref: b.cta_href,
        categoryId: b.category_id,
        sortOrder: b.sort_order,
        isActive: b.is_active,
        imageUrlDesktop: b.image_url_desktop,
        imageUrlMobile: b.image_url_mobile,
      }));
    },

    async createBanner(values: BannerFormValues): Promise<{ id: string }> {
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
          image_url_desktop: "",
          image_url_mobile: "",
        })
        .select("id")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Could not create banner.");
      return { id: data.id };
    },

    async updateBanner(id: string, values: BannerFormValues): Promise<void> {
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
    },

    async getBannerImageUrls(id: string): Promise<BannerImageUrls | null> {
      const supabase = await createClient();
      const { data } = await supabase
        .from("hero_banners")
        .select("image_url_desktop, image_url_mobile")
        .eq("id", id)
        .maybeSingle();
      if (!data) return null;
      return { imageUrlDesktop: data.image_url_desktop, imageUrlMobile: data.image_url_mobile };
    },

    async deleteBanner(id: string): Promise<BannerImageUrls | null> {
      const previous = await this.getBannerImageUrls(id);
      const supabase = await createClient();
      const { error } = await supabase.from("hero_banners").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return previous;
    },

    async setBannerImage(id: string, field: "imageUrlDesktop" | "imageUrlMobile", url: string): Promise<void> {
      const supabase = await createClient();
      const patch = field === "imageUrlDesktop" ? { image_url_desktop: url } : { image_url_mobile: url };
      const { error } = await supabase.from("hero_banners").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    },
  };
}
