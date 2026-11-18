alter table public.vendors drop constraint if exists vendors_status_check;
alter table public.vendors add constraint vendors_status_check
  check (status = any (array['pending','approved','suspended','rejected']::text[]));