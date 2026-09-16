import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLoginClient } from "@/components/admin/AdminLoginClient";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "super_admin") redirect("/admin/dashboard");

  return <AdminLoginClient />;
}
