import { Award, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const BENEFITS = [
  {
    icon: Award,
    title: "Quality Sports Gear",
    description: "Every product is tested for performance and durability before it reaches you.",
  },
  {
    icon: ShieldCheck,
    title: "Competitive Pricing",
    description: "Premium gear at prices that respect your budget — no compromises.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick, reliable shipping so you're never waiting to get back in the game.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Not the right fit? Hassle-free returns within 7 days of delivery.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="container-app py-12 sm:py-16">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Why Choose STRYDE
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((b) => (
          <div key={b.title} className="rounded-2xl border border-border p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink">
              <b.icon className="h-6 w-6 text-accent" strokeWidth={1.6} />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-ink">{b.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{b.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
