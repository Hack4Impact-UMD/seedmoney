begin;

lock table public.competition_metadata, public.campaigns, public.transactions
in share row exclusive mode;

create index if not exists transactions_campaign_id_idx
on public.transactions (campaign_id);

create or replace function public.refresh_competition_standings(
  target_competition_id bigint,
  target_campaign_id bigint
)
returns void
language sql
security definer
set search_path = ''
as $function$
  insert into public.competition_standings (
    competition_id, campaign_id, raised, donation_count
  )
  select c.competition_id, c.campaign_id,
         coalesce(sum(t.amount_donated::numeric), 0), count(t.transaction_id)
  from public.campaigns c
  join public.competition_metadata m on m.competition_id = c.competition_id
  left join public.transactions t
    on t.campaign_id = c.campaign_id
    and lower(trim(t.status)) in ('succeeded', 'paid', 'complete', 'completed')
    and t.transacted_at >=
      ((m.start_date + time '12:00') at time zone 'America/New_York')
    and t.transacted_at <
      ((m.end_date + time '12:00') at time zone 'America/New_York')
  where (target_competition_id is null or c.competition_id = target_competition_id)
    and (target_campaign_id is null or c.campaign_id = target_campaign_id)
  group by c.competition_id, c.campaign_id
  on conflict (competition_id, campaign_id) do update
  set raised = excluded.raised,
      donation_count = excluded.donation_count;
$function$;

revoke all on function public.refresh_competition_standings(bigint, bigint)
from public, anon, authenticated, service_role;

create or replace function public.apply_competition_donation_delta(
  donation public.transactions,
  direction integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  -- Eligibility edits must finish before a donation uses their new values.
  perform c.campaign_id from public.campaigns c
  where c.campaign_id = donation.campaign_id
  for share;

  perform m.competition_id
  from public.competition_metadata m
  join public.campaigns c on c.competition_id = m.competition_id
  where c.campaign_id = donation.campaign_id
  for share of m;

  insert into public.competition_standings (
    competition_id, campaign_id, raised, donation_count
  )
  select c.competition_id, c.campaign_id,
         coalesce(donation.amount_donated, 0)::numeric * direction, direction
  from public.campaigns c
  join public.competition_metadata m on m.competition_id = c.competition_id
  where c.campaign_id = donation.campaign_id
    and lower(trim(donation.status)) in ('succeeded', 'paid', 'complete', 'completed')
    and donation.transacted_at >=
      ((m.start_date + time '12:00') at time zone 'America/New_York')
    and donation.transacted_at <
      ((m.end_date + time '12:00') at time zone 'America/New_York')
  on conflict (competition_id, campaign_id) do update
  set raised = competition_standings.raised + excluded.raised,
      donation_count = competition_standings.donation_count + excluded.donation_count;
end;
$function$;

revoke all on function public.apply_competition_donation_delta(public.transactions, integer)
from public, anon, authenticated, service_role;

create or replace function public.sync_competition_standings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if tg_op <> 'INSERT' then
    perform public.apply_competition_donation_delta(old, -1);
  end if;

  if tg_op <> 'DELETE' then
    perform public.apply_competition_donation_delta(new, 1);
  end if;

  return null;
end;
$function$;

revoke all on function public.sync_competition_standings()
from public, anon, authenticated, service_role;

create or replace trigger sync_competition_standings
after insert or delete or update of campaign_id, amount_donated, status, transacted_at
on public.transactions
for each row execute function public.sync_competition_standings();

create or replace function public.sync_standings_eligibility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if tg_table_name = 'campaigns' then
    perform m.competition_id from public.competition_metadata m
    where m.competition_id in (old.competition_id, new.competition_id)
    order by m.competition_id
    for share;

    delete from public.competition_standings
    where campaign_id = new.campaign_id
      and competition_id is distinct from new.competition_id;

    perform public.refresh_competition_standings(null, new.campaign_id);
  else
    perform public.refresh_competition_standings(new.competition_id, null);
  end if;
  return null;
end;
$function$;

revoke all on function public.sync_standings_eligibility()
from public, anon, authenticated, service_role;

create or replace trigger sync_standings_campaign_competition
after update of competition_id on public.campaigns
for each row when (old.competition_id is distinct from new.competition_id)
execute function public.sync_standings_eligibility();

create or replace trigger sync_standings_competition_dates
after update of start_date, end_date on public.competition_metadata
for each row when (
  old.start_date is distinct from new.start_date
  or old.end_date is distinct from new.end_date
)
execute function public.sync_standings_eligibility();

create or replace function public.rebuild_competition_standings()
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  missing_timestamps bigint;
begin
  lock table public.competition_metadata, public.campaigns, public.transactions
  in share row exclusive mode;

  delete from public.competition_standings s
  where not exists (
    select 1 from public.campaigns c
    where c.campaign_id = s.campaign_id
      and c.competition_id = s.competition_id
  );

  perform public.refresh_competition_standings(null, null);

  select count(*) into missing_timestamps
  from public.transactions t
  join public.campaigns c on c.campaign_id = t.campaign_id
  join public.competition_metadata m on m.competition_id = c.competition_id
  where t.transacted_at is null
    and lower(trim(t.status)) in ('succeeded', 'paid', 'complete', 'completed')
    and t.date between m.start_date and m.end_date;

  if missing_timestamps > 0 then
    raise warning '% successful transactions lack an exact donation timestamp and were excluded from standings. Reconcile transacted_at and rebuild standings.', missing_timestamps;
  end if;
end;
$function$;

revoke all on function public.rebuild_competition_standings()
from public, anon, authenticated;
grant execute on function public.rebuild_competition_standings() to service_role;

select public.rebuild_competition_standings();

commit;
