import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllCategories } from "@/lib/repositories/category-repository";
import { categoryIcon } from "@/components/icons/SportIcons";

const TINTS = ["bg-surface", "bg-accent-soft", "bg-surface-strong", "bg-signal-soft"];

export async function CategorySection() {
  const CATEGORIES = await getAllCategories();
  return (
    <section id="categories" className="container-app py-12 sm:py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Shop by Category
          </h2>
          <p className="mt-1.5 text-sm text-muted">Find the right gear for your game.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat, i) => {
          const Icon = categoryIcon(cat.slug);
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border ${TINTS[i % TINTS.length]} p-6 transition-shadow hover:shadow-[0_12px_32px_-14px_rgba(0,0,0,0.2)] sm:min-h-72`}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 1px, transparent 16px)",
                }}
              />
              <Icon
                className="absolute -bottom-6 -right-6 h-36 w-36 text-ink/[0.06] transition-transform duration-300 group-hover:scale-110 group-hover:text-ink/[0.09]"
                strokeWidth={1}
              />
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl bg-white">
                <Icon className="h-7 w-7 text-ink" strokeWidth={1.5} />
              </div>
              <div className="relative z-10">
                <h3 className="font-display text-xl font-bold text-ink">{cat.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted">{cat.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                  Explore
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
