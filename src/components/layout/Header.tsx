import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/repositories/category-repository";
import { STORE } from "@/lib/config";
import { HeaderActions, HeaderMenuButton } from "@/components/layout/HeaderActions";
import logo from "@/app/logo-black.webp";

export async function Header() {
  const categories = await getAllCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="container-app flex h-16 items-center gap-0 lg:h-18">
        <HeaderMenuButton categories={categories} />

        <Link href="/" className="relative h-12 aspect-2084/1102 shrink-0 lg:h-14" aria-label={STORE.name}>
          <Image
            src={logo}
            alt={`${STORE.name} logo`}
            fill
            sizes="112px"
            className="object-contain object-left"
            preload
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/"
            className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface hover:text-ink"
          >
            Home
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface hover:text-ink"
            >
              {cat.shortName}
            </Link>
          ))}
        </nav>

        <HeaderActions />
      </div>
    </header>
  );
}
