import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminIndexPage() {
  const user = await getCurrentUser();
  redirect(user?.role === "super_admin" ? "/admin/dashboard" : "/admin/login");
}
