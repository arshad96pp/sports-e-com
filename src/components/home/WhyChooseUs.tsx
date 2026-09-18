import { Award, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const BENEFITS = [
  {
    icon: Award,
    title: "Quality gear",
    description: "Tested for performance.",
  },
  {
    icon: ShieldCheck,
    title: "Competitive pricing",
    description: "Great gear at fair prices.",
  },
  {
    icon: Truck,
    title: "Fast delivery",
    description: "To your doorstep.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    description: "Simple return process.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="border-t border-border">
      <div className="container-app py-10 sm:py-12">
        <div className="flex flex-col lg:flex-row">
          {BENEFITS.map((b, i) => (
            <div
              key={b.title}
              className={`flex flex-1 items-start gap-3 py-5 lg:px-8 lg:py-1 ${
                i > 0 ? "border-t border-border lg:border-t-0 lg:border-l" : "lg:pl-0"
              }`}
            >
              <b.icon className="mt-0.5 h-4 w-4 shrink-0 text-ink" strokeWidth={1.6} />
              <div>
                <h3 className="text-sm font-semibold text-ink">{b.title}</h3>
                <p className="mt-0.5 text-sm text-muted">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
