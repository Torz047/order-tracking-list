-- ============================================================
--  Alliance Order Tracker — Supabase Schema
--  Paste this into: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ACCOUNTS table
create table if not exists accounts (
  id          uuid primary key default gen_random_uuid(),
  username    text unique not null,
  password    text not null,          -- plain text for demo; use auth in production
  role        text not null check (role in ('Admin','Planner','Logistics','Inventory')),
  created_at  timestamptz default now()
);

-- Seed default accounts
insert into accounts (username, password, role) values
  ('admin',      'admin123', 'Admin'),
  ('planner1',   'plan123',  'Planner'),
  ('logistics1', 'logi123',  'Logistics'),
  ('inventory1', 'inv123',   'Inventory')
on conflict (username) do nothing;

-- ORDERS table
create table if not exists orders (
  id                   uuid primary key default gen_random_uuid(),
  apo                  text not null,
  cpo                  text not null,
  prd                  date,
  prs                  text,
  qty                  integer,
  type                 text check (type in ('New','Repeat','Return')),
  classification       text check (classification in ('Pin','Assy','Rework','Jig','Device','Part')),
  part_number          text,
  drawing_number       text,
  revision             text,
  parts_issuance_date  date,
  parts_eta            date,
  cpo_rdd              date,
  ardd                 date,
  etd                  date,
  awb                  text,
  shipment_invoice     text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- RLS: allow all for now (tighten with Supabase Auth later)
alter table orders   enable row level security;
alter table accounts enable row level security;

create policy "allow all orders"   on orders   for all using (true) with check (true);
create policy "allow all accounts" on accounts for all using (true) with check (true);
