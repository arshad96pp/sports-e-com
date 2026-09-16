-- Enable RLS everywhere.
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.reviews enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.offers enable row level security;
alter table public.offer_products enable row level security;
alter table public.offer_categories enable row level security;
alter table public.hero_banners enable row level security;
alter table public.store_settings enable row level security;

-- profiles: own row, or full access for super admins (customer management).
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_super_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_super_admin());

-- addresses: strictly owner-only.
create policy "addresses_all_own" on public.addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- categories / subcategories: public reads active rows, admin manages everything.
create policy "categories_select_public" on public.categories
  for select using (is_active or public.is_super_admin());
create policy "categories_admin_write" on public.categories
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "subcategories_select_public" on public.subcategories
  for select using (is_active or public.is_super_admin());
create policy "subcategories_admin_write" on public.subcategories
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- products: public reads active rows, admin manages everything.
create policy "products_select_public" on public.products
  for select using (is_active or public.is_super_admin());
create policy "products_admin_write" on public.products
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "product_images_select_all" on public.product_images
  for select using (true);
create policy "product_images_admin_write" on public.product_images
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "product_variants_select_all" on public.product_variants
  for select using (true);
create policy "product_variants_admin_write" on public.product_variants
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- reviews: public reads approved reviews; signed-in users can write their own;
-- admins moderate everything.
create policy "reviews_select_approved_or_own_or_admin" on public.reviews
  for select using (is_approved or user_id = auth.uid() or public.is_super_admin());
create policy "reviews_insert_own" on public.reviews
  for insert with check (user_id = auth.uid());
create policy "reviews_update_own_or_admin" on public.reviews
  for update using (user_id = auth.uid() or public.is_super_admin());
create policy "reviews_delete_own_or_admin" on public.reviews
  for delete using (user_id = auth.uid() or public.is_super_admin());

-- carts / cart_items: owner-only, via the parent cart's user_id.
create policy "carts_all_own" on public.carts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "cart_items_all_own" on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );

-- wishlists / wishlist_items: owner-only.
create policy "wishlists_all_own" on public.wishlists
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "wishlist_items_all_own" on public.wishlist_items
  for all using (
    exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
  );

-- orders / order_items: owner can read their own; admin can read + update status.
-- Inserts happen exclusively through the SECURITY DEFINER create_order() function,
-- which runs as the table owner and so is unaffected by (and doesn't need) an
-- insert policy here — deliberately no insert policy exists for anon/authenticated.
create policy "orders_select_own_or_admin" on public.orders
  for select using (user_id = auth.uid() or public.is_super_admin());
create policy "orders_update_admin" on public.orders
  for update using (public.is_super_admin());

create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_super_admin())
    )
  );

-- offers / join tables: public reads active offers, admin manages everything.
create policy "offers_select_public" on public.offers
  for select using (is_active or public.is_super_admin());
create policy "offers_admin_write" on public.offers
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "offer_products_select_all" on public.offer_products
  for select using (true);
create policy "offer_products_admin_write" on public.offer_products
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "offer_categories_select_all" on public.offer_categories
  for select using (true);
create policy "offer_categories_admin_write" on public.offer_categories
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- hero_banners: public reads active rows, admin manages everything.
create policy "hero_banners_select_public" on public.hero_banners
  for select using (is_active or public.is_super_admin());
create policy "hero_banners_admin_write" on public.hero_banners
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- store_settings: public read (no secrets in it), admin-only write.
create policy "store_settings_select_public" on public.store_settings
  for select using (true);
create policy "store_settings_admin_write" on public.store_settings
  for insert with check (public.is_super_admin());
create policy "store_settings_admin_update" on public.store_settings
  for update using (public.is_super_admin());
