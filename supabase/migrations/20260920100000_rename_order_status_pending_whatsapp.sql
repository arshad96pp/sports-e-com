-- Renames the "placed" order status to "pending_whatsapp" to make explicit that
-- clicking "Continue to WhatsApp" only creates the order record and opens a
-- prefilled WhatsApp chat — the store has not actually confirmed anything yet.
-- Admin must manually flip the order to "confirmed" (or "cancelled") after
-- verifying the WhatsApp conversation. Renaming an enum label is an in-place
-- metadata change: existing rows keep pointing at the same enum value under
-- its new name, so no data backfill is needed.
alter type public.order_status rename value 'placed' to 'pending_whatsapp';

-- create_order() has two hardcoded 'placed' literals (the inserted row's status
-- and the status echoed back in the returned jsonb) that must be updated to
-- match the renamed label — the enum rename alone does not touch literals
-- embedded in a function body. Recreated here verbatim aside from that change.
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
  v_subtotal numeric(10, 2) := 0;
  v_mrp_total numeric(10, 2) := 0;
  v_discount numeric(10, 2) := 0;
  v_total numeric(10, 2) := 0;
  v_order_id uuid;
  v_order_number text;
  v_resolved jsonb := '[]'::jsonb;
  v_line_price numeric(10, 2);
  v_line_mrp numeric(10, 2);
  v_quantity integer;
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

    v_line_price := v_product.price;
    v_line_mrp := v_product.mrp;
    v_subtotal := v_subtotal + v_line_price * v_quantity;
    v_mrp_total := v_mrp_total + v_line_mrp * v_quantity;

    v_resolved := v_resolved || jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'product_sku', v_product.sku,
      'quantity', v_quantity,
      'price', v_line_price,
      'size', v_line ->> 'size',
      'color', v_line ->> 'color'
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
    v_order_number, v_user_id, 'pending_whatsapp', v_subtotal, v_discount, v_total,
    p_address_id,
    p_address ->> 'fullName', p_address ->> 'phone', p_address ->> 'line1',
    p_address ->> 'city', p_address ->> 'state', p_address ->> 'pincode', now()
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, product_sku, quantity, price, size, color)
  select
    v_order_id,
    (item ->> 'product_id')::uuid,
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
    'status', 'pending_whatsapp',
    'items', v_resolved
  );
end;
$$;
