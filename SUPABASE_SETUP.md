# Supabase production setup

The browser app uses only the project publishable key. Complete these dashboard steps before production use:

1. In **Authentication → URL Configuration**, set the Site URL to `https://studynovalab.vercel.app` and add that URL to Redirect URLs.
2. Enable Email authentication. The app reports when email confirmation is required.
3. To enable Facebook, create a Meta app, enable the Facebook provider in Supabase, copy the Supabase callback URL shown by the provider into Meta's valid OAuth redirect URIs, and provide the Meta App ID and secret **only in the Supabase Dashboard**.
4. Run/verify the following in the SQL editor. It keeps every operation scoped to `auth.uid()` and does not grant cross-user access:

```sql
create table if not exists public.user_app_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_app_data enable row level security;

create policy "users_select_own_app_data" on public.user_app_data
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users_insert_own_app_data" on public.user_app_data
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users_update_own_app_data" on public.user_app_data
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "users_delete_own_app_data" on public.user_app_data
  for delete to authenticated using ((select auth.uid()) = user_id);
```

If policies with these names already exist, inspect them rather than creating duplicates. The app never needs a service-role key and never disables RLS.
