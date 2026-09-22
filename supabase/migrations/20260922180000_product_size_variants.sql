-- Wires up the previously-dormant `product_variants` table as real,
-- purchasable size variants: each variant carries its own price, independent
-- of the parent product's own price. `products.price`/`mrp`/`stock` are left
-- exactly as they are today — they remain the base price for products
-- without variants, and a "from" price for variant products is computed in
-- application code (the cheapest variant), not stored redundantly here.
--
-- The variant identity this feature creates is always (product_id, size).
-- `color` already existed on this table (unused, reserved for a possible
-- future feature) and is left alone — this migration's own writes always
-- leave it null.

-- Every variant this feature creates always has both a size and a price, so
-- tighten both to NOT NULL. Safe: this table has never held app-written data
-- (it's been dormant since it was first created), so there are no existing
-- rows to violate the new constraints.
alter table public.product_variants
  alter column size set not null,
  alter column price_override set not null;

alter table public.product_variants
  add constraint product_variants_size_not_blank check (length(trim(size)) > 0),
  add constraint product_variants_price_positive check (price_override > 0);

alter table public.product_variants add column updated_at timestamptz not null default now();

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- The original `unique (product_id, size, color)` constraint is NULL-unsafe
-- (Postgres never treats two NULLs as equal for uniqueness), so two
-- size-only variants — color is always null for this feature — could both
-- get color = NULL without ever colliding on a duplicate size. Coalescing to
-- '' makes NULL behave like any other value for uniqueness purposes, which
-- is what "product_id + size must be unique" actually requires here.
alter table public.product_variants drop constraint product_variants_product_id_size_color_key;
create unique index product_variants_product_size_color_idx
  on public.product_variants (product_id, coalesce(size, ''), coalesce(color, ''));

-- cart_items: a cart line can now pin down a specific variant. A deleted
-- variant means that purchasable option no longer exists, so cascade —
-- consistent with this table's existing `product_id on delete cascade`.
alter table public.cart_items
  add column variant_id uuid references public.product_variants (id) on delete cascade;

create index cart_items_variant_id_idx on public.cart_items (variant_id);

alter table public.cart_items drop constraint cart_items_cart_id_product_id_size_color_key;
alter table public.cart_items
  add constraint cart_items_cart_id_product_id_variant_size_color_key
  unique (cart_id, product_id, variant_id, size, color);

-- order_items: snapshot which variant was purchased. `on delete set null`
-- (not cascade) since the order row already snapshots product_name/sku/
-- price/size and must survive the variant being edited or removed later —
-- same pattern as this table's existing `product_id on delete set null`.
alter table public.order_items
  add column variant_id uuid references public.product_variants (id) on delete set null;

create index order_items_variant_id_idx on public.order_items (variant_id);

-- Extend create_order to price/validate at the variant level when a line
-- specifies one, falling back to today's product-level behavior otherwise.
-- Never trusts a client-sent price — the variant's price_override (or the
-- product's own price) is looked up fresh, `for update`, inside the same
-- transaction. Category-offer discounts still apply on top of whichever
-- base price was resolved, exactly as before. Recreated verbatim from
-- 20260921120000_apply_offer_discount_on_order.sql aside from the variant
-- handling.
create or replace function public.create_order(
  p_address jsonb,
  p_address_id uuid,
  p_lines jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_line jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_variant_id uuid;
  v_subtotal numeric(10, 2) := 0;
  v_mrp_total numeric(10, 2) := 0;
  v_discount numeric(10, 2) := 0;
  v_total numeric(10, 2) := 0;
  v_order_id uuid;
  v_order_number text;
  v_resolved jsonb := '[]'::jsonb;
  v_line_price numeric(10, 2);
  v_line_mrp numeric(10, 2);
  v_line_size text;
  v_line_color text;
  v_quantity integer;
  v_offer_pct integer := 0;
begin
  if v_user_id is not null and exists (
    select 1 from public.profiles where id = v_user_id and role = 'super_admin'
  ) then
    raise exception 'Admin accounts cannot place customer orders.' using errcode = 'P0001';
  end if;

  if p_lines is null or jsonb_array_length(p_lines) = 0 then
    raise exception 'Cannot place an order with no items.' using errcode = 'P0001';
  end if;

  -- Validate every line and accumulate totals before writing anything.
  for v_line in select * from jsonb_array_elements(p_lines)
  loop
    select * into v_product
    from public.products
    where id = (v_line ->> 'product_id')::uuid and is_active
    for update;

    if not found then
      raise exception 'Product % is not available.', (v_line ->> 'product_id') using errcode = 'P0001';
    end if;

    v_quantity := coalesce((v_line ->> 'quantity')::integer, 0);
    if v_quantity <= 0 then
      raise exception '% has an invalid quantity.', v_product.name using errcode = 'P0001';
    end if;
    if v_product.stock < v_quantity then
      raise exception '% does not have enough stock.', v_product.name using errcode = 'P0001';
    end if;

    -- A variant_id is only ever trusted once it's confirmed to belong to
    -- this same product — this is what stops a client from submitting
    -- another product's variant_id to buy it at the wrong price.
    v_variant_id := nullif(v_line ->> 'variant_id', '')::uuid;
    v_variant := null;

    if v_variant_id is not null then
      select * into v_variant
      from public.product_variants
      where id = v_variant_id and product_id = v_product.id
      for update;

      if not found then
        raise exception '% variant is no longer available.', v_product.name using errcode = 'P0001';
      end if;

      v_line_price := v_variant.price_override;
      v_line_size := v_variant.size;
      v_line_color := v_variant.color;
    else
      v_line_price := v_product.price;
      v_line_size := v_line ->> 'size';
      v_line_color := v_line ->> 'color';
    end if;
    v_line_mrp := v_product.mrp;

    v_offer_pct := public.best_active_offer_percent(v_product.id);
    if v_offer_pct >= 100 then
      v_line_price := 0;
    elsif v_offer_pct > 0 then
      v_line_price := round(v_line_price * (100 - v_offer_pct) / 100.0, 2);
    end if;

    v_subtotal := v_subtotal + v_line_price * v_quantity;
    v_mrp_total := v_mrp_total + v_line_mrp * v_quantity;

    v_resolved := v_resolved || jsonb_build_object(
      'product_id', v_product.id,
      'variant_id', v_variant_id,
      'product_name', v_product.name,
      'product_sku', v_product.sku,
      'quantity', v_quantity,
      'price', v_line_price,
      'size', v_line_size,
      'color', v_line_color
    );
  end loop;

  v_discount := greatest(0, v_mrp_total - v_subtotal);
  v_total := v_subtotal;
  v_order_number := public.generate_order_number();

  insert into public.orders (
    order_number, user_id, status, subtotal, discount, total,
    address_id, address_full_name, address_phone, address_line1,
    address_city, address_state, address_pincode, whatsapp_sent_at
  ) values (
    v_order_number, v_user_id, 'pending', v_subtotal, v_discount, v_total,
    p_address_id,
    p_address ->> 'fullName', p_address ->> 'phone', p_address ->> 'line1',
    p_address ->> 'city', p_address ->> 'state', p_address ->> 'pincode', now()
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, variant_id, product_name, product_sku, quantity, price, size, color)
  select
    v_order_id,
    (item ->> 'product_id')::uuid,
    nullif(item ->> 'variant_id', '')::uuid,
    item ->> 'product_name',
    item ->> 'product_sku',
    (item ->> 'quantity')::integer,
    (item ->> 'price')::numeric,
    item ->> 'size',
    item ->> 'color'
  from jsonb_array_elements(v_resolved) as item;

  update public.products p
  set
    stock = p.stock - (item ->> 'quantity')::integer,
    sold_count = p.sold_count + (item ->> 'quantity')::integer
  from jsonb_array_elements(v_resolved) as item
  where p.id = (item ->> 'product_id')::uuid;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'total', v_total,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'status', 'pending',
    'items', v_resolved
  );
end;
$$;

grant execute on function public.create_order(jsonb, uuid, jsonb) to anon, authenticated;

-- Admin-only RPC: writes a product's variant rows as a single atomic
-- statement (insert new / update changed / delete removed-by-omission), so
-- an admin save of product + variants never ends up partially applied.
-- Mirrors the update_order_status() pattern elsewhere in this schema:
-- SECURITY DEFINER plus an explicit is_super_admin() check inside, since
-- PostgREST/supabase-js has no client-side multi-statement transaction API.
-- Only ever touches color-null rows, so it never disturbs a hypothetical
-- color-bearing variant row this feature doesn't manage.
create or replace function public.sync_product_variants(p_product_id uuid, p_variants jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_sku text;
  v_item jsonb;
  v_kept_ids uuid[] := '{}';
  v_id uuid;
  v_size text;
  v_price numeric(10, 2);
begin
  if not public.is_super_admin() then
    raise exception 'Only admins can manage product variants.' using errcode = '42501';
  end if;

  select sku into v_product_sku from public.products where id = p_product_id;
  if v_product_sku is null then
    raise exception 'Product % does not exist.', p_product_id using errcode = 'P0001';
  end if;

  for v_item in select * from jsonb_array_elements(coalesce(p_variants, '[]'::jsonb))
  loop
    v_id := nullif(v_item ->> 'id', '')::uuid;
    v_size := trim(coalesce(v_item ->> 'size', ''));
    v_price := (v_item ->> 'price')::numeric;

    if v_size = '' then
      raise exception 'Every variant needs a size.' using errcode = 'P0001';
    end if;
    if v_price is null or v_price <= 0 then
      raise exception '% needs a price greater than 0.', v_size using errcode = 'P0001';
    end if;

    -- An id that doesn't belong to this product (someone else's variant, or
    -- a stale/invalid one) is never updated in place — it silently falls
    -- through to the insert branch and gets a fresh row instead.
    if v_id is not null and exists (
      select 1 from public.product_variants where id = v_id and product_id = p_product_id
    ) then
      update public.product_variants set size = v_size, price_override = v_price where id = v_id;
    else
      insert into public.product_variants (product_id, size, price_override, sku)
      values (
        p_product_id,
        v_size,
        v_price,
        v_product_sku || '-' || upper(regexp_replace(v_size, '[^a-zA-Z0-9]+', '-', 'g'))
      )
      returning id into v_id;
    end if;

    v_kept_ids := v_kept_ids || v_id;
  end loop;

  delete from public.product_variants
  where product_id = p_product_id
    and color is null
    and not (id = any(v_kept_ids));
end;
$$;

grant execute on function public.sync_product_variants(uuid, jsonb) to authenticated;
