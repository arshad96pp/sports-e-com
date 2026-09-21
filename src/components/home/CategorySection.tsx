import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getAllCategories } from "@/lib/repositories/category-repository";
import { categoryIcon } from "@/components/icons/SportIcons";
import { categoryImageSrc } from "@/lib/home-images";
import type { CategoryDTO } from "@/lib/services/category-service";
import { cn } from "cn";

const TILE = [
  {
    frame: "min-h-[320px] md:col-span-10 md:row-span-2 md:min-h-[470px] lg:min-h-[530px]",
    title: "text-[1.75rem] sm:text-4xl lg:text-[2.75rem]",
    showCopy: true,
    sizes: "(min-width: 768px) 42vw, 100vw",
  },
  {
    frame: "min-h-[200px] md:col-span-7 md:min-h-[230px] lg:min-h-[260px]",
    title: "text-lg sm:text-xl",
    showCopy: false,
    sizes: "(min-width: 768px) 29vw, 50vw",
  },
  {
    frame: "min-h-[200px] md:col-span-7 md:min-h-[230px] lg:min-h-[260px]",
    title: "text-lg sm:text-xl",
    showCopy: false,
    sizes: "(min-width: 768px) 29vw, 50vw",
  },
  {
    frame: "min-h-[200px] md:col-span-14 md:min-h-[230px] lg:min-h-[260px]",
    title: "text-xl sm:text-2xl",
    showCopy: true,
    sizes: "(min-width: 768px) 58vw, 100vw",
  },
] as const;

function CategoryTile({ cat, index }: { cat: CategoryDTO; index: number }) {
  const visual = TILE[index % TILE.length];
  const src = cat.imageUrl || categoryImageSrc(cat.slug);
  const Icon = categoryIcon(cat.slug);

  return (
    <Link
      href={`/category/${cat.slug}`}
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-3xl",
        visual.frame
      )}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={visual.sizes}
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-strong">
          {/* Icon is chosen per-category from a fixed set of stateless SVG icon components. */}
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Icon className="absolute -bottom-8 -right-8 h-40 w-40 text-ink/10" strokeWidth={0.9} />
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-ink/55 via-ink/5 to-transparent" />

      <div className="relative z-10 p-5 sm:p-7">
        <h3 className={cn("font-display font-semibold tracking-tight text-white", visual.title)}>
          {cat.shortName || cat.name}
        </h3>
        {visual.showCopy && (
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/75 line-clamp-2">
            {cat.description}
          </p>
        )}
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white">
          Shop now
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export async function CategorySection() {
  let categories: CategoryDTO[] = [];
  try {
    categories = await getAllCategories();
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
  // Categories are a secondary navigation aid, not the main content — an
  // empty/failed fetch hides the section rather than reserving blank space.
  if (categories.length === 0) return null;

  const [football, ...rest] = [
    ...categories.filter((c) => c.slug === "football"),
    ...categories.filter((c) => c.slug !== "football"),
  ];
  const ordered = football ? [football, ...rest] : categories;

  return (
    <section id="categories" className="scroll-mt-20">
      <div className="container-app pt-12 pb-0 sm:pt-16">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          Shop your sport
        </h2>
        <p className="mt-1.5 text-sm text-muted">Football, cricket, tennis and training kit.</p>
      </div>

      <div className="container-app mt-6 sm:mt-8">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-24">
          {ordered.map((cat, i) => (
            <CategoryTile key={cat.slug} cat={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
