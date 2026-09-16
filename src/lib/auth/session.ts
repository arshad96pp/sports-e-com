import "server-only";
import { getAuthSessionPort } from "@/lib/config/providers";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "customer" | "super_admin";
}

/**
 * Verifies the session against the auth provider (not just the cookie) and
 * returns the caller's profile, or null if signed out. Every server action
 * and service that needs to know "who is calling" goes through this — never
 * trust a role or user id passed from the client.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const auth = getAuthSessionPort();
  const user = await auth.getAuthenticatedUser();
  if (!user) return null;

  const profile = await auth.getProfileById(user.id);
  if (!profile || !profile.isActive) return null;

  return {
    id: user.id,
    email: profile.email,
    fullName: profile.fullName,
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

/**
 * Errors are intentionally swallowed beyond validation (the caller validates
 * the email shape) — the UI always shows a generic "if an account exists"
 * message so this can't be used to enumerate registered emails.
 */
export async function resetPasswordForEmail(email: string, redirectTo: string): Promise<void> {
  await getAuthSessionPort().resetPasswordForEmail(email, redirectTo);
}
