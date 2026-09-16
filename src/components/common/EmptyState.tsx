import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-20 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white">
        <Icon className="h-9 w-9 text-muted-soft" strokeWidth={1.5} />
      </div>
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
