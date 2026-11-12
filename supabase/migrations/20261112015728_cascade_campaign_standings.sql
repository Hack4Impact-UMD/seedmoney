alter table public.competition_standings
drop constraint competition_standings_campaign_id_fkey;

alter table public.competition_standings
add constraint competition_standings_campaign_id_fkey
foreign key (campaign_id) references public.campaigns(campaign_id)
on delete cascade not valid;

alter table public.competition_standings
validate constraint competition_standings_campaign_id_fkey;
