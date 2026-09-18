import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ViewAllLink({
  href,
  label = "View all",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-ink"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
    </Link>
  );
}

export function HomeSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-lg">
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">{eyebrow}</p>
        )}
        <h2
          className={`font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl ${eyebrow ? "mt-2" : ""}`}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[15px]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
