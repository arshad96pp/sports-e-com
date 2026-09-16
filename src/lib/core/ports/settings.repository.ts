export interface StoreSettingsDTO {
  id: string;
  storeName: string;
  logoUrl: string | null;
  whatsappNumber: string;
  contactPhone: string;
  contactEmail: string;
  addressLine: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  shippingInfo: string;
  returnPolicy: string;
  freeShippingThreshold: number;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
}

export type StoreSettingsUpdate = Partial<Omit<StoreSettingsDTO, "id" | "freeShippingThreshold">> & {
  freeShippingThreshold?: number;
};

export interface SettingsRepository {
  getStoreSettings(): Promise<StoreSettingsDTO>;
  updateStoreSettings(data: StoreSettingsUpdate): Promise<StoreSettingsDTO>;
}
