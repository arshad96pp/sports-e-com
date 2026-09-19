import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/lib/types";
import type { AddressDTO, AddressRepository } from "@/lib/core/ports/address.repository";

export function createSupabaseAddressRepository(): AddressRepository {
  return {
    async listAddresses(userId: string): Promise<AddressDTO[]> {
      const supabase = await createClient();
      const { data } = await supabase
        .from("addresses")
        .select("id, full_name, phone, line1, city, state, pincode, is_default")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });

      return (data ?? []).map((a) => ({
        id: a.id,
        fullName: a.full_name,
        phone: a.phone,
        line1: a.line1,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        isDefault: a.is_default,
      }));
    },

    async createAddress(userId: string, data: Address): Promise<AddressDTO> {
      const supabase = await createClient();
      const { count } = await supabase.from("addresses").select("id", { count: "exact", head: true }).eq("user_id", userId);

      const { data: created, error } = await supabase
        .from("addresses")
        .insert({
          user_id: userId,
          full_name: data.fullName,
          phone: data.phone,
          line1: data.line1,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          is_default: (count ?? 0) === 0,
        })
        .select("id, full_name, phone, line1, city, state, pincode, is_default")
        .single();

      if (error || !created) throw new Error("Could not save address.");

      return {
        id: created.id,
        fullName: created.full_name,
        phone: created.phone,
        line1: created.line1,
        city: created.city,
        state: created.state,
        pincode: created.pincode,
        isDefault: created.is_default,
      };
    },

    async deleteAddress(userId: string, addressId: string): Promise<void> {
      const supabase = await createClient();
      await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", userId);
    },

    async setDefaultAddress(userId: string, addressId: string): Promise<void> {
      const supabase = await createClient();
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
      await supabase.from("addresses").update({ is_default: true }).eq("id", addressId).eq("user_id", userId);
    },
  };
}
