alter table public.vendors
 add column if not exists contact_name text,
 add column if not exists contact_phone text,
 add column if not exists whatsapp_number text,
 add column if not exists business_type text,
 add column if not exists opening_hours jsonb not null default '{}'::jsonb,
 add column if not exists accepts_preorders boolean not null default true,
 add column if not exists min_order_amount integer not null default 0,
 add column if not exists application_submitted_at timestamptz;
alter table public.vendors drop constraint if exists vendors_min_order_amount_check;
alter table public.vendors add constraint vendors_min_order_amount_check check (min_order_amount >= 0);
alter table public.products
 add column if not exists sku text,
 add column if not exists cost_price integer,
 add column if not exists track_inventory boolean not null default false,
 add column if not exists stock_quantity integer,
 add column if not exists low_stock_threshold integer not null default 5,
 add column if not exists stock_unit text not null default 'portion',
 add column if not exists prep_time_minutes integer not null default 15,
 add column if not exists dietary_tags text[] not null default '{}'::text[],
 add column if not exists allergens text[] not null default '{}'::text[],
 add column if not exists updated_at timestamptz not null default now();
alter table public.products drop constraint if exists products_cost_price_check;
alter table public.products add constraint products_cost_price_check check (cost_price is null or cost_price >= 0);
alter table public.products drop constraint if exists products_stock_quantity_check;
alter table public.products add constraint products_stock_quantity_check check (stock_quantity is null or stock_quantity >= 0);
alter table public.products drop constraint if exists products_low_stock_threshold_check;
alter table public.products add constraint products_low_stock_threshold_check check (low_stock_threshold >= 0);
alter table public.products drop constraint if exists products_prep_time_minutes_check;
alter table public.products add constraint products_prep_time_minutes_check check (prep_time_minutes between 1 and 240);
alter table public.products drop constraint if exists products_inventory_quantity_required;
alter table public.products add constraint products_inventory_quantity_required check (not track_inventory or stock_quantity is not null);
create unique index if not exists products_vendor_sku_unique on public.products(vendor_id,lower(sku)) where sku is not null and length(trim(sku))>0;
create index if not exists products_vendor_stock_idx on public.products(vendor_id,track_inventory,stock_quantity);
alter table public.orders add column if not exists pickup_code text, add column if not exists pickup_confirmed_at timestamptz, add column if not exists pickup_confirmed_by uuid references auth.users(id), add column if not exists stock_deducted_at timestamptz;
update public.orders set pickup_code=replace(gen_random_uuid()::text,'-','') where status in ('paid','preparing','ready') and pickup_code is null;
create unique index if not exists orders_pickup_code_unique on public.orders(pickup_code) where pickup_code is not null;
create index if not exists orders_vendor_created_idx on public.orders(vendor_id,created_at desc);
insert into public.vendor_staff(vendor_id,profile_id,role,is_active)
select v.id,v.owner_id,'owner',true from public.vendors v
where not exists(select 1 from public.vendor_staff vs where vs.vendor_id=v.id and vs.profile_id=v.owner_id);
create or replace function public.submit_vendor_application(p_name text,p_category text,p_description text,p_campus_id uuid,p_pickup_location text,p_contact_phone text,p_whatsapp_number text,p_business_type text,p_opening_hours jsonb,p_avg_prep_time_minutes integer)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_user_id uuid:=auth.uid(); v_vendor_id uuid; v_slug text;
begin
 if v_user_id is null then raise exception 'Please sign in before submitting a vendor application'; end if;
 if nullif(trim(p_name),'') is null or nullif(trim(p_category),'') is null then raise exception 'Store name and category are required'; end if;
 if p_campus_id is null or not exists(select 1 from public.campuses c where c.id=p_campus_id and c.is_active=true) then raise exception 'Choose an active campus'; end if;
 if not exists(select 1 from public.profiles p where p.id=v_user_id) then raise exception 'Your account profile is not ready. Please sign in again'; end if;
 if exists(select 1 from public.vendors v where v.owner_id=v_user_id) then raise exception 'A vendor profile already exists for this account'; end if;
 v_slug:=coalesce(nullif(trim(both '-' from regexp_replace(lower(trim(p_name)),'[^a-z0-9]+','-','g')),''),'vendor')||'-'||substr(replace(gen_random_uuid()::text,'-',''),1,7);
 insert into public.vendors(owner_id,campus_id,name,slug,description,category,is_open,is_approved,status,pickup_location,avg_prep_time_minutes,contact_name,contact_phone,whatsapp_number,business_type,opening_hours,accepts_preorders,application_submitted_at)
 select v_user_id,p_campus_id,trim(p_name),v_slug,nullif(trim(p_description),''),trim(p_category),false,false,'pending',nullif(trim(p_pickup_location),''),greatest(5,least(coalesce(p_avg_prep_time_minutes,15),120)),p.full_name,nullif(trim(p_contact_phone),''),nullif(trim(p_whatsapp_number),''),nullif(trim(p_business_type),''),case when jsonb_typeof(p_opening_hours)='object' then p_opening_hours else '{}'::jsonb end,true,now()
 from public.profiles p where p.id=v_user_id returning id into v_vendor_id;
 insert into public.vendor_staff(vendor_id,profile_id,role,is_active) values(v_vendor_id,v_user_id,'owner',true);
 return v_vendor_id;
end; $$;
revoke all on function public.submit_vendor_application(text,text,text,uuid,text,text,text,text,jsonb,integer) from public,anon;
grant execute on function public.submit_vendor_application(text,text,text,uuid,text,text,text,text,jsonb,integer) to authenticated;
create or replace function public.ensure_order_pickup_code() returns trigger language plpgsql set search_path=''
as $$ begin if new.status='paid' and old.status is distinct from 'paid' and new.pickup_code is null then new.pickup_code:=replace(gen_random_uuid()::text,'-',''); end if; return new; end; $$;
drop trigger if exists orders_ensure_pickup_code on public.orders;
create trigger orders_ensure_pickup_code before update of status on public.orders for each row execute function public.ensure_order_pickup_code();
revoke all on function public.ensure_order_pickup_code() from public,anon,authenticated;
create or replace function public.set_vendor_order_status(p_order_id uuid,p_status text) returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_order public.orders%rowtype; v_item record;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_status not in ('preparing','ready') then raise exception 'Unsupported order status'; end if;
 select o.* into v_order from public.orders o join public.vendor_staff vs on vs.vendor_id=o.vendor_id
 where o.id=p_order_id and vs.profile_id=auth.uid() and vs.is_active=true and vs.role in ('owner','manager','staff') for update of o;
 if not found then raise exception 'Order not found or you do not have access'; end if;
 if p_status='preparing' and v_order.status='paid' then
  if v_order.stock_deducted_at is null then
   for v_item in select oi.product_id,oi.quantity,p.name,p.track_inventory,p.stock_quantity from public.order_items oi join public.products p on p.id=oi.product_id where oi.order_id=v_order.id for update of p loop
    if v_item.track_inventory then
     if v_item.stock_quantity is null or v_item.stock_quantity<v_item.quantity then raise exception 'Not enough stock for %; update inventory before preparing this order',v_item.name; end if;
     update public.products set stock_quantity=stock_quantity-v_item.quantity,is_available=(stock_quantity-v_item.quantity)>0,updated_at=now() where id=v_item.product_id;
    end if;
   end loop;
  end if;
  update public.orders set status='preparing',stock_deducted_at=coalesce(stock_deducted_at,now()),updated_at=now() where id=v_order.id;
 elsif p_status='ready' and v_order.status='preparing' then
  update public.orders set status='ready',updated_at=now() where id=v_order.id;
 else raise exception 'This order cannot move from % to %',v_order.status,p_status;
 end if;
 return jsonb_build_object('order_id',v_order.id,'status',p_status);
end; $$;
revoke all on function public.set_vendor_order_status(uuid,text) from public,anon;
grant execute on function public.set_vendor_order_status(uuid,text) to authenticated;
create or replace function public.confirm_vendor_pickup(p_pickup_code text) returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_order public.orders%rowtype;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if nullif(trim(p_pickup_code),'') is null then raise exception 'Scan a valid Campus Pick-Up QR code'; end if;
 select o.* into v_order from public.orders o join public.vendor_staff vs on vs.vendor_id=o.vendor_id
 where o.pickup_code=trim(p_pickup_code) and vs.profile_id=auth.uid() and vs.is_active=true and vs.role in ('owner','manager','staff') for update of o;
 if not found then raise exception 'This QR code is invalid, expired or does not belong to your store'; end if;
 if v_order.status<>'ready' then raise exception 'This order is not ready for collection'; end if;
 update public.orders set status='picked_up',pickup_confirmed_at=now(),pickup_confirmed_by=auth.uid(),pickup_code=null,updated_at=now() where id=v_order.id;
 return jsonb_build_object('order_id',v_order.id,'status','picked_up','total_price',v_order.total_price,'confirmed_at',now());
end; $$;
revoke all on function public.confirm_vendor_pickup(text) from public,anon;
grant execute on function public.confirm_vendor_pickup(text) to authenticated;
drop policy if exists "Vendors can update status of their orders" on public.orders;
revoke update on table public.orders from public,anon,authenticated;
drop policy if exists "Vendors can manage own store" on public.vendors;
create policy "Vendors can manage own store" on public.vendors for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
drop policy if exists "Vendors can manage own products" on public.products;
create policy "Vendors can manage own products" on public.products for all to authenticated
using(exists(select 1 from public.vendors v where v.id=products.vendor_id and v.owner_id=(select auth.uid())))
with check(exists(select 1 from public.vendors v where v.id=products.vendor_id and v.owner_id=(select auth.uid())));
drop policy if exists "Vendors can manage own categories" on public.categories;
create policy "Vendors can manage own categories" on public.categories for all to authenticated
using(exists(select 1 from public.vendors v where v.id=categories.vendor_id and v.owner_id=(select auth.uid())))
with check(exists(select 1 from public.vendors v where v.id=categories.vendor_id and v.owner_id=(select auth.uid())));
