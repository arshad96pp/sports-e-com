export interface StoreSettingsDTO {
  id: string;
  whatsappNumber: string;
}

export type StoreSettingsUpdate = Partial<Omit<StoreSettingsDTO, "id">>;

export interface SettingsRepository {
  getStoreSettings(): Promise<StoreSettingsDTO>;
  updateStoreSettings(data: StoreSettingsUpdate): Promise<StoreSettingsDTO>;
}
