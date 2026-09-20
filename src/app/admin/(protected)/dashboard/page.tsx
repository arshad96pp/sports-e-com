import Link from "next/link";
import type { Metadata } from "next";
import { Package, Users, ShoppingCart, Clock, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/lib/services/admin-stats-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Store performance at a glance." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Package} label="Total Products" value={String(stats.totalProducts)} />
        <StatCard icon={Users} label="Total Customers" value={String(stats.totalCustomers)} />
        <Link href="/admin/orders" className="block transition-opacity hover:opacity-80">
          <StatCard icon={ShoppingCart} label="Total Orders" value={String(stats.totalOrders)} />
        </Link>
        <Link href="/admin/orders?status=pending" className="block transition-opacity hover:opacity-80">
          <StatCard icon={Clock} label="Pending Orders" value={String(stats.pendingOrders)} accent={stats.pendingOrders > 0} />
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-signal" />
          <h2 className="font-display text-base font-bold text-ink">Low Stock</h2>
        </div>
        <div className="mt-4 flex flex-col divide-y divide-border">
          {stats.lowStockProducts.length === 0 && <p className="py-6 text-sm text-muted">Nothing running low.</p>}
          {stats.lowStockProducts.map((p) => (
            <Link key={p.id} href={`/admin/products/${p.id}/edit`} className="flex items-center justify-between gap-3 py-3 hover:bg-surface">
              <span className="truncate text-sm font-medium text-ink">{p.name}</span>
              <span className={`shrink-0 text-xs font-semibold ${p.stock === 0 ? "text-signal" : "text-ink-soft"}`}>
                {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
