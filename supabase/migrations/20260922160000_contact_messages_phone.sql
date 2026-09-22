-- Replaces the unread/read/replied status workflow on contact_messages with
-- a callback phone number — the actual admin need turned out to be "call the
-- customer back", not read-tracking, and nothing else reads this status.
-- The table has no production data yet, so dropping the column is safe.
alter table public.contact_messages add column phone text;

-- Stored normalized as "+91XXXXXXXXXX" (see src/lib/utils/phone.ts) so the
-- value is always predictable; nullable for rows inserted before this
-- migration (there are none yet, but the admin UI must not assume NOT NULL).
alter table public.contact_messages
  add constraint contact_messages_phone_format check (phone is null or phone ~ '^\+91[6-9]\d{9}$');

alter table public.contact_messages drop column status;

drop type if exists public.contact_message_status;
