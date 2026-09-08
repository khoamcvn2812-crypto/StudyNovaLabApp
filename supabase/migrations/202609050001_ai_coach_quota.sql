-- Durable, atomic quotas for the authenticated StudyNova AI Coach.
create table if not exists public.ai_coach_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket_type text not null check (bucket_type in ('minute', 'day')),
  bucket_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (user_id, bucket_type, bucket_start)
);

create table if not exists public.ai_coach_app_usage (
  bucket_start timestamptz primary key,
  request_count integer not null default 0 check (request_count >= 0)
);

alter table public.ai_coach_usage enable row level security;
alter table public.ai_coach_app_usage enable row level security;
revoke all on public.ai_coach_usage, public.ai_coach_app_usage from anon, authenticated;

create or replace function public.consume_ai_coach_quota(
  p_minute_limit integer,
  p_daily_limit integer,
  p_app_daily_limit integer
) returns table(allowed boolean, minute_count integer, daily_count integer, app_daily_count integer)
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  minute_bucket timestamptz := date_trunc('minute', now());
  day_bucket timestamptz := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC';
begin
  if uid is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_minute_limit < 1 or p_daily_limit < 1 or p_app_daily_limit < 1 then raise exception 'invalid limits'; end if;
  perform pg_advisory_xact_lock(hashtext('studynova-ai-quota'));
  select request_count into minute_count from public.ai_coach_usage where user_id=uid and bucket_type='minute' and bucket_start=minute_bucket;
  select request_count into daily_count from public.ai_coach_usage where user_id=uid and bucket_type='day' and bucket_start=day_bucket;
  select request_count into app_daily_count from public.ai_coach_app_usage where bucket_start=day_bucket;
  minute_count := coalesce(minute_count, 0); daily_count := coalesce(daily_count, 0); app_daily_count := coalesce(app_daily_count, 0);
  allowed := minute_count < p_minute_limit and daily_count < p_daily_limit and app_daily_count < p_app_daily_limit;
  if not allowed then return next; return; end if;
  insert into public.ai_coach_usage(user_id,bucket_type,bucket_start,request_count) values(uid,'minute',minute_bucket,1)
    on conflict(user_id,bucket_type,bucket_start) do update set request_count=public.ai_coach_usage.request_count+1 returning request_count into minute_count;
  insert into public.ai_coach_usage(user_id,bucket_type,bucket_start,request_count) values(uid,'day',day_bucket,1)
    on conflict(user_id,bucket_type,bucket_start) do update set request_count=public.ai_coach_usage.request_count+1 returning request_count into daily_count;
  insert into public.ai_coach_app_usage(bucket_start,request_count) values(day_bucket,1)
    on conflict(bucket_start) do update set request_count=public.ai_coach_app_usage.request_count+1 returning request_count into app_daily_count;
  return next;
end;
$$;

revoke all on function public.consume_ai_coach_quota(integer,integer,integer) from public, anon;
grant execute on function public.consume_ai_coach_quota(integer,integer,integer) to authenticated;
