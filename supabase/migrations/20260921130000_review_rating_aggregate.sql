-- products.rating / products.review_count are read by every product listing,
-- sort ("sort by rating"), and the "minimum rating" filter (see
-- product.repository.ts), but nothing ever wrote to them after a review was
-- added, approved/unapproved, or deleted — a brand new product with a fresh
-- 5-star review still showed "0.0 (0)" everywhere. This recomputes both
-- columns from the `reviews` table (approved reviews only, matching what
-- getReviewsForProduct actually shows publicly) after any change.
create or replace function public.refresh_product_rating(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products p
  set
    rating = coalesce(
      (select round(avg(r.rating)::numeric, 1) from public.reviews r where r.product_id = p_product_id and r.is_approved),
      0
    ),
    review_count = coalesce(
      (select count(*) from public.reviews r where r.product_id = p_product_id and r.is_approved),
      0
    )
  where p.id = p_product_id;
end;
$$;

create or replace function public.reviews_refresh_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_product_rating(old.product_id);
    return old;
  end if;

  perform public.refresh_product_rating(new.product_id);
  if tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
    perform public.refresh_product_rating(old.product_id);
  end if;
  return new;
end;
$$;

create trigger reviews_after_change_refresh_rating
  after insert or update of rating, is_approved, product_id or delete on public.reviews
  for each row execute function public.reviews_refresh_product_rating();

-- Backfill existing rows (local dev / any environment that already has reviews).
do $$
declare
  v_product_id uuid;
begin
  for v_product_id in select distinct product_id from public.reviews loop
    perform public.refresh_product_rating(v_product_id);
  end loop;
end;
$$;
