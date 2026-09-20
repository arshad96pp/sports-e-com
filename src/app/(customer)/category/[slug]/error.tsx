"use client";

import { StoreError } from "@/components/common/StoreError";

export default function CategoryError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StoreError
      error={error}
      reset={reset}
      title="Couldn't load this category."
      description="We hit a snag loading these products. Please try again."
    />
  );
}
