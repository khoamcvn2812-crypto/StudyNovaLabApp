-- Additive hardening for language-scoped StudyNova records. Run only after a backup.
alter table public.user_sync_records
  add column if not exists learning_language text generated always as
    (case when entity_type like 'english\_%' escape '\' then 'en'
          when entity_type like 'chinese\_%' escape '\' then 'zh'
          else 'legacy' end) stored;
create index if not exists user_sync_records_user_language_updated_idx
  on public.user_sync_records (user_id, learning_language, updated_at desc);
alter table public.user_sync_records enable row level security;
drop policy if exists "Users can delete their own sync records" on public.user_sync_records;
create policy "Users can delete their own sync records" on public.user_sync_records
  for delete using (auth.uid() = user_id);
-- Existing SELECT/INSERT/UPDATE owner policies remain intact; this adds DELETE explicitly.
