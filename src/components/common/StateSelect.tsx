"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDIA_STATES } from "@/lib/data/india-states";

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export function StateSelect({ value, onChange, id }: StateSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="h-10 w-full">
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
