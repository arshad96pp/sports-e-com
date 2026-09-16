import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BestSellers } from "@/components/home/BestSellers";
import { OffersSection } from "@/components/home/OffersSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { getActiveHeroBanners } from "@/lib/services/hero-banner-service";
import {
  HeroSkeleton,
  CategorySectionSkeleton,
  ProductSectionSkeleton,
} from "@/components/home/HomeSectionSkeletons";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

async function HeroSection() {
  const banners = await getActiveHeroBanners();
  return <Hero banners={banners} />;
}

// Each section is its own Suspense boundary so the page can stream: the
// shell (and any section that resolves fast) paints without waiting on the
// slowest one. Every fetch still kicks off immediately and in parallel —
// Suspense only changes when each result is allowed to flush to the client.
export default function Home() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />

      <JsonLd data={websiteJsonLd()} />

      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<CategorySectionSkeleton />}>
        <CategorySection />
      </Suspense>

      <Suspense fallback={<ProductSectionSkeleton count={8} />}>
        <FeaturedProducts />
      </Suspense>

      <Suspense fallback={<ProductSectionSkeleton count={6} />}>
        <BestSellers />
      </Suspense>

      <Suspense fallback={<ProductSectionSkeleton count={8} />}>
        <OffersSection />
      </Suspense>

      <WhyChooseUs />
    </>
  );
}
