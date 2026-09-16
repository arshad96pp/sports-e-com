import { requireSuperAdmin } from "@/lib/auth/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireSuperAdmin();
  return <AdminShell adminName={admin.fullName || admin.email}>{children}</AdminShell>;
}
