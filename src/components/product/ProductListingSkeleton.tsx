import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";

function Bone({ className }: { className?: string }) {
  return <Skeleton className={cn("skeleton-shimmer animate-none bg-[#F3F4F6]", className)} />;
}

export function ProductListingSkeleton() {
  return (
    <div className="container-app py-4 sm:py-6">
      <Bone className="h-3.5 w-40" />
      <Bone className="mt-4 h-8 w-64" />
      <Bone className="mt-2 h-4 w-80" />
      <Bone className="mt-2 h-3 w-24" />

      <div className="mt-5 flex gap-6">
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-xl border border-border p-4">
            <Bone className="h-5 w-20" />
            <div className="mt-4 flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Bone key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex justify-end">
            <Bone className="h-10 w-32 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-white">
                <Bone className="aspect-square w-full rounded-none" />
                <div className="flex flex-col gap-1.5 p-3">
                  <Bone className="h-2.5 w-16" />
                  <Bone className="h-4 w-full" />
                  <Bone className="h-3 w-24" />
                  <Bone className="h-4 w-20" />
                  <Bone className="mt-2 h-9 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
