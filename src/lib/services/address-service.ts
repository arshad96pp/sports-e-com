import "server-only";
import { getAddressRepository } from "@/lib/config/providers";
import type { Address } from "@/lib/types";
import type { AddressDTO } from "@/lib/core/ports/address.repository";

export type { AddressDTO };

export async function listAddresses(userId: string): Promise<AddressDTO[]> {
  return getAddressRepository().listAddresses(userId);
}

export async function createAddress(userId: string, data: Address): Promise<AddressDTO> {
  return getAddressRepository().createAddress(userId, data);
}

export async function deleteAddress(userId: string, addressId: string): Promise<void> {
  return getAddressRepository().deleteAddress(userId, addressId);
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<void> {
  return getAddressRepository().setDefaultAddress(userId, addressId);
}
