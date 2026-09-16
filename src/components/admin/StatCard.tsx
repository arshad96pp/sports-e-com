import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-accent" : "bg-surface"}`}>
          <Icon className={`h-4 w-4 ${accent ? "text-accent-ink" : "text-ink"}`} strokeWidth={1.75} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
