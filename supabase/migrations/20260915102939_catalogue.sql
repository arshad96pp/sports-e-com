-- categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_name text not null,
  description text not null default '',
  listing_blurb text not null default '',
  image_url text,
  icon text not null default 'other',
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_is_active_idx on public.categories (is_active);
create index categories_slug_idx on public.categories (slug);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- subcategories
create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  name text not null,
  slug text not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

create index subcategories_category_id_idx on public.subcategories (category_id);

create trigger subcategories_set_updated_at
  before update on public.subcategories
  for each row execute function public.set_updated_at();

-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  short_description text not null default '',
  sku text not null unique,
  category_id uuid not null references public.categories (id) on delete restrict,
  subcategory_id uuid references public.subcategories (id) on delete set null,
  brand text not null,
  sport text not null,
  product_type text not null,
  price numeric(10, 2) not null,
  mrp numeric(10, 2) not null,
  stock integer not null default 0,
  rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  sold_count integer not null default 0,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  highlights text[] not null default '{}',
  specifications jsonb not null default '[]',
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_new_arrival boolean not null default false,
  is_deal_of_the_day boolean not null default false,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_subcategory_id_idx on public.products (subcategory_id);
create index products_is_active_idx on public.products (is_active);
create index products_is_featured_idx on public.products (is_featured);
create index products_is_best_seller_idx on public.products (is_best_seller);
create index products_brand_idx on public.products (brand);
create index products_slug_idx on public.products (slug);
create index products_sku_idx on public.products (sku);
create index products_created_at_idx on public.products (created_at);
create index products_name_trgm_idx on public.products using gin (name extensions.gin_trgm_ops);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- product_images
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id);

-- product_variants
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text,
  color text,
  sku text not null unique,
  stock integer not null default 0,
  price_override numeric(10, 2),
  created_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create index product_variants_product_id_idx on public.product_variants (product_id);

-- reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text not null default '',
  comment text not null default '',
  is_verified boolean not null default false,
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index reviews_product_id_idx on public.reviews (product_id);
create index reviews_user_id_idx on public.reviews (user_id);
create index reviews_is_approved_idx on public.reviews (is_approved);
