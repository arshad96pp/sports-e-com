"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shared error fallback for admin list pages — used by each list route's `error.tsx`. */
export function AdminListError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-white px-6 py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-signal" />
      <div>
        <p className="font-display text-base font-bold text-ink">Couldn&apos;t load this page.</p>
        <p className="mt-1 text-sm text-muted">{error.message || "Something went wrong while fetching data."}</p>
      </div>
      <Button onClick={() => retry()} variant="outline" className="mt-1 rounded-full">
        Try again
      </Button>
    </div>
  );
}
