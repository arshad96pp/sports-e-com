import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors AdminDashboardPage's layout; used by dashboard/loading.tsx. */
export function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-7 w-12" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <Skeleton className="h-4 w-24" />
        <div className="mt-4 flex flex-col divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
