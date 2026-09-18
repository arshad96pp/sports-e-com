import { Skeleton } from "@/components/ui/skeleton";

function Row() {
  return (
    <div className="flex gap-4 border-b border-border/30 py-6 first:pt-0 md:gap-10 md:py-8">
      <Skeleton className="h-20 w-20 shrink-0 rounded sm:h-24 sm:w-24 md:h-32 md:w-32" />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
        </div>

        <Skeleton className="mb-4 h-3 w-16 md:mb-6" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-4 w-16 md:hidden" />
        </div>
        <Skeleton className="mt-3 h-2.5 w-24" />
      </div>

      <Skeleton className="hidden h-4 w-16 shrink-0 md:block" />
    </div>
  );
}

/**
 * Mirrors CartPageClient's populated-cart layout so the skeleton, the real
 * items, and the empty state never flash into place mid-transition — this
 * is what renders while CartContext restores items and their product data
 * resolves, gated by `ready` in CartPageClient.
 */
export function CartSkeleton() {
  return (
    <section className="flex-1 pt-12 pb-28 sm:pt-20 md:pt-28 md:pb-20 lg:pb-20">
      <div className="container-app">
        <div className="mb-8 flex justify-center sm:mb-12 md:mb-20">
          <Skeleton className="h-6 w-48 sm:h-7 sm:w-64 md:h-9 md:w-80" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-20">
          <div className="space-y-8 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Row key={i} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6 rounded-2xl bg-surface/80 p-5 sm:space-y-8 sm:rounded-3xl sm:p-8 md:p-10 lg:sticky lg:top-24">
              <Skeleton className="h-3.5 w-32" />

              <div className="space-y-4 border-b border-border/30 pb-8">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <Skeleton className="h-3.5 w-12" />
                <Skeleton className="h-7 w-24" />
              </div>

              <div className="space-y-3 pt-4">
                <Skeleton className="h-14 w-full rounded-full" />
                <Skeleton className="h-14 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
