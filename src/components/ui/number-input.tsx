import * as React from "react";
import { Input } from "@/components/ui/input";
import { numberInputValue, parseNumberInput } from "@/lib/utils/number-input";

type NumberInputProps = Omit<React.ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  value: number;
  onValueChange: (value: number) => void;
};

function NumberInput({ value, onValueChange, ...props }: NumberInputProps) {
  return (
    <Input
      {...props}
      type="number"
      value={numberInputValue(value)}
      onChange={(e) => onValueChange(parseNumberInput(e.target.value))}
    />
  );
}

export { NumberInput };
