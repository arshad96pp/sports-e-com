import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HomeCampaignBanner } from "@/components/home/HomeCampaignBanner";
import { SportCollection } from "@/components/home/SportCollection";
import { BestSellers } from "@/components/home/BestSellers";
import { OffersSection } from "@/components/home/OffersSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { HomeShopCta } from "@/components/home/HomeShopCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { getActiveHeroBanners, type HeroBannerDTO } from "@/lib/services/hero-banner-service";
import {
  HeroSkeleton,
  CategorySectionSkeleton,
  FeaturedSectionSkeleton,
  ProductRailSkeleton,
} from "@/components/home/HomeSectionSkeletons";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

async function HeroSection() {
  let banners: HeroBannerDTO[] = [];
  try {
    banners = await getActiveHeroBanners();
  } catch (error) {
    // Hero renders its own static fallback for an empty list — swallow the
    // error here instead of letting it bubble to the page's error boundary.
    console.error("Failed to load hero banners:", error);
  }
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

      <Suspense fallback={<FeaturedSectionSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      <HomeCampaignBanner />

      <Suspense fallback={<FeaturedSectionSkeleton />}>
        <SportCollection />
      </Suspense>

      <Suspense fallback={<ProductRailSkeleton />}>
        <BestSellers />
      </Suspense>

      <Suspense fallback={<ProductRailSkeleton />}>
        <OffersSection />
      </Suspense>

      <WhyChooseUs />

      <HomeShopCta />
    </>
  );
}
