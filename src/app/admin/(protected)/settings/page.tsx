import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/services/settings-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader title="Settings" description="Store configuration used across the site — never hardcoded in components." />
      <SettingsForm initial={settings} />
    </div>
  );
}
