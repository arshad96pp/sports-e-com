"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils/format";
import type { PriceBounds } from "@/lib/hooks/useProductFilters";

interface PriceRangeFilterProps {
  bounds: PriceBounds;
  value: PriceBounds | null;
  onChange: (range: PriceBounds | null) => void;
}

export function PriceRangeFilter({ bounds, value, onChange }: PriceRangeFilterProps) {
  const active = value ?? bounds;
  const [draft, setDraft] = useState<PriceBounds>(active);

  // Re-sync the local slider draft when the external value or bounds change
  // (e.g. "Clear All" or switching category) — adjusting state during render
  // instead of in an effect avoids an extra post-commit render pass.
  const [prevActive, setPrevActive] = useState(active);
  if (active[0] !== prevActive[0] || active[1] !== prevActive[1]) {
    setPrevActive(active);
    setDraft(active);
  }

  function commit(next: PriceBounds) {
    const clamped: PriceBounds = [
      Math.max(bounds[0], Math.min(next[0], next[1])),
      Math.min(bounds[1], Math.max(next[0], next[1])),
    ];
    setDraft(clamped);
    onChange(clamped[0] === bounds[0] && clamped[1] === bounds[1] ? null : clamped);
  }

  return (
    <div className="pt-1">
      <Slider
        min={bounds[0]}
        max={bounds[1]}
        step={50}
        value={draft}
        onValueChange={(v) => setDraft([v[0], v[1]])}
        onValueCommit={(v) => commit([v[0], v[1]])}
        className="**:data-[slot=slider-thumb]:border-ink **:data-[slot=slider-range]:bg-ink"
      />

      <div className="mt-4 flex items-center gap-2.5">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium text-muted">Min</label>
          <Input
            type="number"
            min={bounds[0]}
            max={draft[1]}
            step={50}
            value={draft[0]}
            onChange={(e) => {
              const n = Number(e.target.value) || bounds[0];
              setDraft([n, draft[1]]);
            }}
            onBlur={() => commit(draft)}
            className="h-9 text-sm"
          />
        </div>
        <span className="mt-4 text-muted-soft">–</span>
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium text-muted">Max</label>
          <Input
            type="number"
            min={draft[0]}
            max={bounds[1]}
            step={50}
            value={draft[1]}
            onChange={(e) => {
              const n = Number(e.target.value) || bounds[1];
              setDraft([draft[0], n]);
            }}
            onBlur={() => commit(draft)}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        {formatPrice(draft[0])} – {formatPrice(draft[1])}
      </p>
    </div>
  );
}
