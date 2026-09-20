-- Collapses the order status lifecycle down to the 4 statuses the admin panel
-- actually needs: pending, confirmed, shipped, cancelled. The enum previously
-- carried placed(/pending_whatsapp)/confirmed/processing/shipped/delivered/cancelled —
-- more granularity than any UI surfaced. Both 'placed' and 'pending_whatsapp'
-- are mapped below since the 20260920100000 rename may or may not have been
-- applied to a given database yet — this migration is self-sufficient either
-- way. Postgres has no `ALTER TYPE ... DROP VALUE`, so this rebuilds the enum
-- and remaps existing rows rather than deleting them:
--   placed / pending_whatsapp -> pending    (order placed, awaiting admin confirmation)
--   processing                -> confirmed  (admin already confirmed, preparing the order)
--   delivered                 -> shipped    (no post-shipment status remains; shipped is terminal)
--   confirmed, shipped, cancelled -> unchanged

alter type public.order_status rename to order_status_old;

create type public.order_status as enum ('pending', 'confirmed', 'shipped', 'cancelled');

alter table public.orders alter column status drop default;

alter table public.orders
  alter column status type public.order_status
  using (
    case status::text
      when 'placed' then 'pending'
      when 'pending_whatsapp' then 'pending'
      when 'processing' then 'confirmed'
      when 'delivered' then 'shipped'
      else status::text
    end
  )::public.order_status;

alter table public.orders alter column status set default 'pending';

-- update_order_status() takes p_status public.order_status_old by OID after the
-- rename above, so it must be dropped and recreated against the new type —
-- CREATE OR REPLACE cannot change a parameter type, only its body.
drop function public.update_order_status(uuid, public.order_status_old);

create or replace function public.update_order_status(p_order_id uuid, p_status public.order_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Only admins can update order status.' using errcode = '42501';
  end if;
  update public.orders set status = p_status where id = p_order_id;
end;
$$;

grant execute on function public.update_order_status(uuid, public.order_status) to authenticated;

drop type public.order_status_old;

-- create_order() has two hardcoded 'pending_whatsapp' literals (the inserted
-- row's status and the status echoed back in the returned jsonb) that must be
-- updated to match the new enum. Recreated here verbatim aside from that change.
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
    v_order_number, v_user_id, 'pending', v_subtotal, v_discount, v_total,
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
    'status', 'pending',
    'items', v_resolved
  );
end;
$$;
