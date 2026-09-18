import Image from "next/image";
import Link from "next/link";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { STORE } from "@/lib/config";

/**
 * Same three trust signals as the homepage Hero's bottom row (see
 * src/components/home/Hero.tsx TRUST_BADGES) — kept as a local literal
 * rather than importing, since Hero.tsx doesn't export it and isn't part of
 * this redesign's scope.
 */
const TRUST_POINTS = [
  { icon: Truck, label: "Fast Delivery", sublabel: "Across India" },
  { icon: ShieldCheck, label: "Genuine Products", sublabel: "Trusted by athletes" },
  { icon: RotateCcw, label: "Easy Returns", sublabel: "Hassle free" },
];

/**
 * Left-hand brand panel for the split-screen auth pages (login/register/
 * check-email) — hidden below `lg` so mobile and tablet stay single-column.
 * Same dark-photo + gradient + accent-eyebrow treatment as Hero/CategorySection
 * so the auth flow reads as an extension of the homepage, not a bolted-on
 * template.
 */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col">
      <Image
        src="/images/home/story-football.webp"
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-b from-ink/80 via-ink/25 to-ink/85" />

      <div className="relative flex flex-1 flex-col p-10 xl:p-14">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight text-white">
          {STORE.name}
        </Link>

        <div className="flex flex-1 flex-col justify-center">
          <h2 className="max-w-sm font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-white xl:text-4xl">
            {STORE.tagline}
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Premium football, cricket and tennis gear for players who take their game seriously.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-white/15 pt-6">
          {TRUST_POINTS.map((t) => (
            <div key={t.label} className="flex items-center gap-2.5">
              <t.icon className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.6} />
              <div className="leading-tight">
                <p className="text-xs font-semibold text-white">{t.label}</p>
                <p className="text-[11px] text-white/55">{t.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
