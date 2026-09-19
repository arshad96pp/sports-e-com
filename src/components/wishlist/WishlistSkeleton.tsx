import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";

function Bone({ className }: { className?: string }) {
  return <Skeleton className={cn("skeleton-shimmer animate-none bg-[#F3F4F6]", className)} />;
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-white">
      <div className="relative aspect-square w-full bg-[#F5F5F3] p-4 sm:p-5">
        <Bone className="h-full w-full rounded-md" />
        <Bone className="absolute right-2.5 top-2.5 h-8 w-8 rounded-full sm:h-10 sm:w-10" />
      </div>
      <div className="flex flex-col gap-2 p-3.5 sm:p-4">
        <Bone className="h-3.5 w-full" />
        <Bone className="h-3.5 w-2/3" />
        <div className="flex items-center justify-between gap-2">
          <Bone className="h-3 w-16" />
          <Bone className="h-4 w-14 rounded-full" />
        </div>
        <div className="mt-1 flex items-end justify-between gap-3">
          <Bone className="h-4 w-16" />
          <Bone className="h-9 w-9 rounded-full sm:h-10 sm:w-10" />
        </div>
      </div>
    </div>
  );
}

/**
 * Mirrors WishlistPageClient's populated layout so the skeleton and the
 * real grid never flash into place mid-transition — this is what renders
 * while WishlistContext hydrates and its product data resolves, gated by
 * `ready` in WishlistPageClient.
 */
export function WishlistSkeleton() {
  return (
    <div className="container-app py-10 sm:py-14">
      <div className="mx-auto mb-10 flex max-w-lg flex-col items-center gap-2 sm:mb-14">
        <Bone className="h-2.5 w-24" />
        <Bone className="h-7 w-40 sm:h-8" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
