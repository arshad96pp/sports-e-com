-- Reinstates order persistence, previously dropped in
-- 20260915124159_remove_order_system.sql on the assumption that WhatsApp-only
-- ordering never needed a database record. It does now: admin needs a real
-- Order Management view and customers need their own order history, so
-- "placing an order" has to write a row, not just open a WhatsApp chat.
-- This restores the schema/RPC/RLS from before that drop, unchanged.

create type public.order_status as enum (
  'placed',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  status public.order_status not null default 'placed',

  subtotal numeric(10, 2) not null,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,

  address_id uuid references public.addresses (id) on delete set null,
  address_full_name text not null,
  address_phone text not null,
  address_line1 text not null,
  address_city text not null,
  address_state text not null,
  address_pincode text not null,

  whatsapp_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- order_items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_sku text not null,
  quantity integer not null,
  price numeric(10, 2) not null,
  size text,
  color text
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- Generates a human-friendly, reasonably-unique order number, e.g. ORD-250916-000123.
create or replace function public.generate_order_number()
returns text
language sql
as $$
  select 'ORD-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random() * 1000000))::text, 6, '0');
$$;

-- Creates an order server-side: validates every line's product/stock, recomputes
-- price/subtotal/discount/total from the CURRENT database prices (never trusts
-- client-supplied prices), inserts the order + order_items, and decrements stock —
-- all atomically. Runs as SECURITY DEFINER so it can read/update products and
-- write orders regardless of the caller's RLS grants, but user_id is always taken
-- from auth.uid() (never from the input), so a caller can only ever place an
-- order under their own account (or anonymously, if not signed in). There is
-- deliberately no separate insert policy on orders/order_items — this function
-- is the only write path.
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
    v_order_number, v_user_id, 'placed', v_subtotal, v_discount, v_total,
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
    'status', 'placed',
    'items', v_resolved
  );
end;
$$;

grant execute on function public.create_order(jsonb, uuid, jsonb) to anon, authenticated;

-- Admin updates order status through this narrow RPC instead of a raw update
-- policy, so the set of valid transitions stays enforced in one place.
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

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- orders / order_items: owner can read their own; admin can read all.
-- Inserts happen exclusively through the SECURITY DEFINER create_order()
-- function; updates exclusively through update_order_status() — deliberately
-- no insert/update policy exists for anon/authenticated.
create policy "orders_select_own_or_admin" on public.orders
  for select using (user_id = auth.uid() or public.is_super_admin());

create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_super_admin())
    )
  );
