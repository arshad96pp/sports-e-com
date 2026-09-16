-- Store-level assets (logo, etc.) — same public-read / admin-write shape as
-- the other image buckets.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('store-assets', 'store-assets', true, 5242880, array['image/webp'])
on conflict (id) do nothing;

create policy "storage_store_assets_public_read" on storage.objects
  for select using (bucket_id = 'store-assets');

create policy "storage_store_assets_admin_insert" on storage.objects
  for insert with check (bucket_id = 'store-assets' and public.is_super_admin());

create policy "storage_store_assets_admin_update" on storage.objects
  for update using (bucket_id = 'store-assets' and public.is_super_admin());

create policy "storage_store_assets_admin_delete" on storage.objects
  for delete using (bucket_id = 'store-assets' and public.is_super_admin());
