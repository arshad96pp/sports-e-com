import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CustomerQueryParams, CustomerQueryResult, CustomerRepository } from "@/lib/core/ports/customer.repository";

export function createSupabaseCustomerRepository(): CustomerRepository {
  return {
    /**
     * Admin-facing customer list — reads only `profiles`, never touches
     * `auth.users` and never selects anything password/credential related
     * (there's nothing of the sort in `profiles` to begin with).
     */
    async listCustomers(params: CustomerQueryParams = {}): Promise<CustomerQueryResult> {
      const supabase = await createClient();
      const page = Math.max(1, params.page ?? 1);
      const pageSize = params.pageSize ?? 20;

      let query = supabase
        .from("profiles")
        .select("id, full_name, email, phone, is_active, created_at", { count: "exact" })
        .eq("role", "customer");

      if (params.search?.trim()) {
        const like = `%${params.search.trim()}%`;
        query = query.or(`full_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`);
      }

      const from = (page - 1) * pageSize;
      const { data: profiles, count } = await query
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      const customers = (profiles ?? []).map((p) => ({
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        phone: p.phone,
        isActive: p.is_active,
        createdAt: p.created_at,
      }));

      return {
        customers,
        total: count ?? customers.length,
        page,
        pageSize,
        pageCount: Math.max(1, Math.ceil((count ?? customers.length) / pageSize)),
      };
    },

    async setCustomerActive(userId: string, isActive: boolean): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);
      if (error) throw new Error(error.message);
    },
  };
}
