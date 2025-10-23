-- emails table
create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

-- packs table (optional metadata)
create table if not exists public.packs (
  id text primary key,
  title text not null,
  price_single_inr integer not null default 499,
  stock_left integer not null default 996
);

-- orders table (placeholder, can be expanded)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  pack_id text not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  amount_in_paise integer not null,
  status text not null default 'created',
  created_at timestamptz not null default now()
);

-- Basic RLS (tighten as needed)
alter table public.emails enable row level security;
create policy "allow insert emails" on public.emails for insert to anon with check (true);
create policy "allow read own emails" on public.emails for select using (true);

alter table public.packs enable row level security;
create policy "read packs" on public.packs for select using (true);

alter table public.orders enable row level security;
create policy "insert orders" on public.orders for insert to anon with check (true);
create policy "read own orders" on public.orders for select using (true);
