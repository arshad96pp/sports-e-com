import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface CustomerDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

/**
 * Admin-facing customer list — reads only `profiles`, never touches
 * `auth.users` and never selects anything password/credential related
 * (there's nothing of the sort in `profiles` to begin with).
 */
export async function listCustomers(): Promise<CustomerDTO[]> {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, is_active, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  return (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    email: p.email,
    phone: p.phone,
    isActive: p.is_active,
    createdAt: p.created_at,
  }));
}

export async function setCustomerActive(userId: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);
}
