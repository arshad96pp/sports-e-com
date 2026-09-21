-- store_settings had 15 editable fields, but an audit of every consumer
-- found only whatsapp_number was ever actually read outside the admin
-- Settings screen itself — the storefront (name, logo, contact info,
-- address, social links, shipping copy, SEO defaults) all come from the
-- hardcoded STORE config in src/lib/config.ts instead. Dropping the dead
-- columns so the table (and the admin form) can't drift further from what
-- the app actually uses.
alter table public.store_settings
  drop column store_name,
  drop column logo_url,
  drop column contact_phone,
  drop column contact_email,
  drop column address_line,
  drop column instagram_url,
  drop column facebook_url,
  drop column twitter_url,
  drop column youtube_url,
  drop column shipping_info,
  drop column return_policy,
  drop column free_shipping_threshold,
  drop column seo_default_title,
  drop column seo_default_description;

-- store-assets bucket only ever held the admin-uploaded store logo, which
-- this migration's app-layer change removes in favor of the fixed Enzo
-- Sports logo assets already bundled in the app.
drop policy if exists "storage_store_assets_public_read" on storage.objects;
drop policy if exists "storage_store_assets_admin_insert" on storage.objects;
drop policy if exists "storage_store_assets_admin_update" on storage.objects;
drop policy if exists "storage_store_assets_admin_delete" on storage.objects;
delete from storage.objects where bucket_id = 'store-assets';
delete from storage.buckets where id = 'store-assets';
