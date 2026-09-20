"use client";

import { StoreError } from "@/components/common/StoreError";

export default function CustomerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <StoreError error={error} reset={reset} />;
}
