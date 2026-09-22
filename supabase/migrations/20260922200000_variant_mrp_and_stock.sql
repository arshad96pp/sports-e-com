-- Extends size variants to be fully self-contained for ecommerce use: each
-- variant now carries its own MRP (for the discount display) and its own
-- stock (so "out of stock" is a per-size fact, not a whole-product one),
-- alongside the price_override added in 20260922180000. `stock` already
-- existed as a dormant column on this table; this just starts using it.

-- Backfill before tightening to NOT NULL: any variant created before this
-- migration (via the admin form shipped in 20260922180000) only ever had a
-- price, so its MRP defaults to matching its price (no discount shown,
-- consistent with how a variant with no MRP behaved until now) rather than
-- leaving a real row in a state the app can't produce going forward.
alter table public.product_variants add column mrp_override numeric(10, 2);
update public.product_variants set mrp_override = price_override where mrp_override is null;
alter table public.product_variants alter column mrp_override set not null;

alter table public.product_variants
  add constraint product_variants_mrp_positive check (mrp_override > 0),
  add constraint product_variants_stock_non_negative check (stock >= 0);

-- Admin-only RPC, extended to validate/write mrp_override and stock
-- alongside size/price. Recreated verbatim from 20260922180000 aside from
-- that.
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
  v_mrp numeric(10, 2);
  v_stock integer;
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
    v_mrp := (v_item ->> 'mrp')::numeric;
    v_stock := (v_item ->> 'stock')::integer;

    if v_size = '' then
      raise exception 'Every variant needs a size.' using errcode = 'P0001';
    end if;
    if v_price is null or v_price <= 0 or v_mrp is null or v_mrp <= 0 or v_stock is null then
      raise exception 'Please enter price, MRP and stock for %.', v_size using errcode = 'P0001';
    end if;
    if v_stock < 0 then
      raise exception 'Stock for % cannot be negative.', v_size using errcode = 'P0001';
    end if;
    if v_price > v_mrp then
      raise exception 'Price cannot be higher than MRP for %.', v_size using errcode = 'P0001';
    end if;

    -- An id that doesn't belong to this product (someone else's variant, or
    -- a stale/invalid one) is never updated in place — it silently falls
    -- through to the insert branch and gets a fresh row instead.
    if v_id is not null and exists (
      select 1 from public.product_variants where id = v_id and product_id = p_product_id
    ) then
      update public.product_variants
      set size = v_size, price_override = v_price, mrp_override = v_mrp, stock = v_stock
      where id = v_id;
    else
      insert into public.product_variants (product_id, size, price_override, mrp_override, stock, sku)
      values (
        p_product_id,
        v_size,
        v_price,
        v_mrp,
        v_stock,
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

-- create_order: resolve stock and MRP at the variant level too now (not
-- just price). A variant's own stock gates the purchase and is what gets
-- decremented; the product's own stock/sold_count still tracks aggregate
-- sales the same as before. Recreated verbatim from
-- 20260922190000_variant_order_discount_consistency.sql aside from the
-- variant stock/MRP handling.
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
      if v_variant.stock < v_quantity then
        raise exception '% (%) does not have enough stock.', v_product.name, v_variant.size using errcode = 'P0001';
      end if;

      v_line_price := v_variant.price_override;
      v_line_mrp := v_variant.mrp_override;
      v_line_size := v_variant.size;
      v_line_color := v_variant.color;
    else
      if v_product.stock < v_quantity then
        raise exception '% does not have enough stock.', v_product.name using errcode = 'P0001';
      end if;

      v_line_price := v_product.price;
      v_line_mrp := v_product.mrp;
      v_line_size := v_line ->> 'size';
      v_line_color := v_line ->> 'color';
    end if;

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

  -- Variant-level stock decrement for variant lines.
  update public.product_variants pv
  set stock = pv.stock - (item ->> 'quantity')::integer
  from jsonb_array_elements(v_resolved) as item
  where pv.id = (item ->> 'variant_id')::uuid
    and item ->> 'variant_id' is not null;

  -- Product-level stock only decrements for non-variant lines; sold_count
  -- always increments at the product level regardless, so aggregate sales
  -- figures stay correct either way.
  update public.products p
  set
    stock = case when item ->> 'variant_id' is null then p.stock - (item ->> 'quantity')::integer else p.stock end,
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
