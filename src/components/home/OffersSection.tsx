import Link from "next/link";
import { Percent } from "lucide-react";
import { getDealProducts } from "@/lib/repositories/product-repository";
import { ProductGrid } from "@/components/product/ProductGrid";

export async function OffersSection() {
  const products = await getDealProducts(8);

  return (
    <section className="container-app py-12 sm:py-16">
      <div className="overflow-hidden rounded-2xl bg-ink">
        <div className="flex flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-signal">
              <Percent className="h-5 w-5 text-white" />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-white sm:text-2xl">
                Deals of the Day
              </h2>
              <p className="text-sm text-white/60">Up to 50% off on top-rated gear. Limited stock.</p>
            </div>
          </div>
          <Link
            href="/category/football"
            className="tap-target inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-6 text-sm font-bold text-accent-ink"
          >
            Shop All Offers
          </Link>
        </div>
        <div className="bg-white p-4 sm:p-6">
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}
