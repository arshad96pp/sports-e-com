"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminListParams } from "@/lib/hooks/useAdminListParams";

export function AdminSearchInput({ paramKey = "q", placeholder }: { paramKey?: string; placeholder: string }) {
  const { searchParams, setParam } = useAdminListParams();
  const urlValue = searchParams.get(paramKey) ?? "";
  const [value, setValue] = useState(urlValue);
  const [syncedUrlValue, setSyncedUrlValue] = useState(urlValue);

  // Keep the input in sync with back/forward navigation and other controls
  // clearing this param (e.g. a "Clear filters" action) — adjusted during
  // render rather than in an effect, per React's "adjusting state" guidance.
  if (urlValue !== syncedUrlValue) {
    setSyncedUrlValue(urlValue);
    setValue(urlValue);
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (value !== urlValue) setParam(paramKey, value.trim() || null);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-soft" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-8"
        aria-label={placeholder}
      />
    </div>
  );
}
