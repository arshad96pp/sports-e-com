-- The Contact page form no longer collects a Topic/Subject — it was removed
-- in favor of a single "phone" field, matching the actual admin need (call
-- the customer back). The table has no production data, so dropping the
-- column is safe.
alter table public.contact_messages drop column subject;
