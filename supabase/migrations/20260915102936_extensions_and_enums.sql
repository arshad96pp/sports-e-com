-- Extensions
create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "pg_trgm" with schema extensions;

-- Enums
create type public.user_role as enum ('customer', 'super_admin');

create type public.order_status as enum (
  'placed',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- Shared updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
