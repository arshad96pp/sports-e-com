import type { CategorySlug } from "@/lib/types";

export const POPULAR_SEARCHES = [
  "Football Boots",
  "Cricket Bats",
  "Tennis Racket",
  "Yoga Mat",
  "Shin Guards",
  "Sports Bottle",
];

export const POPULAR_SEARCH_CATEGORIES: { label: string; slug: CategorySlug }[] = [
  { label: "Football", slug: "football" },
  { label: "Cricket", slug: "cricket" },
  { label: "Tennis", slug: "tennis" },
  { label: "Other Sports", slug: "other-accessories" },
];
