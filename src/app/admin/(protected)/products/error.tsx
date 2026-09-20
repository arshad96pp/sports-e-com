"use client";

import { AdminListError } from "@/components/admin/AdminListError";

export default function ProductsError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <AdminListError error={error} retry={retry} />;
}
