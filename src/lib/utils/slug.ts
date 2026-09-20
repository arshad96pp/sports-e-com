export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Normalizes a slug (or arbitrary text) into an uppercase, hyphenated SKU prefix, e.g. "nike-football-shoes" -> "NIKE-FOOTBALL-SHOES". */
export function skuPrefixFromSlug(value: string): string {
  return value
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
