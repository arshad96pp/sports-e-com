import type { Metadata } from "next";
import { AccountPageClient } from "@/components/account/AccountPageClient";
import { requireNotAdmin } from "@/lib/auth/admin-guard";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "My Account",
  description: `Manage your ${STORE.name} profile, saved addresses and account settings.`,
  robots: { index: false, follow: true },
};

export default async function AccountPage() {
  await requireNotAdmin();
  return <AccountPageClient />;
}
