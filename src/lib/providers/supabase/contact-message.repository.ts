import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  AdminContactMessageQueryParams,
  AdminContactMessageQueryResult,
  ContactMessageDTO,
  ContactMessageRepository,
  CreateContactMessageInput,
} from "@/lib/core/ports/contact-message.repository";

const SELECT = "id, full_name, email, phone, message, created_at, updated_at";

function toDTO(r: {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  updated_at: string;
}): ContactMessageDTO {
  return {
    id: r.id,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    message: r.message,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function createSupabaseContactMessageRepository(): ContactMessageRepository {
  return {
    /**
     * Anon client — the Contact form is submitted with no session
     * (`contact_messages_insert_public` RLS). Deliberately does NOT chain
     * `.select()`: that would ask PostgREST to `RETURNING` the row, which
     * requires a SELECT policy to grant the anon role read access back to
     * the just-inserted row — and `contact_messages_select_admin` only
     * grants that to `is_super_admin()`. Requesting it anyway fails the
     * insert with the same 42501 "row violates row-level security policy"
     * error as a failed WITH CHECK, even though the insert itself is valid.
     */
    async createContactMessage(input: CreateContactMessageInput): Promise<ContactMessageDTO> {
      const supabase = createPublicClient();
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const { error } = await supabase.from("contact_messages").insert({
        id,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone,
        message: input.message,
      });
      if (error) throw new Error(error.message);
      return {
        id,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        message: input.message,
        createdAt: now,
        updatedAt: now,
      };
    },

    /** RLS-scoped: `contact_messages_select_admin` only allows a super admin to read these. */
    async listContactMessages(params: AdminContactMessageQueryParams = {}): Promise<AdminContactMessageQueryResult> {
      const supabase = await createClient();
      const page = Math.max(1, params.page ?? 1);
      const pageSize = params.pageSize ?? 20;

      let query = supabase.from("contact_messages").select(SELECT, { count: "exact" });

      if (params.search?.trim()) {
        const like = `%${params.search.trim()}%`;
        query = query.or(`full_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`);
      }

      query = query.order("created_at", { ascending: false });

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, count } = await query;
      const messages = (data ?? []).map(toDTO);

      return {
        messages,
        total: count ?? messages.length,
        page,
        pageSize,
        pageCount: Math.max(1, Math.ceil((count ?? messages.length) / pageSize)),
      };
    },

    async getContactMessageById(id: string): Promise<ContactMessageDTO | null> {
      const supabase = await createClient();
      const { data } = await supabase.from("contact_messages").select(SELECT).eq("id", id).maybeSingle();
      return data ? toDTO(data) : null;
    },
  };
}
