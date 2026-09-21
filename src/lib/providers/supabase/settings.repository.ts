import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/lib/supabase/types";
import type { SettingsRepository, StoreSettingsDTO, StoreSettingsUpdate } from "@/lib/core/ports/settings.repository";

type SettingsUpdate = Database["public"]["Tables"]["store_settings"]["Update"];

interface SettingsRow {
  id: string;
  whatsapp_number: string;
}

function toDTO(s: SettingsRow): StoreSettingsDTO {
  return {
    id: s.id,
    whatsappNumber: s.whatsapp_number,
  };
}

const DEFAULTS = {
  id: "singleton",
  // No hardcoded phone fallback here — an empty value means "unset", which
  // settings-service.ts's getWhatsAppNumber() resolves against the
  // NEXT_PUBLIC_WHATSAPP_NUMBER env var.
  whatsapp_number: "",
};

export function createSupabaseSettingsRepository(): SettingsRepository {
  return {
    /**
     * Reads the single settings row (public read, no auth needed). The row itself
     * is created once by the seed script / a super admin's first save — this
     * never tries to insert it as a fallback, since a routine public page render
     * (footer, WhatsApp number) runs with the caller's own RLS-scoped client,
     * which only super admins are allowed to write through.
     */
    async getStoreSettings(): Promise<StoreSettingsDTO> {
      const supabase = createPublicClient();
      const { data: settings } = await supabase.from("store_settings").select("*").eq("id", "singleton").maybeSingle();
      if (settings) return toDTO(settings);

      return toDTO(DEFAULTS);
    },

    async updateStoreSettings(data: StoreSettingsUpdate): Promise<StoreSettingsDTO> {
      const supabase = await createClient();

      const patch: SettingsUpdate = {};
      if (data.whatsappNumber !== undefined) patch.whatsapp_number = data.whatsappNumber;

      const { data: updated } = await supabase
        .from("store_settings")
        .update(patch)
        .eq("id", "singleton")
        .select("*")
        .maybeSingle();
      if (updated) return toDTO(updated);

      // No row yet (fresh database, seed hasn't run) — create it, defaults filling
      // in whatever this call didn't explicitly set.
      const { data: created, error: insertError } = await supabase
        .from("store_settings")
        .insert({ ...DEFAULTS, ...patch })
        .select("*")
        .single();
      if (insertError || !created) throw new Error("Could not update store settings.");
      return toDTO(created);
    },
  };
}
