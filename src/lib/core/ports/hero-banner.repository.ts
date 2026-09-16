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

/** Admin list view needs the raw `categoryId` (to pre-select a dropdown), not the joined slug `HeroBannerDTO` exposes. */
export interface AdminHeroBannerListItem {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  categoryId: string | null;
  sortOrder: number;
  isActive: boolean;
  imageUrlDesktop: string;
  imageUrlMobile: string;
}

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

export interface BannerImageUrls {
  imageUrlDesktop: string;
  imageUrlMobile: string;
}

export interface HeroBannerRepository {
  getActiveHeroBanners(): Promise<HeroBannerDTO[]>;
  getAllHeroBanners(): Promise<HeroBannerDTO[]>;

  listBannersForAdmin(): Promise<AdminHeroBannerListItem[]>;
  createBanner(values: BannerFormValues): Promise<{ id: string }>;
  updateBanner(id: string, values: BannerFormValues): Promise<void>;
  getBannerImageUrls(id: string): Promise<BannerImageUrls | null>;
  /** Returns the image URLs the deleted row held, so the caller can clean up Storage. */
  deleteBanner(id: string): Promise<BannerImageUrls | null>;
  setBannerImage(id: string, field: "imageUrlDesktop" | "imageUrlMobile", url: string): Promise<void>;
}
