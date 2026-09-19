import type { Metadata } from "next";
import { AccountPageClient } from "@/components/account/AccountPageClient";
import { requireNotAdmin } from "@/lib/auth/admin-guard";
import { getCurrentUser } from "@/lib/auth/session";
import { listAddresses } from "@/lib/services/address-service";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "My Account",
  description: `Manage your ${STORE.name} profile, saved addresses and account settings.`,
  robots: { index: false, follow: true },
};

export default async function AccountPage() {
  await requireNotAdmin();
  const user = await getCurrentUser();
  const addresses = user ? await listAddresses(user.id) : [];

  return (
    <AccountPageClient
      initialProfile={user ? { fullName: user.fullName, email: user.email, phone: user.phone ?? "" } : null}
      initialAddresses={addresses}
    />
  );
}
