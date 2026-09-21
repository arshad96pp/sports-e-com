import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";

function Bone({ className }: { className?: string }) {
  return <Skeleton className={cn("skeleton-shimmer animate-none bg-[#F3F4F6]", className)} />;
}

/** Matches ProductGrid's layout — used by listing pages. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Bone className="aspect-square w-full rounded-[4px]" />
          <div className="flex flex-col gap-1.5 pt-3.5">
            <Bone className="h-2.5 w-16" />
            <Bone className="h-4 w-full" />
            <Bone className="h-3 w-24" />
            <Bone className="h-4 w-20" />
            <Bone className="mt-2 h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Matches Hero's `min-h-[76vh] sm:72vh lg:74vh` so resolving the real hero or its fallback never shifts the page. */
export function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <Skeleton className="min-h-[76vh] w-full animate-pulse rounded-none bg-white/5 sm:min-h-[72vh] lg:min-h-[74vh]" />
    </section>
  );
}

export function CategorySectionSkeleton() {
  return (
    <section>
      <div className="container-app pt-12 pb-0 sm:pt-16">
        <Bone className="h-7 w-48" />
        <Bone className="mt-2 h-4 w-64" />
      </div>
      <div className="container-app mt-6 sm:mt-8">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-24">
          <Bone className="h-80 w-full rounded-2xl md:col-span-10 md:row-span-2 md:h-117.5" />
          <Bone className="h-52 w-full rounded-2xl md:col-span-7" />
          <Bone className="h-52 w-full rounded-2xl md:col-span-7" />
          <Bone className="h-52 w-full rounded-2xl md:col-span-14" />
        </div>
      </div>
    </section>
  );
}

export function FeaturedSectionSkeleton() {
  return (
    <section className="container-app py-12 sm:py-16">
      <Bone className="h-7 w-44" />
      <Bone className="mt-2 h-4 w-72" />
      <div className="mt-8 flex gap-5">
        <Bone className="aspect-square flex-1 rounded-[4px]" />
        <Bone className="hidden aspect-square flex-1 rounded-[4px] sm:block" />
        <Bone className="hidden aspect-square flex-1 rounded-[4px] lg:block" />
        <Bone className="hidden aspect-square flex-1 rounded-[4px] lg:block" />
      </div>
    </section>
  );
}

export function CampaignBannerSkeleton() {
  return (
    <section>
      <Bone className="h-[360px] w-full rounded-none sm:h-[420px] lg:h-[520px]" />
    </section>
  );
}

export function SportStorySkeleton() {
  return (
    <section className="grid lg:grid-cols-12">
      <Bone className="h-[380px] w-full rounded-none lg:col-span-7 lg:h-[560px]" />
      <div className="bg-surface px-6 py-14 lg:col-span-5 lg:px-14">
        <Bone className="h-3 w-24" />
        <Bone className="mt-4 h-10 w-56" />
        <Bone className="mt-5 h-4 w-72" />
      </div>
    </section>
  );
}

export function EditorialSkeleton() {
  return <CampaignBannerSkeleton />;
}

export function ProductRailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="py-12 sm:py-16">
      <div className="container-app">
        <Bone className="h-8 w-44" />
        <Bone className="mt-2 h-4 w-64" />
        <div className="mt-8 flex gap-5">
          {Array.from({ length: count }).map((_, i) => (
            <Bone
              key={i}
              className={`aspect-square flex-1 rounded-[4px] ${i > 0 ? "hidden sm:block" : ""} ${i > 1 ? "lg:block" : ""} ${i > 2 ? "hidden lg:block" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** @deprecated Use FeaturedSectionSkeleton or ProductRailSkeleton. */
export function ProductSectionSkeleton({ count = 8 }: { count?: number }) {
  return (
    <section className="container-app py-16 sm:py-24">
      <Bone className="h-8 w-48" />
      <Bone className="mt-2 h-4 w-56" />
      <div className="mt-8">
        <ProductGridSkeleton count={count} />
      </div>
    </section>
  );
}

