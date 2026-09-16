import "server-only";
import { getCustomerRepository } from "@/lib/config/providers";
import type { CustomerDTO } from "@/lib/core/ports/customer.repository";

export type { CustomerDTO };

/**
 * Admin-facing customer list — reads only `profiles`, never touches
 * `auth.users` and never selects anything password/credential related
 * (there's nothing of the sort in `profiles` to begin with).
 */
export async function listCustomers(): Promise<CustomerDTO[]> {
  return getCustomerRepository().listCustomers();
}

export async function setCustomerActive(userId: string, isActive: boolean): Promise<void> {
  return getCustomerRepository().setCustomerActive(userId, isActive);
}
