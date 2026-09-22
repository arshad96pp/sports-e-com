/**
 * Parse an `<input type="number">` value so clearing the field stays empty.
 * `Number("")` is 0, which snaps a controlled input back to 0 and blocks retyping.
 */
export function parseNumberInput(raw: string): number {
  return raw.trim() === "" ? Number.NaN : Number(raw);
}

/** Controlled `value` for a number input: empty while the field is cleared. */
export function numberInputValue(value: number): number | "" {
  return Number.isFinite(value) ? value : "";
}

/** Submit fallback for optional numeric fields such as sort order. */
export function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
