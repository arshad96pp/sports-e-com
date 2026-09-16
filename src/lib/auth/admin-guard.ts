import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";

export type SuperAdminSession = CurrentUser & { role: "super_admin" };

async function getSuperAdmin(): Promise<SuperAdminSession | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return null;
  return user as SuperAdminSession;
}

/** For admin pages/layouts: redirects to /admin/login when not a signed-in super admin. */
export async function requireSuperAdmin(): Promise<SuperAdminSession> {
  const admin = await getSuperAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For admin server actions: returns null instead of redirecting, so the caller can return a typed error. */
export async function getSuperAdminOrNull(): Promise<SuperAdminSession | null> {
  return getSuperAdmin();
}

/**
 * For customer-only pages (cart, account): a signed-in super admin is sent to
 * the admin dashboard instead of being allowed to shop as a customer. Pair
 * this with `getCurrentCustomerId()` in the underlying server actions — this
 * covers the page/route, that covers the mutation, neither depends on the
 * other holding.
 */
export async function requireNotAdmin(): Promise<void> {
  const user = await getCurrentUser();
  if (user?.role === "super_admin") redirect("/admin/dashboard");
}
