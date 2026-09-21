import { requireSuperAdmin } from "@/lib/auth/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProviders } from "@/components/admin/AdminProviders";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireSuperAdmin();
  return (
    <AdminProviders>
      <AdminShell adminName={admin.fullName || admin.email}>{children}</AdminShell>
    </AdminProviders>
  );
}
