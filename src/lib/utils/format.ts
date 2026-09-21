export function formatPrice(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Client-safe plain-text preview of a (sanitized) rich-text description —
 * for contexts like the Quick View card that render it as plain text, not
 * HTML. Not a security boundary (nothing here is rendered via
 * dangerouslySetInnerHTML — React text interpolation escapes it regardless);
 * the real sanitization boundary is `src/lib/utils/sanitize-html.ts`.
 */
export function stripHtmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
