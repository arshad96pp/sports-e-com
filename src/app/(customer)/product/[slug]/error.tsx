"use client";

import { StoreError } from "@/components/common/StoreError";

export default function ProductError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StoreError
      error={error}
      reset={reset}
      title="Couldn't load this product."
      description="We hit a snag loading this product's details. Please try again."
    />
  );
}
