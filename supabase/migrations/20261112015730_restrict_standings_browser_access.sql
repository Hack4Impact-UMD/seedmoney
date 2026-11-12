revoke all privileges on table public.competition_standings
from public, anon, authenticated;

grant select on table public.competition_standings
to anon, authenticated;
