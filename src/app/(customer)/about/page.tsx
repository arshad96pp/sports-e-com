import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Heart, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, organizationJsonLd } from "@/lib/seo/structured-data";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Our Story",
  description: `Learn about ${STORE.name} — premium football, cricket, tennis and multi-sport accessories built for every athlete.`,
  alternates: { canonical: "/about" },
};

const MILESTONES = [
  {
    year: "01",
    title: "The idea",
    body: "Built for athletes who take their game seriously — weekend matches, nets practice and club tennis.",
  },
  {
    year: "02",
    title: "Football",
    body: "Match and training kit selected for the pitch: durable, simple to choose, ready to play.",
  },
  {
    year: "03",
    title: "Cricket",
    body: "Nets and match essentials curated so practice never waits on missing gear.",
  },
  {
    year: "04",
    title: "Tennis",
    body: "Court-ready accessories for league nights and everyday hitting.",
  },
  {
    year: "05",
    title: "Personal checkout",
    body: "Every order is confirmed with our team on WhatsApp, so you always know where it stands.",
  },
  {
    year: "06",
    title: "Nationwide",
    body: "Fast delivery across India, with a simple returns process if something is not right.",
  },
] as const;

const PILLARS = [
  {
    icon: ShieldCheck,
    eyebrow: "Standards",
    title: "Quality first",
    body: "We never compromise on durability, performance or finish. Every product is chosen to hold up mid-game.",
  },
  {
    icon: Award,
    eyebrow: "Value",
    title: "Fair prices",
    body: "Premium football, cricket, tennis and training kit at prices that make sense for club players and weekend athletes.",
  },
  {
    icon: Heart,
    eyebrow: "Loyalty",
    title: "Personal connection",
    body: "Checkout stays boutique. We confirm every order with you directly, and treat each one like it matters — because it does.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Our Story", path: "/about" },
        ])}
      />

      <section className="pt-10 pb-8 text-left md:pt-16 md:pb-12">
        <div className="container-app">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center justify-start gap-2.5 text-[9px] font-bold tracking-[0.1em] text-ink/30 uppercase md:text-[10px]"
          >
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span className="flex items-center gap-3">
              <span className="-translate-y-px opacity-20">/</span>
              <span className="text-ink/80">Our Story</span>
            </span>
          </nav>
          <h1 className="mb-3 font-display text-3xl leading-tight font-light tracking-tight text-ink md:text-6xl">
            Our Story
          </h1>
          <p className="mr-auto max-w-2xl text-sm leading-relaxed font-medium text-ink/40 md:text-lg">
            The intersection of performance gear and everyday play.
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-32">
        <div className="container-app">
          <div className="grid items-center gap-12 lg:grid-cols-2 md:gap-24">
            <div className="space-y-8 md:space-y-12">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-px w-12 bg-[#c4a35a]" />
                  <span className="text-[10px] font-bold tracking-[0.3em] text-[#c4a35a] uppercase md:text-xs">
                    Based in Kerala
                  </span>
                </div>
                <h2 className="mb-8 font-display text-3xl leading-[1.1] font-light tracking-tight text-ink md:text-6xl">
                  A Legacy of <br />
                  <span className="font-bold italic">Match-Ready</span> Gear
                </h2>
                <div className="space-y-6 text-base leading-relaxed font-medium text-ink/60 md:text-xl">
                  <p>
                    It started with a simple idea: athletes deserve kit that performs as hard as they
                    do, without the hunt. What began as a shortlist for weekend matches became{" "}
                    {STORE.name}.
                  </p>
                  <p>
                    From Kerala we curate football, cricket, tennis and multi-sport accessories —
                    selected for durability, performance and value, then confirmed with you personally
                    over WhatsApp.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 border-t border-ink/5 pt-8 md:gap-12">
                <div>
                  <h3 className="mb-2 text-[10px] font-bold tracking-widest text-ink/30 uppercase">Heritage</h3>
                  <p className="text-sm font-bold text-ink">Kerala, India</p>
                </div>
                <div>
                  <h3 className="mb-2 text-[10px] font-bold tracking-widest text-ink/30 uppercase">Scope</h3>
                  <p className="text-sm font-bold text-ink">Pan-India Delivery</p>
                </div>
              </div>
            </div>

            <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] border border-ink/5 bg-[#f9f8f4] md:rounded-[3rem]">
              <div className="pointer-events-none absolute inset-0 flex rotate-[-10deg] items-center justify-center text-[15vw] font-bold tracking-tighter text-ink/5 select-none">
                ENZO
              </div>
              <div className="absolute bottom-10 left-10 hidden rounded-2xl bg-white p-6 shadow-2xl md:block">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-ink/30 uppercase">Store</p>
                    <p className="text-sm leading-none font-bold text-ink">Trippanachi, Kerala</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/5 bg-[#fcfcfc] py-24 md:py-32">
        <div className="container-app">
          <p className="mb-12 text-center text-[10px] font-bold tracking-[0.4em] text-ink/20 uppercase md:text-left">
            The Enzo way
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            {MILESTONES.map((item) => (
              <div
                key={item.year}
                className="group rounded-2xl border border-ink/5 bg-white p-8 transition-colors hover:border-[#c4a35a]/40"
              >
                <span className="mb-4 block text-2xl font-light text-[#c4a35a]/30 transition-colors group-hover:text-[#c4a35a]">
                  {item.year}
                </span>
                <h3 className="mb-2 text-lg font-bold text-ink">{item.title}</h3>
                <p className="text-sm leading-relaxed font-medium text-ink/50">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white py-24 md:py-48">
        <div className="container-app">
          <div className="mx-auto mb-20 max-w-2xl text-center md:mb-32">
            <Sparkles className="mx-auto mb-8 h-8 w-8 animate-pulse text-[#c4a35a] md:h-10 md:w-10" />
            <h2 className="mb-6 font-display text-3xl leading-tight font-light tracking-tight text-ink md:text-5xl">
              Why we <span className="border-b border-ink/10 font-bold">play</span>
            </h2>
            <p className="text-sm font-medium text-ink/40 md:text-base">
              Driven by performance, fair pricing and a commitment to keeping checkout personal.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 md:gap-16">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="group rounded-[2rem] border border-ink/5 p-8 transition-all duration-500 hover:bg-[#f9f8f4] md:p-12"
              >
                <div className="mb-8">
                  <pillar.icon className="h-8 w-8 text-[#c4a35a]" strokeWidth={1.75} />
                </div>
                <span className="mb-3 block text-[10px] font-bold tracking-[0.3em] text-[#c4a35a]/60 uppercase">
                  {pillar.eyebrow}
                </span>
                <h3 className="mb-4 text-xl font-light text-ink md:text-2xl">{pillar.title}</h3>
                <p className="text-sm leading-relaxed font-medium text-ink/40 md:text-base">{pillar.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mb-[-4rem] overflow-hidden bg-ink py-12 text-white md:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container-app relative z-10">
          <div className="flex flex-col items-center justify-between gap-12 md:flex-row">
            <div>
              <h2 className="mb-4 font-display text-2xl font-light tracking-tight text-white md:text-4xl">
                Ready to become part of our story?
              </h2>
              <p className="text-sm text-white/40 md:text-base">
                Explore the collection built for football, cricket, tennis and more.
              </p>
            </div>
            <Link
              href="/#categories"
              className="inline-flex items-center gap-4 rounded-full bg-white px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-ink uppercase shadow-2xl transition-all hover:bg-[#c4a35a] hover:text-white"
            >
              Discover the Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
