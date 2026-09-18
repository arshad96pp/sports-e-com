import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeShopCta() {
  return (
    <section className="container-app py-12 text-center sm:py-16">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Your game. Your gear.
      </h2>
      <p className="mt-2 text-sm text-muted">Football. Cricket. Tennis. More.</p>
      <Link
        href="#categories"
        className="group mt-6 inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-ink-soft"
      >
        Explore all sports
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
