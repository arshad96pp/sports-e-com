"use client";

import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { useAdminListParams } from "@/lib/hooks/useAdminListParams";
import type { OrderStatus } from "@/lib/services/order-service";

const FILTER_KEYS = ["q", "status", "sort"];
const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "cancelled"];
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "total-high-low", label: "Total (high to low)" },
  { value: "total-low-high", label: "Total (low to high)" },
] as const;

export function OrderListFilters() {
  const { searchParams, setParam, clearParams } = useAdminListParams();
  const status = searchParams.get("status") ?? "__all";
  const sort = searchParams.get("sort") || "newest";
  const hasActiveFilters = FILTER_KEYS.some((key) => searchParams.get(key));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <AdminSearchInput placeholder="Search by order number or customer…" />

      <Select value={status} onValueChange={(v) => setParam("status", v === "__all" ? null : v)}>
        <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All statuses</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(v) => setParam("sort", v === "newest" ? null : v)}>
        <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Sort" /></SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="h-9 text-muted-soft hover:text-ink" onClick={() => clearParams(FILTER_KEYS)}>
          <X className="h-3.5 w-3.5" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
