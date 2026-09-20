"use client";

import { useEffect } from "react";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * Last-resort boundary for errors thrown outside every route segment's own
 * `error.tsx` — e.g. in `(customer)/layout.tsx` itself (Header's category
 * fetch) or the root layout. Must render its own `<html>`/`<body>` since it
 * replaces the entire document.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={cn(quicksand.variable, "font-sans")}>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center antialiased">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Something went wrong.
        </h1>
        <p className="max-w-sm text-sm text-muted">We hit a snag loading the page. Please try again.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="tap-target mt-2 inline-flex items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
