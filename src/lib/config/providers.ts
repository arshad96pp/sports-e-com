import "server-only";
import { createSupabaseAuthSessionPort } from "@/lib/providers/supabase/auth.server";
import { createSupabaseProductRepository } from "@/lib/providers/supabase/product.repository";
import { createSupabaseCategoryRepository } from "@/lib/providers/supabase/category.repository";
import { createSupabaseReviewRepository } from "@/lib/providers/supabase/review.repository";
import { createSupabaseOfferRepository } from "@/lib/providers/supabase/offer.repository";
import { createSupabaseSettingsRepository } from "@/lib/providers/supabase/settings.repository";
import { createSupabaseHeroBannerRepository } from "@/lib/providers/supabase/hero-banner.repository";
import { createSupabaseCartRepository } from "@/lib/providers/supabase/cart.repository";
import { createSupabaseWishlistRepository } from "@/lib/providers/supabase/wishlist.repository";
import { createSupabaseCustomerRepository } from "@/lib/providers/supabase/customer.repository";
import { createSupabaseAddressRepository } from "@/lib/providers/supabase/address.repository";
import { createSupabaseOrderRepository } from "@/lib/providers/supabase/order.repository";
import { createSupabaseStatsRepository } from "@/lib/providers/supabase/stats.repository";
import { createSupabaseStoragePort } from "@/lib/providers/supabase/storage.provider";
import { createSupabaseContactMessageRepository } from "@/lib/providers/supabase/contact-message.repository";
import type { AuthSessionPort } from "@/lib/core/ports/auth.port";
import type { ProductRepository } from "@/lib/core/ports/product.repository";
import type { CategoryRepository } from "@/lib/core/ports/category.repository";
import type { ReviewRepository } from "@/lib/core/ports/review.repository";
import type { OfferRepository } from "@/lib/core/ports/offer.repository";
import type { SettingsRepository } from "@/lib/core/ports/settings.repository";
import type { HeroBannerRepository } from "@/lib/core/ports/hero-banner.repository";
import type { CartRepository } from "@/lib/core/ports/cart.repository";
import type { WishlistRepository } from "@/lib/core/ports/wishlist.repository";
import type { CustomerRepository } from "@/lib/core/ports/customer.repository";
import type { AddressRepository } from "@/lib/core/ports/address.repository";
import type { OrderRepository } from "@/lib/core/ports/order.repository";
import type { StatsRepository } from "@/lib/core/ports/stats.repository";
import type { StoragePort } from "@/lib/core/ports/storage.port";
import type { ContactMessageRepository } from "@/lib/core/ports/contact-message.repository";

/**
 * The single place server-side provider selection happens. Every service
 * calls one of these getters instead of importing a Supabase client
 * directly — swapping a piece of infrastructure to AWS later means adding a
 * case here (and the adapter it points to), not touching any service.
 *
 * Each concern defaults to "supabase" (today's only implementation) and can
 * be flipped independently — moving Storage to S3 doesn't require also
 * moving the database.
 */
const AUTH_PROVIDER = process.env.AUTH_PROVIDER ?? "supabase";
const DATABASE_PROVIDER = process.env.DATABASE_PROVIDER ?? "supabase";
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER ?? "supabase";

export function getAuthSessionPort(): AuthSessionPort {
  switch (AUTH_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseAuthSessionPort();
  }
}

export function getProductRepository(): ProductRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseProductRepository();
  }
}

export function getCategoryRepository(): CategoryRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseCategoryRepository();
  }
}

export function getReviewRepository(): ReviewRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseReviewRepository();
  }
}

export function getOfferRepository(): OfferRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseOfferRepository();
  }
}

export function getSettingsRepository(): SettingsRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseSettingsRepository();
  }
}

export function getHeroBannerRepository(): HeroBannerRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseHeroBannerRepository();
  }
}

export function getCartRepository(): CartRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseCartRepository();
  }
}

export function getWishlistRepository(): WishlistRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseWishlistRepository();
  }
}

export function getCustomerRepository(): CustomerRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseCustomerRepository();
  }
}

export function getAddressRepository(): AddressRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseAddressRepository();
  }
}

export function getOrderRepository(): OrderRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseOrderRepository();
  }
}

export function getStatsRepository(): StatsRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseStatsRepository();
  }
}

export function getStoragePort(): StoragePort {
  switch (STORAGE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseStoragePort();
  }
}

export function getContactMessageRepository(): ContactMessageRepository {
  switch (DATABASE_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseContactMessageRepository();
  }
}
