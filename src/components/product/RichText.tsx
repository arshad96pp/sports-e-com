import { cn } from "cn";

interface RichTextProps {
  /** Must already be sanitized — see `src/lib/utils/sanitize-html.ts`. */
  html: string;
  className?: string;
}

/** Renders pre-sanitized admin-authored HTML (product description) with the shared `.rich-text` styling. */
export function RichText({ html, className = "" }: RichTextProps) {
  return <div className={cn("rich-text", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
