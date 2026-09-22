-- contact_messages: stores every Contact form submission so admins can
-- triage inquiries from the admin panel, independent of the existing email
-- notification flow (kept as-is — this table is purely additive).
create type public.contact_message_status as enum ('unread', 'read', 'replied');

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status public.contact_message_status not null default 'unread',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_messages_status_idx on public.contact_messages (status);
create index contact_messages_created_at_idx on public.contact_messages (created_at);

create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

alter table public.contact_messages enable row level security;

-- Anonymous visitors submit the Contact form with no session, so inserts
-- must be open to the public client — same trust boundary the existing
-- honeypot + server-side rate limit in the API route already assume.
create policy "contact_messages_insert_public" on public.contact_messages
  for insert with check (true);

-- Never exposed through any public read path — admin-only, matching the
-- rest of the admin-authorized tables (orders, offers, etc.).
create policy "contact_messages_select_admin" on public.contact_messages
  for select using (public.is_super_admin());
create policy "contact_messages_update_admin" on public.contact_messages
  for update using (public.is_super_admin());
