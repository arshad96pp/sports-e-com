"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCustomerId } from "@/lib/auth/session";
import { addressSchema } from "@/lib/validations/auth";
import * as addressService from "@/lib/services/address-service";
import type { Address } from "@/lib/types";

export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}

export async function listMyAddressesAction(): Promise<addressService.AddressDTO[]> {
  const userId = await getCurrentCustomerId();
  if (!userId) return [];
  return addressService.listAddresses(userId);
}

export async function createAddressAction(input: Address): Promise<ActionResult<addressService.AddressDTO>> {
  const userId = await getCurrentCustomerId();
  if (!userId) return { ok: false, error: "You must be logged in." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }

  const created = await addressService.createAddress(userId, parsed.data);
  revalidatePath("/account");
  return { ok: true, data: created };
}

export async function deleteAddressAction(addressId: string): Promise<ActionResult> {
  const userId = await getCurrentCustomerId();
  if (!userId) return { ok: false, error: "You must be logged in." };

  await addressService.deleteAddress(userId, addressId);
  revalidatePath("/account");
  return { ok: true };
}

export async function setDefaultAddressAction(addressId: string): Promise<ActionResult> {
  const userId = await getCurrentCustomerId();
  if (!userId) return { ok: false, error: "You must be logged in." };

  await addressService.setDefaultAddress(userId, addressId);
  revalidatePath("/account");
  return { ok: true };
}
