"use client";

import { useEffect, useState } from "react";
import { cn } from "cn";
import type { OfferAnnouncementItem } from "@/lib/utils/offers";
import { OfferAnnouncementLink } from "@/components/layout/OfferAnnouncementLink";

const ROTATE_MS = 4500;

export function OfferAnnouncementRotator({ items }: { items: OfferAnnouncementItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [items.length]);

  const previous = (index - 1 + items.length) % items.length;

  return (
    <div className="relative h-10 w-full min-w-0 overflow-hidden" aria-live="polite">
      {items.map((item, i) => {
        const active = i === index;
        const leaving = i === previous;
        return (
          <div
            key={item.id}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              active && "z-10 translate-y-0 opacity-100",
              leaving && !active && "pointer-events-none z-0 -translate-y-full opacity-0",
              !active && !leaving && "pointer-events-none z-0 translate-y-full opacity-0"
            )}
            aria-hidden={!active}
          >
            <OfferAnnouncementLink item={item} />
          </div>
        );
      })}
    </div>
  );
}
