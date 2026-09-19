import type { Address } from "@/lib/types";

export interface AddressDTO extends Address {
  id: string;
  isDefault: boolean;
}

export interface AddressRepository {
  listAddresses(userId: string): Promise<AddressDTO[]>;
  createAddress(userId: string, data: Address): Promise<AddressDTO>;
  deleteAddress(userId: string, addressId: string): Promise<void>;
  /** Marks this address as the user's default and unmarks every other one of theirs. */
  setDefaultAddress(userId: string, addressId: string): Promise<void>;
}
