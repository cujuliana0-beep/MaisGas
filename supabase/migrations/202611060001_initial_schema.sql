-- +Gás: initial Supabase schema
-- Apply in Supabase Dashboard > SQL Editor. Safe to re-run where practical.
-- Never put the service_role key in the browser.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('customer', 'driver');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.driver_approval_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.zone_availability as enum ('available', 'low', 'unavailable');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.order_status as enum ('created', 'searching', 'accepted', 'buying', 'on_the_way', 'delivered', 'cancelled', 'out_of_stock');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.payment_method as enum ('cash', 'multicaixa');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text unique,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  size integer not null check (size in (6, 12, 51)),
  name text not null,
  price integer not null check (price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.zones (
  id text primary key,
  province text not null,
  name text not null,
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  availability public.zone_availability not null default 'available',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (province, name)
);

create table if not exists public.drivers (
  id uuid primary key references public.profiles(id) on delete cascade,
  rating numeric(3,2) not null default 5 check (rating between 0 and 5),
  plate text,
  vehicle text,
  identity_number text,
  approval_status public.driver_approval_status not null default 'pending',
  rejection_reason text,
  online boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  street text not null,
  reference text not null default '',
  zone_id text not null references public.zones(id),
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  driver_id uuid references public.drivers(id),
  product_id text not null references public.products(id),
  quantity integer not null check (quantity between 1 and 2),
  zone_id text not null references public.zones(id),
  address_snapshot jsonb not null,
  gas_price integer not null check (gas_price >= 0),
  delivery_fee integer not null check (delivery_fee >= 0),
  total integer generated always as (gas_price * quantity + delivery_fee) stored,
  payment_method public.payment_method not null,
  status public.order_status not null default 'created',
  confirmation_code_hash text,
  rating integer check (rating between 1 and 5),
  comment text,
  safety_checklist jsonb,
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_reports (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  zone_id text not null references public.zones(id),
  location text not null default '',
  availability public.zone_availability not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index if not exists orders_driver_status_idx on public.orders(driver_id, status);
create index if not exists orders_zone_status_idx on public.orders(zone_id, status);
create index if not exists addresses_customer_idx on public.addresses(customer_id);
create index if not exists reports_zone_created_idx on public.availability_reports(zone_id, created_at desc);

-- New phone-auth users receive a customer profile by default.
-- Driver access must be granted by a trusted administrator, never by client metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.phone,
    'customer'
  )
  on conflict (id) do update set
    phone = excluded.phone,
    name = case when excluded.name <> '' then excluded.name else public.profiles.name end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of phone on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.zones enable row level security;
alter table public.drivers enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.availability_reports enable row level security;

-- Public catalogue data is readable; writes remain restricted to trusted operators.
drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products" on public.products for select using (active);
drop policy if exists "Anyone can read active zones" on public.zones;
create policy "Anyone can read active zones" on public.zones for select using (active);

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()) and role = 'customer');

drop policy if exists "Drivers read own driver record" on public.drivers;
create policy "Drivers read own driver record" on public.drivers for select to authenticated using (id = (select auth.uid()));
-- Driver profile writes are restricted for now. A trusted registration/review
-- workflow must create and approve driver records; clients cannot self-approve.

drop policy if exists "Customers manage own addresses" on public.addresses;
create policy "Customers manage own addresses" on public.addresses for all to authenticated
using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()));

drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders" on public.orders for select to authenticated
using (customer_id = (select auth.uid()));
drop policy if exists "Assigned drivers read orders" on public.orders;
create policy "Assigned drivers read orders" on public.orders for select to authenticated
using (driver_id = (select auth.uid()) and exists (
  select 1 from public.drivers d where d.id = (select auth.uid()) and d.approval_status = 'approved'
));
-- Order creation and state changes are intentionally not exposed as direct table writes.
-- Add secure RPCs for price calculation, atomic driver assignment and completion verification.

drop policy if exists "Drivers read own availability reports" on public.availability_reports;
create policy "Drivers read own availability reports" on public.availability_reports for select to authenticated
using (driver_id = (select auth.uid()));
drop policy if exists "Approved drivers submit availability reports" on public.availability_reports;
create policy "Approved drivers submit availability reports" on public.availability_reports for insert to authenticated
with check (
  driver_id = (select auth.uid()) and exists (
    select 1 from public.drivers d where d.id = (select auth.uid()) and d.approval_status = 'approved'
  )
);

-- Private bucket for delivery/driver documents. Keep object paths scoped by user UUID.
insert into storage.buckets (id, name, public)
values ('private-delivery-files', 'private-delivery-files', false)
on conflict (id) do nothing;

drop policy if exists "Users read own private files" on storage.objects;
create policy "Users read own private files" on storage.objects for select to authenticated
using (bucket_id = 'private-delivery-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users upload own private files" on storage.objects;
create policy "Users upload own private files" on storage.objects for insert to authenticated
with check (bucket_id = 'private-delivery-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Initial catalogue matching the current demo values. Replace with approved business prices before launch.
insert into public.products (id, size, name, price) values
  ('p6', 6, 'Botija compacta', 3000),
  ('p12', 12, 'A favorita de casa', 6000),
  ('p51', 51, 'Para grandes cozinhas', 25500)
on conflict (id) do nothing;

insert into public.zones (id, province, name, delivery_fee, availability) values
  ('lu-tal', 'Luanda', 'Talatona', 1200, 'available'),
  ('lu-mai', 'Luanda', 'Maianga', 1000, 'available'),
  ('lu-via', 'Luanda', 'Viana', 1500, 'low'),
  ('be-centro', 'Benguela', 'Centro de Benguela', 1200, 'available'),
  ('be-lob', 'Benguela', 'Lobito', 1400, 'low'),
  ('hu-centro', 'Huíla', 'Lubango', 1000, 'available'),
  ('ha-centro', 'Huambo', 'Cidade do Huambo', 1200, 'unavailable')
on conflict (id) do nothing;

-- Enable Realtime for order changes (safe if already added).
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
when undefined_object then null; end $$;
