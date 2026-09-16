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
