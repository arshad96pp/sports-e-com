import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OfferAnnouncementItem } from "@/lib/utils/offers";

export function OfferAnnouncementLink({ item }: { item: OfferAnnouncementItem }) {
  return (
    <Link
      href={item.href}
      className="group inline-flex max-w-full items-center gap-2.5 px-1 text-[13px] leading-none text-white"
    >
      <span className="shrink-0 font-semibold tracking-wide">
        {item.discountPercent}% OFF
      </span>
      {item.label ? (
        <>
          <span className="text-white/35" aria-hidden>
            ·
          </span>
          <span className="truncate font-medium text-white/90">{item.label}</span>
        </>
      ) : null}
      <span className="hidden shrink-0 items-center gap-1 text-white/75 transition-colors group-hover:text-white sm:inline-flex">
        Shop now
        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
