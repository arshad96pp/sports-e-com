import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";

function Bone({ className }: { className?: string }) {
  return <Skeleton className={cn("skeleton-shimmer animate-none bg-[#F3F4F6]", className)} />;
}

/** Matches ProductGrid's layout — used by both FeaturedProducts and OffersSection. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
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
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <Skeleton className="h-105 w-full animate-pulse rounded-none bg-white/5 sm:h-120" />
    </section>
  );
}

export function CategorySectionSkeleton() {
  return (
    <section className="container-app py-12 sm:py-16">
      <Bone className="h-7 w-52" />
      <Bone className="mt-2 h-4 w-64" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-56 w-full rounded-2xl sm:min-h-72" />
        ))}
      </div>
    </section>
  );
}

export function ProductSectionSkeleton({ count = 8 }: { count?: number }) {
  return (
    <section className="container-app py-12 sm:py-16">
      <Bone className="h-7 w-48" />
      <Bone className="mt-2 h-4 w-56" />
      <div className="mt-6">
        <ProductGridSkeleton count={count} />
      </div>
    </section>
  );
}
