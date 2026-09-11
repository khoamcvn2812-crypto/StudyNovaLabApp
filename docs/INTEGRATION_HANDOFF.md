# StudyNova multilingual integration handoff

## Architecture and feature map

The common landing page is `/`; the backward-compatible IELTS application is `/english.html`; Chinese is a separate, lazy-loaded static module at `/chinese/`. UI locale (`novalab_language_v1`), learning language (route/config), and programme (`IELTS`/`HSK`) are separate concepts in `shared/languages.js`.

| Chinese source capability | Integrated location |
| --- | --- |
| Hanzi, Pinyin, meaning, topic, part of speech, HSK, example/translation; add/edit/delete/search | `/chinese/#vocab` |
| Quick import and validation | `/chinese/#vocab` add flow |
| Multiple choice, fill-in, listen-and-choose | `/chinese/#review` |
| Due/all/HSK/topic filters and 10/20/30/all limits | `/chinese/#review` |
| Wrong-word retry, adaptive schedule, persisted session, history/streak | `/chinese/#review` and Chinese dashboard |
| Word/sentence speech and speaking recorder | Review and `/chinese/#speaking` |
| HSK progress | `/chinese/#hsk` |
| Writing Vault | `/chinese/writing-vault.html` |
| Versioned export and safe merge import | `/chinese/#data` |

IELTS vocabulary, review, progress, dictionary, Writing Vault and AI Coach remain in `english.html` and `studynova_writing_vault.html`. No feature not present in either source is represented as implemented.

## Data boundaries and cloud migration

English retains `vocabmaster_data_v1` and `writingvault_data_v1`. Chinese retains its non-destructive legacy keys `chinesemaster_data_v1` and `chinesewritingvault_data_v1`. Record sync namespaces are `english_*` and `chinese_*`, scoped by Supabase `user_id`; tombstones and revisions continue to prevent deleted records being recreated. Empty data is not uploaded during auth initialization: only records locally present and absent in the cloud are queued.

Apply `supabase/migrations/202609110001_multilanguage_sync.sql` in a test project first. It adds a generated language discriminator/index and the missing owner-only DELETE policy. Do not run it automatically or on production as part of this change.

Required frontend environment/configuration names remain the existing `SUPABASE_URL` and `SUPABASE_ANON_KEY`; server-side AI configuration remains `OPENAI_API_KEY`. Never expose a service-role key.

## Moving data from the old Chinese origin

1. On the browser profile and device that still contains the old site's local data, open its **Data & backup** page and download JSON. Another origin cannot read that localStorage.
2. Deploy the small source-side export change in `chinese-source/assets/app.js` to the old Chinese repository if format-v3 metadata is desired. Editing this vendored source does **not** update the old production site; format-v2 exports remain accepted.
3. In the integrated site open `/chinese/#data`, choose **Nhập dữ liệu từ StudyNova Chinese**, inspect valid/duplicate/error counts, and confirm. Import merges by normalized Hanzi + Pinyin + meaning (not Hanzi alone).
4. Reimporting the same file is idempotent. Before mutation, the app writes `studynova_chinese_import_backup_v1`; existing data and old-site data are not deleted. Restore that JSON manually if a post-import inspection finds a problem.
5. Local import works signed out. Before later cloud upload, sign in to and confirm the intended shared IELTS account using the existing cloud confirmation flow.

Files over 5 MB, unsupported versions and malformed records are rejected before mutation. Conflicting IDs are regenerated and review/history references are remapped. Existing records win identity conflicts, avoiding silent overwrite.

## Deployment and rollback

1. Back up production Supabase and export both browser stores.
2. Deploy static assets first; verify `/`, `/english.html`, `/chinese/` and both vaults.
3. Apply the SQL to a test project, test two users/two browser sessions, then schedule production separately.
4. Keep both current production sites online while users export local Chinese data.
5. Roll back static deployment to the previous commit if necessary. The migration is additive; its index/policy/column can be dropped after rollback, while local keys remain untouched.

`chinese-source/` is reference-only and excluded by `.vercelignore`; runtime text files are explicitly copied under `chinese/`; its UI reuses the production IELTS PNG icons from root `icons/` and the checked-in Chinese SVG. The root service worker owns the shared scope, while the integrated Chinese module does not register its old worker, preventing competing controllers.

## Verification boundaries

Automated tests cover parsing, identity conflicts, repeated imports and ID/reference remapping. Local browser smoke tests cover routes and layouts. Live Supabase authentication, two-device Realtime behavior, production RLS, microphone permissions, OpenAI and Vercel Preview require configured external services and must not be claimed from local mocks.
