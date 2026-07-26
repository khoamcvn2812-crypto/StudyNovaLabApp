# Supabase and Facebook setup

The frontend uses the public Supabase browser client and keeps `localStorage` as the offline source of truth. Never add a secret or service-role key to this repository.

## Supabase dashboard

1. Keep RLS enabled on `public.user_app_data` and policies restricted to `user_id = auth.uid()` for select, insert, update, and delete.
2. In **Authentication → URL Configuration**, set the production site URL to `https://studynovaielts.vercel.app` and add the Vercel preview URL as an allowed redirect before testing the preview.
3. Enable email confirmation and configure the email templates/SMTP required by the project.

## Facebook / Meta

1. Enable the Facebook provider in Supabase Authentication and provide the Meta App ID and secret **only in the Supabase dashboard**.
2. Add the callback URL shown by Supabase to Meta's valid OAuth redirect URIs.
3. Keep `https://studynovaielts.vercel.app` in the allowed app domains. The application intentionally uses that production URL as its OAuth `redirectTo`.

## Preview checklist

Use two separate confirmed test users to verify RLS isolation. Test first and repeated upload, empty-cloud download protection, compare without writes, merge preservation, offline drafts, language switching, service-worker update, and both navigation directions. Do not promote the preview to production until manual checks pass.

## Profiles, password and recovery upgrade

Run `supabase/migrations/202607260001_create_profiles.sql` in the Supabase SQL editor. The table uses `auth.users.id` as its only identity key; display names are intentionally **not unique**. RLS limits select, insert, and update to `auth.uid()`.

The project owner must also configure these Dashboard settings before production approval:

1. **Authentication → Providers → Email**: enable email confirmation. Under password security, require at least 8 characters, one uppercase letter, and one number where the current Supabase plan exposes a password-strength policy.
2. **Authentication → URL Configuration**: set the site URL to `https://studynovaielts.vercel.app/`; allow `https://studynovaielts.vercel.app/**` and the exact Vercel Preview URL (or the team's approved preview wildcard) before testing OAuth/recovery.
3. Review email rate limits. Configure custom SMTP for reliable production confirmation and recovery delivery if the built-in quota is insufficient.
4. Keep the Facebook identity and Supabase callback configured in Meta. Never put the Meta secret or a Supabase service-role key in frontend files.

Recovery email redirects and Facebook OAuth use the single production origin constant in `studynova-auth.js`. Preview OAuth can only be tested after its URL is explicitly allowed in Supabase.
