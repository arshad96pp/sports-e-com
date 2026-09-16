import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

export interface HeroBannerDTO {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrlDesktop: string;
  imageUrlMobile: string;
  categorySlug: string | null;
  isActive: boolean;
  sortOrder: number;
}

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

export async function getActiveHeroBanners(): Promise<HeroBannerDTO[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("hero_banners")
    .select(BANNER_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return ((data ?? []) as unknown as Parameters<typeof toDTO>[0][]).map(toDTO);
}

export async function getAllHeroBanners(): Promise<HeroBannerDTO[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("hero_banners").select(BANNER_SELECT).order("sort_order", { ascending: true });
  return ((data ?? []) as unknown as Parameters<typeof toDTO>[0][]).map(toDTO);
}
