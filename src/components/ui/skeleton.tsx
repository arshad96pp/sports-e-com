import { cn } from "cn"

type SkeletonProps = React.ComponentProps<"div"> & {
  /** Light, shimmer-sweep variant for premium/light-theme surfaces (e.g. cart). Defaults to the standard pulse skeleton. */
  shimmer?: boolean
}

function Skeleton({ className, shimmer, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md",
        shimmer
          ? "animate-shimmer bg-[#F1F3F5] bg-[linear-gradient(90deg,#F1F3F5_25%,#E5E7EB_50%,#F1F3F5_75%)] bg-size-[400%_100%]"
          : "animate-pulse bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
