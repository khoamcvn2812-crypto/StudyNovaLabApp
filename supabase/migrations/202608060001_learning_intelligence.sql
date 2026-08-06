-- Non-destructive structured learning records for Knowledge Map and Mistake Bank.
create table if not exists public.vocabulary_learning_state (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 vocabulary_id uuid not null, mastery_level text not null default 'new' check (mastery_level in ('new','learning','familiar','mastered')),
 correct_count integer not null default 0 check(correct_count>=0), wrong_count integer not null default 0 check(wrong_count>=0),
 correct_streak integer not null default 0 check(correct_streak>=0), last_reviewed_at timestamptz, next_review_at timestamptz,
 interval_days numeric not null default 0 check(interval_days>=0), accuracy numeric not null default 0 check(accuracy between 0 and 100),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,vocabulary_id)
);
create table if not exists public.learning_mistakes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 fingerprint text not null, original_text text not null, corrected_text text not null, explanation text not null default '',
 error_type text not null, source text not null check(source in ('Writing','Speaking')), source_id text, source_title text,
 mastered boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,fingerprint)
);
create index if not exists vocabulary_learning_due_idx on public.vocabulary_learning_state(user_id,next_review_at);
create index if not exists learning_mistakes_review_idx on public.learning_mistakes(user_id,mastered,updated_at desc);
alter table public.vocabulary_learning_state enable row level security;
alter table public.learning_mistakes enable row level security;
do $$ declare t text; op text; begin foreach t in array array['vocabulary_learning_state','learning_mistakes'] loop foreach op in array array['select','insert','update','delete'] loop execute format('drop policy if exists %I on public.%I', 'Users can '||op||' own '||t,t); if op='insert' then execute format('create policy %I on public.%I for insert with check (user_id=auth.uid())','Users can '||op||' own '||t,t); elsif op='update' then execute format('create policy %I on public.%I for update using (user_id=auth.uid()) with check (user_id=auth.uid())','Users can '||op||' own '||t,t); else execute format('create policy %I on public.%I for %s using (user_id=auth.uid())','Users can '||op||' own '||t,t,op); end if; end loop; end loop; end $$;
do $$ begin alter publication supabase_realtime add table public.vocabulary_learning_state; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.learning_mistakes; exception when duplicate_object then null; end $$;
