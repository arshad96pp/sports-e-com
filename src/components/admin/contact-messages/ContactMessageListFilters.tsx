"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { useAdminListParams } from "@/lib/hooks/useAdminListParams";

const FILTER_KEYS = ["q"];

export function ContactMessageListFilters() {
  const { searchParams, clearParams } = useAdminListParams();
  const hasActiveFilters = FILTER_KEYS.some((key) => searchParams.get(key));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <AdminSearchInput placeholder="Search by name, email, or phone…" />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="h-9 text-muted-soft hover:text-ink" onClick={() => clearParams(FILTER_KEYS)}>
          <X className="h-3.5 w-3.5" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
