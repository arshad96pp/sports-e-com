import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";

function Bone({ className }: { className?: string }) {
  return <Skeleton className={cn("skeleton-shimmer animate-none bg-[#E9ECEF]", className)} />;
}

const NAV_LABEL_WIDTHS = ["w-14", "w-20", "w-16"];

export function AccountSkeleton() {
  return (
    <div className="flex-1 bg-surface">
      <div className="container-app py-10 sm:py-16">
        <Bone className="h-3.5 w-40 rounded" />

        <div className="mt-4 mb-10 space-y-1.5">
          <Bone className="h-2.5 w-24 rounded" />
          <Bone className="h-8 w-40 rounded" />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <aside className="w-full shrink-0 lg:w-64">
            <div className="rounded-[16px] bg-[#E9ECEF] p-6">
              <div className="flex items-center gap-3">
                <Bone className="h-12 w-12 shrink-0 rounded-full bg-white/40" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Bone className="h-3.5 w-24 rounded bg-white/40" />
                  <Bone className="h-3 w-32 rounded bg-white/40" />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[16px] border border-gray-100 bg-white">
              {NAV_LABEL_WIDTHS.map((width, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
                  <Bone className="h-8 w-8 shrink-0 rounded-lg" />
                  <Bone className={cn("h-3 rounded", width)} />
                </div>
              ))}
              <div className="flex items-center gap-4 px-6 py-4">
                <Bone className="h-8 w-8 shrink-0 rounded-lg" />
                <Bone className="h-3 w-16 rounded" />
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="rounded-[16px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="border-b border-gray-100 pb-4">
                <Bone className="h-5 w-40 rounded" />
                <Bone className="mt-2.5 h-3 w-64 rounded" />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {["w-16", "w-16", "w-24", "w-28"].map((width, i) => (
                  <div key={i} className={cn("space-y-2", i >= 2 && "sm:col-span-2")}>
                    <Bone className={cn("h-2.5 rounded", width)} />
                    <Bone className="h-9 w-full rounded-none" />
                  </div>
                ))}
                <Bone className="h-10 w-32 rounded-[12px] sm:col-span-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
