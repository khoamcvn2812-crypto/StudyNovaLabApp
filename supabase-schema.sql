-- Run in the Supabase SQL editor. Display names identify presentation only;
-- auth.users.id remains the account identity and email remains the login.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  requested_name text := trim(regexp_replace(coalesce(new.raw_user_meta_data ->> 'display_name', ''), '\\s+', ' ', 'g'));
begin
  if char_length(requested_name) between 2 and 30 then
    insert into public.profiles (user_id, display_name)
    values (new.id, requested_name)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();
