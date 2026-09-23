-- ==========================================================
-- FinPulse - Personal Finance Tracker Database Schema
-- Supabase / PostgreSQL Schema with Row Level Security (RLS)
-- ==========================================================

-- 1. Profiles Table (Extends Supabase Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  currency text default 'INR',
  currency_symbol text default '₹',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Transactions Table
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  amount numeric(12, 2) not null check (amount > 0),
  description text not null,
  payment_method text not null check (payment_method in ('UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash')),
  is_recurring boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- 3. Monthly Budgets Table
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  monthly_limit numeric(12, 2) not null check (monthly_limit > 0),
  period text not null, -- Format 'YYYY-MM'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, category, period)
);

alter table public.budgets enable row level security;

create policy "Users can view own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- 4. Savings Goals Table
create table if not exists public.savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) default 0 check (current_amount >= 0),
  deadline date not null,
  category text not null default 'General',
  color text default '#6366f1',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.savings_goals enable row level security;

create policy "Users can view own savings goals"
  on public.savings_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own savings goals"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own savings goals"
  on public.savings_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own savings goals"
  on public.savings_goals for delete
  using (auth.uid() = user_id);

-- 5. Goal Contributions Table
create table if not exists public.goal_contributions (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.savings_goals(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(12, 2) not null check (amount > 0),
  date date not null default current_date,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.goal_contributions enable row level security;

create policy "Users can view own goal contributions"
  on public.goal_contributions for select
  using (auth.uid() = user_id);

create policy "Users can insert own goal contributions"
  on public.goal_contributions for insert
  with check (auth.uid() = user_id);

-- 6. Trigger for Automatic User Profile Creation on Auth SignUp
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
