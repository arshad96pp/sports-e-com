import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminDashboardStats {
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: { id: string; name: string; stock: number }[];
}

const LOW_STOCK_THRESHOLD = 10;

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();

  const [{ count: totalProducts }, { count: totalCustomers }, { data: lowStock }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase
      .from("products")
      .select("id, name, stock")
      .eq("is_active", true)
      .lte("stock", LOW_STOCK_THRESHOLD)
      .order("stock", { ascending: true })
      .limit(8),
  ]);

  return {
    totalProducts: totalProducts ?? 0,
    totalCustomers: totalCustomers ?? 0,
    lowStockProducts: (lowStock ?? []).map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
  };
}
