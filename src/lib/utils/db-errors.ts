/** True when a Postgres error is a `unique_violation` (23505) on a constraint/column matching `columnHint`. */
export function isUniqueViolation(error: { code?: string; message?: string } | null, columnHint: string): boolean {
  if (!error) return false;
  return error.code === "23505" && (error.message?.toLowerCase().includes(columnHint.toLowerCase()) ?? false);
}
