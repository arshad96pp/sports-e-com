import type { LucideIcon } from "lucide-react";

export function ContactInfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-white">
        <Icon className="h-4 w-4 text-ink" strokeWidth={1.6} />
      </span>
      <div className="min-w-0 pt-0.5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</h3>
        <p className="mt-1 break-words text-sm font-medium text-ink sm:text-base">{value}</p>
      </div>
    </div>
  );
}
