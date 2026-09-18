import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors AccountPageClient's layout (sidebar + profile + addresses) so it
 * can double as both `account/loading.tsx`'s Suspense fallback and the
 * in-place placeholder LoginPageClient/RegisterPageClient render the instant
 * they start navigating to /account — same markup, so the handoff between
 * "we're pretending" and "Next.js is actually streaming this fallback" is
 * visually seamless.
 */
export function AccountSkeleton() {
  return (
    <div className="container-app py-6">
      <Skeleton className="h-3.5 w-40" />
      <Skeleton className="mt-3 mb-6 h-8 w-48" />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-8">
          <section className="rounded-xl border border-border p-5">
            <Skeleton className="h-5 w-24" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border p-5">
            <Skeleton className="h-5 w-36" />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
