import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/lib/supabase/types";
import type { SettingsRepository, StoreSettingsDTO, StoreSettingsUpdate } from "@/lib/core/ports/settings.repository";

type SettingsUpdate = Database["public"]["Tables"]["store_settings"]["Update"];

interface SettingsRow {
  id: string;
  store_name: string;
  logo_url: string | null;
  whatsapp_number: string;
  contact_phone: string;
  contact_email: string;
  address_line: string;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  shipping_info: string;
  return_policy: string;
  free_shipping_threshold: number;
  seo_default_title: string;
  seo_default_description: string;
}

function toDTO(s: SettingsRow): StoreSettingsDTO {
  return {
    id: s.id,
    storeName: s.store_name,
    logoUrl: s.logo_url,
    whatsappNumber: s.whatsapp_number,
    contactPhone: s.contact_phone,
    contactEmail: s.contact_email,
    addressLine: s.address_line,
    instagramUrl: s.instagram_url,
    facebookUrl: s.facebook_url,
    twitterUrl: s.twitter_url,
    youtubeUrl: s.youtube_url,
    shippingInfo: s.shipping_info,
    returnPolicy: s.return_policy,
    freeShippingThreshold: Number(s.free_shipping_threshold),
    seoDefaultTitle: s.seo_default_title,
    seoDefaultDescription: s.seo_default_description,
  };
}

const DEFAULTS = {
  id: "singleton",
  store_name: "STRYDE",
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999",
  contact_phone: "+91 98765 43210",
  contact_email: "support@stryde.in",
  address_line: "STRYDE Sports, MG Road, Bengaluru, Karnataka 560001",
  shipping_info: "Free delivery above ₹999. 3-5 business days across India.",
  return_policy: "7-day easy returns on unused items in original packaging.",
  seo_default_title: "STRYDE — Gear Up. Play Better.",
  seo_default_description: "Premium football, cricket, tennis and multi-sport accessories.",
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

      return toDTO({
        ...DEFAULTS,
        logo_url: null,
        instagram_url: null,
        facebook_url: null,
        twitter_url: null,
        youtube_url: null,
        free_shipping_threshold: 999,
      });
    },

    async updateStoreSettings(data: StoreSettingsUpdate): Promise<StoreSettingsDTO> {
      const supabase = await createClient();

      const patch: SettingsUpdate = {};
      if (data.storeName !== undefined) patch.store_name = data.storeName;
      if (data.logoUrl !== undefined) patch.logo_url = data.logoUrl;
      if (data.whatsappNumber !== undefined) patch.whatsapp_number = data.whatsappNumber;
      if (data.contactPhone !== undefined) patch.contact_phone = data.contactPhone;
      if (data.contactEmail !== undefined) patch.contact_email = data.contactEmail;
      if (data.addressLine !== undefined) patch.address_line = data.addressLine;
      if (data.instagramUrl !== undefined) patch.instagram_url = data.instagramUrl;
      if (data.facebookUrl !== undefined) patch.facebook_url = data.facebookUrl;
      if (data.twitterUrl !== undefined) patch.twitter_url = data.twitterUrl;
      if (data.youtubeUrl !== undefined) patch.youtube_url = data.youtubeUrl;
      if (data.shippingInfo !== undefined) patch.shipping_info = data.shippingInfo;
      if (data.returnPolicy !== undefined) patch.return_policy = data.returnPolicy;
      if (data.freeShippingThreshold !== undefined) patch.free_shipping_threshold = data.freeShippingThreshold;
      if (data.seoDefaultTitle !== undefined) patch.seo_default_title = data.seoDefaultTitle;
      if (data.seoDefaultDescription !== undefined) patch.seo_default_description = data.seoDefaultDescription;

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
