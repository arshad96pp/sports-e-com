import "server-only";
import sanitizeHtml from "sanitize-html";

const DESCRIPTION_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "h2", "h3", "strong", "b", "em", "i", "ul", "ol", "li", "a", "br", "span"],
  // `style` is only ever used for the admin editor's text-align — everything
  // else is stripped by `allowedStyles` below regardless of what's allowed here.
  // `target`/`rel` must stay allowlisted here too — `transformTags` below adds
  // them to every `<a>`, but `allowedAttributes` filtering runs afterwards and
  // would otherwise strip anything not named here right back off.
  allowedAttributes: { a: ["href", "target", "rel"], "*": ["style"] },
  allowedStyles: {
    "*": { "text-align": [/^left$/, /^center$/, /^right$/, /^justify$/] },
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow ugc" }),
  },
};

/**
 * Sanitizes admin-authored product description HTML (from the Tiptap editor)
 * down to a safe, narrow tag/attribute allowlist. Plain-text legacy
 * descriptions (no HTML tags) pass through unchanged, so old products keep
 * rendering exactly as before. Called both at write time (admin save) and
 * again at read time (storefront render) as defense in depth.
 */
export function sanitizeDescriptionHtml(html: string): string {
  return sanitizeHtml(html, DESCRIPTION_SANITIZE_OPTIONS).trim();
}

/**
 * Strips all markup down to plain text — for contexts that must never
 * contain HTML, such as `<meta description>` or JSON-LD.
 */
export function descriptionToPlainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
