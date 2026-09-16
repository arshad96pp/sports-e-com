-- offers
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  discount_percent integer not null check (discount_percent between 0 and 100),
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index offers_is_active_idx on public.offers (is_active);

create trigger offers_set_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

-- offer_products (many-to-many)
create table public.offer_products (
  offer_id uuid not null references public.offers (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  primary key (offer_id, product_id)
);

create index offer_products_product_id_idx on public.offer_products (product_id);

-- offer_categories (many-to-many)
create table public.offer_categories (
  offer_id uuid not null references public.offers (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (offer_id, category_id)
);

create index offer_categories_category_id_idx on public.offer_categories (category_id);

-- hero_banners
create table public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default '',
  title text not null,
  subtitle text not null default '',
  cta_label text not null default 'Shop Now',
  cta_href text not null,
  image_url_desktop text not null,
  image_url_mobile text not null,
  category_id uuid references public.categories (id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index hero_banners_is_active_idx on public.hero_banners (is_active);
create index hero_banners_sort_order_idx on public.hero_banners (sort_order);

create trigger hero_banners_set_updated_at
  before update on public.hero_banners
  for each row execute function public.set_updated_at();

-- store_settings (single row)
create table public.store_settings (
  id text primary key default 'singleton',
  store_name text not null default 'STRYDE',
  logo_url text,
  whatsapp_number text not null,
  contact_phone text not null,
  contact_email text not null,
  address_line text not null,
  instagram_url text,
  facebook_url text,
  twitter_url text,
  youtube_url text,
  shipping_info text not null default '',
  return_policy text not null default '',
  free_shipping_threshold numeric(10, 2) not null default 999,
  seo_default_title text not null default '',
  seo_default_description text not null default '',
  updated_at timestamptz not null default now(),
  constraint store_settings_singleton check (id = 'singleton')
);

create trigger store_settings_set_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();
