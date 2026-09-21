"use client";

import { AdminListError } from "@/components/admin/AdminListError";

/**
 * Fallback error boundary for every admin section that doesn't define its own
 * (banners, categories, offers, settings, subcategories, dashboard). Without
 * this, an error in one of those pages had no boundary until `global-error`,
 * which replaces the whole `<html>` and wipes the AdminShell sidebar/nav —
 * this keeps the failure contained to the content area instead.
 */
export default function AdminProtectedError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <AdminListError error={error} retry={retry} />;
}
