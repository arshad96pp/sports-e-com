/**
 * Seeds only what the app needs to bootstrap an empty store: store settings
 * (so the admin Settings form has a row to load/edit) and the super admin
 * login (so /admin/login works at all). Deliberately does NOT seed any
 * products, categories, subcategories, banners, offers or reviews — the
 * catalog starts empty and is populated for real from the Super Admin panel.
 *
 * Run via `pnpm seed` (uses `tsx --env-file=.env.local`, so this only ever
 * needs the service-role key from your local `.env.local` — never commit
 * that file). Safe to re-run: store settings upsert on their singleton id;
 * the super admin auth user is skipped if it already exists.
 *
 * Deliberately does NOT import anything from `@/lib/services/*` or
 * `@/lib/supabase/*` — those are marked `server-only` and throw when loaded
 * outside a Next.js server render, which this plain script is not.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/types";
import { STORE } from "../src/lib/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.local).");
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getOrCreateAuthUser(email: string, password: string, metadata: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (!error && data.user) return data.user.id;

  // Already exists — look up the id via profiles (auth.users email is unique).
  const { data: existing } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
  if (existing) return existing.id;

  throw new Error(`Could not create or find auth user for ${email}: ${error?.message}`);
}

async function seedStoreSettings() {
  const { error } = await supabase.from("store_settings").upsert(
    {
      id: "singleton",
      store_name: STORE.name,
      whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "917034474858",
      contact_phone: STORE.supportPhone,
      contact_email: STORE.supportEmail,
      address_line: STORE.address,
      instagram_url: STORE.social.instagram,
      facebook_url: null,
      twitter_url: null,
      youtube_url: null,
      shipping_info: "Free delivery above ₹999. 3-5 business days across India.",
      return_policy: "7-day easy returns on unused items in original packaging.",
      free_shipping_threshold: 999,
      seo_default_title: `${STORE.name} — ${STORE.tagline}`,
      seo_default_description: "Premium football, cricket, tennis and multi-sport accessories.",
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(`Store settings: ${error.message}`);
  console.log("Seeded store settings.");
}

async function seedSuperAdmin() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL ?? "admin@stryde.in";
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  if (!password) {
    console.warn("SEED_SUPER_ADMIN_PASSWORD not set — skipping super admin seed. Set it in .env.local to seed /admin/login access.");
    return;
  }

  const userId = await getOrCreateAuthUser(email, password, { full_name: "Store Admin", role: "super_admin" });
  // Idempotent: also promote in case the user already existed as a customer.
  await supabase.from("profiles").update({ role: "super_admin", full_name: "Store Admin" }).eq("id", userId);
  console.log(`Super admin ready: ${email} / (see .env.local)`);
}

async function main() {
  await seedStoreSettings();
  await seedSuperAdmin();
  console.log("\nSeed complete. Catalog is empty — add categories and products from /admin.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
