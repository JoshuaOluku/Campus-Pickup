-- Campus Pick-Up: richer customer signup metadata and safe pending-payment orders.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status = any (array['pending_payment','pending','paid','preparing','ready','picked_up','cancelled']::text[]));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, phone, full_name, role, is_onboarded)
  values (
    new.id, new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'customer', false
  )
  on conflict (id) do update
    set email = excluded.email,
        phone = coalesce(public.profiles.phone, excluded.phone),
        full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.create_order(
  p_vendor_id uuid, p_campus_id uuid, p_pickup_slot text, p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_total_price bigint := 0;
  v_item jsonb;
  v_product_price integer;
  v_quantity integer;
  v_product_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty';
  end if;
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.campus_id = p_campus_id) then
    raise exception 'Selected campus does not match your profile';
  end if;
  if not exists (
    select 1 from public.vendors v
    where v.id = p_vendor_id and v.campus_id = p_campus_id
      and v.status = 'approved' and v.is_approved = true and v.is_open = true
  ) then raise exception 'This vendor is not available for ordering'; end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity is null or v_quantity < 1 or v_quantity > 50 then raise exception 'Invalid item quantity'; end if;
    select pr.price into v_product_price from public.products pr
      where pr.id = v_product_id and pr.vendor_id = p_vendor_id and pr.is_available = true;
    if v_product_price is null then raise exception 'Product is unavailable'; end if;
    v_total_price := v_total_price + (v_product_price::bigint * v_quantity);
  end loop;
  if v_total_price > 2147483647 then raise exception 'Order total is too large'; end if;

  insert into public.orders (customer_id, vendor_id, campus_id, total_price, pickup_slot, status, payment_reference, pickup_token)
  values (auth.uid(), p_vendor_id, p_campus_id, v_total_price::integer, p_pickup_slot, 'pending_payment', null, null)
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;
    select pr.price into v_product_price from public.products pr where pr.id = v_product_id and pr.vendor_id = p_vendor_id;
    insert into public.order_items (order_id, product_id, quantity, unit_price)
    values (v_order_id, v_product_id, v_quantity, v_product_price);
  end loop;
  return jsonb_build_object('order_id', v_order_id, 'total_price', v_total_price, 'status', 'pending_payment');
end;
$$;
revoke all on function public.create_order(uuid, uuid, text, jsonb) from public, anon;
grant execute on function public.create_order(uuid, uuid, text, jsonb) to authenticated;

create or replace function public.is_admin(user_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select auth.uid() is not null and user_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;
revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated;
