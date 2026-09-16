import "server-only";
import { getStatsRepository } from "@/lib/config/providers";
import type { AdminDashboardStats } from "@/lib/core/ports/stats.repository";

export type { AdminDashboardStats };

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  return getStatsRepository().getDashboardStats();
}
