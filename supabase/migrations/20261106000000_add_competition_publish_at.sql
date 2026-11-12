alter table public.competition_metadata
add column if not exists publish_at timestamptz;

update public.competition_metadata
set publish_at = '2026-11-15 12:00:00-05:00'
where is_current is true;
