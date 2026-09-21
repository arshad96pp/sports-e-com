import "server-only";
import { getSettingsRepository } from "@/lib/config/providers";
import { STORE_WHATSAPP_NUMBER } from "@/lib/config";
import type { StoreSettingsDTO, StoreSettingsUpdate } from "@/lib/core/ports/settings.repository";

export type { StoreSettingsDTO };

export async function getStoreSettings(): Promise<StoreSettingsDTO> {
  return getSettingsRepository().getStoreSettings();
}

export async function updateStoreSettings(data: StoreSettingsUpdate): Promise<StoreSettingsDTO> {
  return getSettingsRepository().updateStoreSettings(data);
}

/**
 * The WhatsApp number actually used for orders: Admin Settings' saved number
 * takes priority, falling back to NEXT_PUBLIC_WHATSAPP_NUMBER when the admin
 * hasn't set one. This is the only place that applies that priority — callers
 * should use this instead of reading `whatsappNumber` off getStoreSettings().
 */
export async function getWhatsAppNumber(): Promise<string> {
  const { whatsappNumber } = await getStoreSettings();
  return whatsappNumber.trim() || STORE_WHATSAPP_NUMBER || "";
}
