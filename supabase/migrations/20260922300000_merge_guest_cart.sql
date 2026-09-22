-- Atomic guest → authenticated cart merge. PostgREST has no client-side
-- multi-statement transaction, so this RPC is what makes "all valid guest
-- lines land, or none of them do" actually hold — a thrown error rolls the
-- whole merge back and the client keeps localStorage.
--
-- Identity: (product_id, variant_id) when a variant is present; otherwise
-- the existing (product_id, size, color) identity. Guest-supplied price is
-- never read. Size/color for a variant line are taken from product_variants,
-- not from the client payload.

create or replace function public.merge_guest_cart(p_items jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_line jsonb;
  v_product_id uuid;
  v_variant_id uuid;
  v_quantity integer;
  v_size text;
  v_color text;
  v_existing_id uuid;
  v_existing_qty integer;
  v_variant public.product_variants%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated.' using errcode = '42501';
  end if;

  -- Serialize concurrent merges for this user so two in-flight calls cannot
  -- each add the same guest quantities.
  perform pg_advisory_xact_lock(791351, hashtext('cart-merge:' || v_user_id::text));

  select id into v_cart_id from public.carts where user_id = v_user_id;
  if v_cart_id is null then
    insert into public.carts (user_id) values (v_user_id) returning id into v_cart_id;
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return;
  end if;

  for v_line in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := null;
    v_variant_id := null;
    v_quantity := 0;
    v_size := null;
    v_color := null;
    v_existing_id := null;
    v_existing_qty := null;
    v_variant := null;

    begin
      v_product_id := nullif(trim(coalesce(v_line ->> 'product_id', '')), '')::uuid;
    exception when invalid_text_representation then
      continue;
    end;
    if v_product_id is null then
      continue;
    end if;

    begin
      v_quantity := coalesce((v_line ->> 'quantity')::integer, 0);
    exception when invalid_text_representation then
      continue;
    end;
    if v_quantity < 1 then
      continue;
    end if;

    -- RLS hides inactive products from customers, which is the storefront
    -- availability rule — a missing row here means skip, not crash.
    if not exists (select 1 from public.products where id = v_product_id) then
      continue;
    end if;

    begin
      v_variant_id := nullif(trim(coalesce(v_line ->> 'variant_id', '')), '')::uuid;
    exception when invalid_text_representation then
      continue;
    end;

    if v_variant_id is not null then
      select * into v_variant from public.product_variants where id = v_variant_id;
      if not found or v_variant.product_id is distinct from v_product_id then
        continue;
      end if;
      v_size := v_variant.size;
      v_color := v_variant.color;

      select id, quantity into v_existing_id, v_existing_qty
      from public.cart_items
      where cart_id = v_cart_id
        and product_id = v_product_id
        and variant_id = v_variant_id
      order by created_at
      limit 1;
    else
      v_size := nullif(v_line ->> 'size', '');
      v_color := nullif(v_line ->> 'color', '');

      select id, quantity into v_existing_id, v_existing_qty
      from public.cart_items
      where cart_id = v_cart_id
        and product_id = v_product_id
        and variant_id is null
        and size is not distinct from v_size
        and color is not distinct from v_color
      order by created_at
      limit 1;
    end if;

    if v_existing_id is not null then
      update public.cart_items
      set quantity = v_existing_qty + v_quantity
      where id = v_existing_id;
    else
      insert into public.cart_items (cart_id, product_id, variant_id, quantity, size, color)
      values (v_cart_id, v_product_id, v_variant_id, v_quantity, v_size, v_color);
    end if;
  end loop;
end;
$$;

grant execute on function public.merge_guest_cart(jsonb) to authenticated;
