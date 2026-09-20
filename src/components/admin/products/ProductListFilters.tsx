"use client";

import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { useAdminListParams } from "@/lib/hooks/useAdminListParams";
import type { AdminProductSort } from "@/lib/core/ports/product.repository";

const FILTER_KEYS = ["q", "category", "status", "sort"];

const SORT_OPTIONS: { value: AdminProductSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "price-low-high", label: "Price (low to high)" },
  { value: "price-high-low", label: "Price (high to low)" },
  { value: "stock-low-high", label: "Stock (low to high)" },
];

export function ProductListFilters({ categories }: { categories: { id: string; name: string }[] }) {
  const { searchParams, setParam, clearParams } = useAdminListParams();
  const category = searchParams.get("category") ?? "__all";
  const status = searchParams.get("status") ?? "__all";
  const sort = (searchParams.get("sort") as AdminProductSort) || "newest";
  const hasActiveFilters = FILTER_KEYS.some((key) => searchParams.get(key));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <AdminSearchInput placeholder="Search by name, SKU or slug…" />

      <Select value={category} onValueChange={(v) => setParam("category", v === "__all" ? null : v)}>
        <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => setParam("status", v === "__all" ? null : v)}>
        <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
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
