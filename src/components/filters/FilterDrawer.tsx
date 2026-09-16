"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterPanel } from "@/components/filters/FilterPanel";
import type { FilterState, PriceBounds } from "@/lib/hooks/useProductFilters";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  priceBounds: PriceBounds;
  options: React.ComponentProps<typeof FilterPanel>["options"];
  actions: React.ComponentProps<typeof FilterPanel>["actions"] & { clearAll: () => void };
  resultCount: number;
}

export function FilterDrawer({ open, onClose, filters, priceBounds, options, actions, resultCount }: FilterDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="flex max-h-[85vh] flex-col gap-0 rounded-t-2xl p-0 lg:hidden">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="font-display text-lg font-bold text-ink">Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <FilterPanel filters={filters} priceBounds={priceBounds} options={options} actions={actions} />
        </div>
        <div className="flex gap-3 border-t border-border p-4">
          <Button variant="outline" onClick={actions.clearAll} className="h-11 flex-1 rounded-full text-sm font-semibold">
            Clear All
          </Button>
          <Button onClick={onClose} className="h-11 flex-2 rounded-full text-sm font-semibold">
            Show {resultCount} results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
