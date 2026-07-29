# Supabase and Facebook setup

The frontend uses the public Supabase browser client and keeps `localStorage` as the offline source of truth. Never add a secret or service-role key to this repository.

## Supabase dashboard

1. Run [`supabase-schema.sql`](./supabase-schema.sql) in the SQL editor. It creates profiles plus the RLS-protected `user_sync_records` table and adds that table to the Realtime publication. Existing `user_app_data` backups are intentionally left untouched during migration.
2. Keep RLS enabled. Sync-record policies must remain restricted to `user_id = auth.uid()`; never expose records through an anonymous policy.
3. In **Authentication → URL Configuration**, set the production site URL to `https://studynovaielts.vercel.app` and add the Vercel preview URL as an allowed redirect before testing the preview.
4. Enable email confirmation and configure the email templates/SMTP required by the project.

## Facebook / Meta

1. Enable the Facebook provider in Supabase Authentication and provide the Meta App ID and secret **only in the Supabase dashboard**.
2. Add the callback URL shown by Supabase to Meta's valid OAuth redirect URIs.
3. Keep `https://studynovaielts.vercel.app` in the allowed app domains. The application intentionally uses that production URL as its OAuth `redirectTo`.

## Preview checklist

Use two separate confirmed test users to verify RLS isolation. Test first and repeated upload, empty-cloud download protection, compare without writes, merge preservation, offline drafts, language switching, service-worker update, and both navigation directions. Do not promote the preview to production until manual checks pass.
