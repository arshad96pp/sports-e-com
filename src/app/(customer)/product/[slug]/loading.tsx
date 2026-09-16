import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="container-app py-4 sm:py-6">
      <Skeleton className="h-3.5 w-56" />

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="mt-3 flex gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-lg sm:h-20 sm:w-20" />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-7 w-3/4" />
          <Skeleton className="mt-3 h-4 w-40" />
          <Skeleton className="mt-5 h-9 w-32" />
          <Skeleton className="mt-6 h-11 w-full rounded-full" />
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
