"use client";

import { cn } from "cn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDIA_STATES } from "@/lib/data/india-states";

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  /** Defaults to h-10 (matches BuyNowModal's inputs); pass e.g. "h-11" to match a taller sibling Input. */
  className?: string;
  disabled?: boolean;
}

export function StateSelect({ value, onChange, id, className, disabled }: StateSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className={cn("h-10 w-full", className)}>
        <SelectValue placeholder="State" />
      </SelectTrigger>
      <SelectContent>
        {INDIA_STATES.map((state) => (
          <SelectItem key={state} value={state}>
            {state}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
