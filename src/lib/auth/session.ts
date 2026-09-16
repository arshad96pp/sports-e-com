import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "customer" | "super_admin";
}

/**
 * Verifies the session against the Supabase auth server (not just the cookie)
 * and returns the caller's profile, or null if signed out. Every server action
 * and service that needs to know "who is calling" goes through this — never
 * trust a role or user id passed from the client.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) return null;

  return {
    id: user.id,
    email: profile.email,
    fullName: profile.full_name,
    phone: profile.phone,
    role: profile.role,
  };
}

/**
 * For customer-only server actions (cart, wishlist, addresses, checkout):
 * returns the caller's id only if they're signed in as a `customer`, never a
 * `super_admin`. Admin accounts are never treated as shoppers — this is the
 * server-side boundary for that, independent of any UI-level redirect.
 */
export async function getCurrentCustomerId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") return null;
  return user.id;
}
