-- READ-ONLY inventory. Run after taking a Supabase backup and before confirming
-- any candidate. Classification uses the stored entity_type, never characters.
begin transaction read only;

select user_id, entity_type, count(*) as source_count,
       count(*) filter (where deleted_at is null) as live_count
from public.user_sync_records
where entity_type like 'chinese\_%' escape '\'
group by user_id, entity_type order by user_id, entity_type;

select user_id, count(*) as destination_words
from public.chinese_vocabulary group by user_id order by user_id;

select c.user_id, c.status, count(*) as candidates
from public.chinese_migration_candidates c
group by c.user_id, c.status order by c.user_id, c.status;

select c.source_table, c.source_id, c.evidence, c.status, m.destination_id
from public.chinese_migration_candidates c
left join public.chinese_migration_id_map m on m.candidate_id = c.id
order by c.id;

rollback;
