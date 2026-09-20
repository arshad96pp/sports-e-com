import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";

/** Same light shimmer treatment as the public-site skeletons (see ProductListingSkeleton, WishlistSkeleton). */
function Bone({ className }: { className?: string }) {
  return <Skeleton className={cn("skeleton-shimmer animate-none bg-[#F1F3F5]", className)} />;
}

/** Mirrors AdminDashboardPage's layout; used by dashboard/loading.tsx. */
export function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <Bone className="h-7 w-40" />
        <Bone className="mt-2 h-4 w-56" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <Bone className="h-3 w-20" />
              <Bone className="h-8 w-8 rounded-lg" />
            </div>
            <Bone className="mt-3 h-7 w-12" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <Bone className="h-4 w-24" />
        <div className="mt-4 flex flex-col divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-3">
              <Bone className="h-4 w-40" />
              <Bone className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
