-- Storage buckets for admin-managed imagery. Public read (product photos, category
-- art, banners are all meant to be publicly visible), writes restricted to super admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/webp']),
  ('category-images', 'category-images', true, 5242880, array['image/webp']),
  ('banner-images', 'banner-images', true, 5242880, array['image/webp'])
on conflict (id) do nothing;

create policy "storage_public_read" on storage.objects
  for select using (bucket_id in ('product-images', 'category-images', 'banner-images'));

create policy "storage_admin_insert" on storage.objects
  for insert with check (
    bucket_id in ('product-images', 'category-images', 'banner-images')
    and public.is_super_admin()
  );

create policy "storage_admin_update" on storage.objects
  for update using (
    bucket_id in ('product-images', 'category-images', 'banner-images')
    and public.is_super_admin()
  );

create policy "storage_admin_delete" on storage.objects
  for delete using (
    bucket_id in ('product-images', 'category-images', 'banner-images')
    and public.is_super_admin()
  );
