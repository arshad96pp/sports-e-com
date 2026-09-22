import "server-only";
import { getContactMessageRepository } from "@/lib/config/providers";
import type {
  AdminContactMessageQueryParams,
  AdminContactMessageQueryResult,
  ContactMessageDTO,
  CreateContactMessageInput,
} from "@/lib/core/ports/contact-message.repository";

export type { ContactMessageDTO, CreateContactMessageInput };

export async function createContactMessage(input: CreateContactMessageInput): Promise<ContactMessageDTO> {
  return getContactMessageRepository().createContactMessage(input);
}

/** Admin-only — `contact_messages_select_admin` RLS enforces this regardless of caller. */
export async function listContactMessages(params?: AdminContactMessageQueryParams): Promise<AdminContactMessageQueryResult> {
  return getContactMessageRepository().listContactMessages(params);
}

export async function getContactMessageById(id: string): Promise<ContactMessageDTO | null> {
  return getContactMessageRepository().getContactMessageById(id);
}
