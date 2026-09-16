"use client";

import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteBannerAction } from "@/lib/actions/admin/banner-actions";

export function DeleteBannerButton({ bannerId, bannerTitle }: { bannerId: string; bannerTitle: string }) {
  return <ConfirmDeleteButton itemLabel={bannerTitle} onConfirm={() => deleteBannerAction(bannerId)} />;
}
