create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Người dùng' check (char_length(btrim(display_name)) between 2 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read only their profile" on public.profiles
  for select using (user_id = auth.uid());
create policy "Users insert only their profile" on public.profiles
  for insert with check (user_id = auth.uid());
create policy "Users update only their profile" on public.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
