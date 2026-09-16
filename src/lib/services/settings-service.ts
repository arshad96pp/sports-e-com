import "server-only";
import { getSettingsRepository } from "@/lib/config/providers";
import type { StoreSettingsDTO, StoreSettingsUpdate } from "@/lib/core/ports/settings.repository";

export type { StoreSettingsDTO };

export async function getStoreSettings(): Promise<StoreSettingsDTO> {
  return getSettingsRepository().getStoreSettings();
}

export async function updateStoreSettings(data: StoreSettingsUpdate): Promise<StoreSettingsDTO> {
  return getSettingsRepository().updateStoreSettings(data);
}
