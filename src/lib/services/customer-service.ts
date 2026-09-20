import "server-only";
import { getCustomerRepository } from "@/lib/config/providers";
import type { CustomerDTO, CustomerQueryParams, CustomerQueryResult } from "@/lib/core/ports/customer.repository";

export type { CustomerDTO, CustomerQueryParams, CustomerQueryResult };

/**
 * Admin-facing customer list — reads only `profiles`, never touches
 * `auth.users` and never selects anything password/credential related
 * (there's nothing of the sort in `profiles` to begin with).
 */
export async function listCustomers(params?: CustomerQueryParams): Promise<CustomerQueryResult> {
  return getCustomerRepository().listCustomers(params);
}

export async function setCustomerActive(userId: string, isActive: boolean): Promise<void> {
  return getCustomerRepository().setCustomerActive(userId, isActive);
}
