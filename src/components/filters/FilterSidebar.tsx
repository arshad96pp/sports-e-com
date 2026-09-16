import { FilterPanel } from "@/components/filters/FilterPanel";
import type { FilterState, PriceBounds } from "@/lib/hooks/useProductFilters";

interface FilterSidebarProps {
  filters: FilterState;
  priceBounds: PriceBounds;
  options: React.ComponentProps<typeof FilterPanel>["options"];
  actions: React.ComponentProps<typeof FilterPanel>["actions"] & { clearAll: () => void };
  activeCount: number;
}

export function FilterSidebar({ filters, priceBounds, options, actions, activeCount }: FilterSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-border bg-white p-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-ink">Filters</h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={actions.clearAll}
              className="text-xs font-semibold text-signal hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
        <FilterPanel filters={filters} priceBounds={priceBounds} options={options} actions={actions} />
      </div>
    </aside>
  );
}
