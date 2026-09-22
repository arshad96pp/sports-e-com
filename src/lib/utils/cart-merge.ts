/**
 * Guest/DB cart merge helpers. Identity is variant-aware:
 *   - with a variant_id: (productId, variantId) — size/color are display only
 *   - without a variant: existing (productId, size, color) identity
 *
 * Prices are intentionally not part of a cart line. localStorage must never
 * be able to change what the user pays; checkout resolves price from the DB.
 */

export interface CartLine {
  productId: string;
  variantId: string | null;
  quantity: number;
  size: string | null;
  color: string | null;
}

export interface CatalogVariant {
  id: string;
  productId: string;
  size: string;
  color: string | null;
}

/** Same-variant lines collapse even when size/color strings differ. */
export function cartLineKey(line: Pick<CartLine, "productId" | "variantId" | "size" | "color">): string {
  if (line.variantId) return `${line.productId}::v:${line.variantId}`;
  return `${line.productId}::${line.size ?? "-"}::${line.color ?? "-"}`;
}

function asPositiveInt(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const qty = Math.floor(n);
  return qty >= 1 ? qty : null;
}

/**
 * Drop unusable guest lines and canonicalize surviving ones against the
 * live catalog. Invalid variant/product relationships are skipped (not
 * thrown) so a single stale line cannot abort the rest of a merge.
 *
 * Any `price` (or other extra field) on the guest payload is ignored.
 */
export function canonicalizeGuestLines(
  guest: readonly CartLine[],
  productIds: ReadonlySet<string>,
  variants: ReadonlyMap<string, CatalogVariant>
): CartLine[] {
  const collapsed = new Map<string, CartLine>();

  for (const raw of guest) {
    const productId = typeof raw.productId === "string" ? raw.productId.trim() : "";
    if (!productId || !productIds.has(productId)) continue;

    const quantity = asPositiveInt(raw.quantity);
    if (quantity === null) continue;

    const variantId =
      typeof raw.variantId === "string" && raw.variantId.trim() !== "" ? raw.variantId.trim() : null;

    let size = typeof raw.size === "string" && raw.size.trim() !== "" ? raw.size : null;
    let color = typeof raw.color === "string" && raw.color.trim() !== "" ? raw.color : null;

    if (variantId) {
      const variant = variants.get(variantId);
      // Missing variant, or a variant that belongs to a different product —
      // never persist that relationship.
      if (!variant || variant.productId !== productId) continue;
      size = variant.size;
      color = variant.color;
    }

    const line: CartLine = { productId, variantId, quantity, size, color };
    const key = cartLineKey(line);
    const existing = collapsed.get(key);
    if (existing) existing.quantity += quantity;
    else collapsed.set(key, line);
  }

  return [...collapsed.values()];
}

/** DB lines first, then add guest quantities onto matching identity keys. */
export function mergeCartLines(dbLines: readonly CartLine[], guestLines: readonly CartLine[]): CartLine[] {
  const merged = new Map<string, CartLine>();

  for (const line of dbLines) {
    const key = cartLineKey(line);
    const existing = merged.get(key);
    if (existing) existing.quantity += line.quantity;
    else merged.set(key, { ...line });
  }

  for (const line of guestLines) {
    if (line.quantity < 1) continue;
    const key = cartLineKey(line);
    const existing = merged.get(key);
    if (existing) existing.quantity += line.quantity;
    else merged.set(key, { ...line });
  }

  return [...merged.values()];
}

/** Strip a client payload down to identity + quantity — never forward price. */
export function toGuestCartPayload(items: unknown): CartLine[] {
  if (!Array.isArray(items)) return [];
  const lines: CartLine[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.productId !== "string" || row.productId.trim() === "") continue;
    lines.push({
      productId: row.productId,
      variantId: typeof row.variantId === "string" ? row.variantId : null,
      quantity: typeof row.quantity === "number" ? row.quantity : Number(row.quantity),
      size: typeof row.size === "string" ? row.size : null,
      color: typeof row.color === "string" ? row.color : null,
    });
  }
  return lines;
}
