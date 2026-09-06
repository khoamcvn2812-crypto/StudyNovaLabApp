# StudyNova IELTS AI Coach deployment

This repository is **StudyNova IELTS** (the production URL and learning modules are IELTS-specific). The browser calls only `POST /api/ai-coach`; the Vercel Function verifies the current Supabase session and calls the OpenAI Responses API. Chat history is kept in page memory only.

## Required one-time Supabase migration

Run `supabase/migrations/202609050001_ai_coach_quota.sql` in the SQL editor for the same Supabase project used by StudyNova. It creates the durable, transactionally locked per-user and application counters. Keep `AI_COACH_ENABLED=false` until this succeeds. The endpoint fails closed when session verification or the quota RPC is unavailable.

## Vercel environment variables

In the **StudyNova IELTS Vercel project**, add these server-side variables (never expose them with `NEXT_PUBLIC_` or `VITE_` prefixes):

| Variable | Required / default | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | required | Secret OpenAI project API key |
| `OPENAI_MODEL` | required, no default | A model available to your OpenAI project that supports the Responses API and `max_output_tokens`; verify it in current OpenAI model documentation |
| `SUPABASE_URL` | required | Existing StudyNova Supabase project URL |
| `SUPABASE_ANON_KEY` | required | Existing public/publishable Supabase key used only with the user's bearer token; never use a service-role key here |
| `AI_COACH_ENABLED` | `false` | Server-side kill switch; set exactly `true` only after the migration and Preview checks pass |
| `AI_RATE_LIMIT_PER_MINUTE` | `5` | Per-user requests per UTC minute |
| `AI_RATE_LIMIT_PER_DAY` | `30` | Per-user requests per UTC day |
| `AI_APP_LIMIT_PER_DAY` | `1000` | Total requests across the application per UTC day |
| `AI_MAX_OUTPUT_TOKENS` | `800` | Server-controlled output cap (clamped to 100–2000) |
| `AI_REQUEST_TIMEOUT_MS` | `25000` | Server timeout (clamped to 3000–60000 ms) |

Configure **Preview** and **Production** separately in Vercel. Prefer a separate restricted/test OpenAI project key and a low application quota for Preview. Do not enable AI in Production until Preview login, quota, error, mobile, language, and theme checks pass.

Vercel environment-variable changes apply only to new deployments, so redeploy the relevant environment after changing them. Do not merge or deploy Production as part of local setup.

## Privacy and retention wording

Requests use `store: false` and bounded client-provided history. This is not a claim of Zero Data Retention. Review OpenAI's current [data controls documentation](https://developers.openai.com/api/docs/guides/your-data) and [production security guidance](https://developers.openai.com/api/docs/guides/production-best-practices) before launch.

The integration uses the official server-side SDK and Responses API following the [OpenAI quickstart](https://developers.openai.com/api/docs/quickstart). API keys remain server-side environment variables.
