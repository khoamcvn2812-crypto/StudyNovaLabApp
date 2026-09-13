# English/Chinese data split handoff

## Storage map

Supabase Auth, `profiles`, account settings and quota tables remain shared. Existing IELTS data remains unchanged in `user_app_data` (manual backup) and `user_sync_records` rows prefixed `english_`. Chinese uses only `chinese_vocabulary`, `chinese_review_history`, `chinese_study_sessions`, `chinese_progress`, and `chinese_writings`.

The original mix-up was in `chinese/assets/app.js`: an empty Chinese store copied `vocabmaster_data_v1`, the IELTS browser store. In addition, the old realtime client watched both subjects and its offline queue did not capture the account at creation. The fallback is removed; Chinese cloud access now goes through `shared/subject-data.js`, while the legacy realtime adapter is English-only. Caches include Supabase project, user id, subject, and schema version. Queued operations also capture user and subject. Failed reads preserve the last cache and never enqueue an empty snapshot.

## Safe migration procedure

1. Back up the database and export both in-app backups. Do not delete or rewrite the source.
2. Apply `202609130001_split_chinese_learning_store.sql` to local Supabase, then test with two users.
3. Run `scripts/chinese-migration-dry-run.sql`. If it reports no verified `chinese_` source records, this was only the fallback bug: copy nothing.
4. For genuinely mixed records, add candidates only when `entity_type`, an import manifest, or other stored provenance verifies the source. Hanzi presence is not evidence. Leave uncertain candidates `pending`.
5. After human confirmation, copy parent vocabulary first, record old/new ids in `chinese_migration_id_map`, then copy review/session links using the map. Use `source_fingerprint` and candidate uniqueness for repeat-safe inserts. Compare counts and payloads, mark candidates `copied`, and retain source rows.
6. Deploy the frontend to Preview, execute the checklist below, then deploy the migration before the frontend. Do not use a service-role key in the browser.

## Verification and rollback

Verify an IELTS-only account sees an empty Chinese library; CRUD/import/review/writing remain isolated; all three Chinese review modes use Chinese words; reload, two tabs, offline replay, mid-load account switching, and two-user RLS behave correctly. Re-run import/copy to verify idempotency.

To roll back the frontend, redeploy the prior build. The additive migration leaves English and all migration sources intact. If database rollback is required, first export the five Chinese tables and mapping/audit tables, then drop those new objects only; restoring English data is unnecessary.
