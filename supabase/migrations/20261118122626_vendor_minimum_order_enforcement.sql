create or replace function public.enforce_vendor_minimum_order()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_minimum integer;
begin
  select min_order_amount into v_minimum
  from public.vendors
  where id = new.vendor_id and status = 'approved' and is_approved = true;

  if v_minimum is not null and new.total_price < v_minimum then
    raise exception 'This vendor requires a minimum order of % kobo', v_minimum;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_enforce_vendor_minimum on public.orders;
create trigger orders_enforce_vendor_minimum
before insert on public.orders
for each row execute function public.enforce_vendor_minimum_order();

revoke all on function public.enforce_vendor_minimum_order() from public, anon, authenticated;