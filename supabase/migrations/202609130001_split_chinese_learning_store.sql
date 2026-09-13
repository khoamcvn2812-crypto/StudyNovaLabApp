-- StudyNova Chinese is an additive store. English/IELTS data remains in
-- user_app_data and english_* user_sync_records. Apply to local/test first.
create table if not exists public.chinese_vocabulary (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hanzi text not null check (length(trim(hanzi)) > 0),
  pinyin text not null default '', meaning text not null default '',
  hsk smallint check (hsk between 1 and 9), topic text, payload jsonb not null default '{}',
  source_fingerprint text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id, user_id), unique (user_id, source_fingerprint)
);
create table if not exists public.chinese_review_history (
  id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_id uuid, correct boolean not null, mode text not null,
  answered_at timestamptz not null default now(), payload jsonb not null default '{}',
  source_fingerprint text, unique (user_id, source_fingerprint),
  foreign key (vocabulary_id) references public.chinese_vocabulary(id) on delete set null
);
create table if not exists public.chinese_study_sessions (
  id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','abandoned')),
  mode text, started_at timestamptz not null default now(), finished_at timestamptz, payload jsonb not null default '{}',
  source_fingerprint text, unique (user_id, source_fingerprint)
);
create table if not exists public.chinese_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  streak integer not null default 0 check (streak >= 0), last_study date,
  payload jsonb not null default '{}', updated_at timestamptz not null default now()
);
create table if not exists public.chinese_writings (
  id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '', topic text, content text not null default '', notes text not null default '',
  payload jsonb not null default '{}', source_fingerprint text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (user_id, source_fingerprint)
);

create index if not exists chinese_vocabulary_user_updated_idx on public.chinese_vocabulary(user_id, updated_at desc);
create index if not exists chinese_review_user_answered_idx on public.chinese_review_history(user_id, answered_at desc);
create index if not exists chinese_review_word_idx on public.chinese_review_history(user_id, vocabulary_id);
create index if not exists chinese_sessions_user_started_idx on public.chinese_study_sessions(user_id, started_at desc);
create index if not exists chinese_writings_user_updated_idx on public.chinese_writings(user_id, updated_at desc);

do $$ declare t text; begin
  foreach t in array array['chinese_vocabulary','chinese_review_history','chinese_study_sessions','chinese_progress','chinese_writings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "owner select" on public.%I', t);
    execute format('drop policy if exists "owner insert" on public.%I', t);
    execute format('drop policy if exists "owner update" on public.%I', t);
    execute format('drop policy if exists "owner delete" on public.%I', t);
    execute format('create policy "owner select" on public.%I for select using (auth.uid() = user_id)', t);
    execute format('create policy "owner insert" on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "owner update" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "owner delete" on public.%I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- A review cannot be linked to another user's word, even if application code is bypassed.
create or replace function public.check_chinese_review_owner() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.vocabulary_id is not null and not exists (
    select 1 from public.chinese_vocabulary v where v.id = new.vocabulary_id and v.user_id = new.user_id
  ) then raise exception 'Chinese review word owner mismatch'; end if;
  return new;
end $$;
drop trigger if exists check_chinese_review_owner on public.chinese_review_history;
create trigger check_chinese_review_owner before insert or update on public.chinese_review_history
for each row execute function public.check_chinese_review_owner();

do $$ begin
  alter publication supabase_realtime add table public.chinese_vocabulary;
  alter publication supabase_realtime add table public.chinese_review_history;
  alter publication supabase_realtime add table public.chinese_study_sessions;
  alter publication supabase_realtime add table public.chinese_progress;
  alter publication supabase_realtime add table public.chinese_writings;
exception when duplicate_object then null; end $$;

-- Migration is deliberately two-phase: uncertain records stay at source. An
-- operator first inserts only verified candidates and records dry-run evidence.
create table if not exists public.chinese_migration_candidates (
  id bigint generated always as identity primary key, user_id uuid not null references auth.users(id),
  source_table text not null, source_id text not null, evidence jsonb not null,
  source_payload jsonb not null, status text not null default 'pending' check (status in ('pending','confirmed','copied','rejected')),
  created_at timestamptz not null default now(), unique(user_id, source_table, source_id)
);
create table if not exists public.chinese_migration_id_map (
  candidate_id bigint primary key references public.chinese_migration_candidates(id),
  source_id text not null, destination_id uuid not null references public.chinese_vocabulary(id), copied_at timestamptz not null default now()
);
alter table public.chinese_migration_candidates enable row level security;
alter table public.chinese_migration_id_map enable row level security;
-- No browser policies: these audit tables are operator-only. Never use a service key in the frontend.
