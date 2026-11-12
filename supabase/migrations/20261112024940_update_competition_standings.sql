begin;

lock table public.transactions, public.campaigns, public.competition_metadata
in share row exclusive mode;

create or replace function public.apply_competition_donation_delta(
  donation public.transactions,
  direction integer
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

create trigger sync_competition_standings
after insert or delete or update of campaign_id, amount_donated, status, transacted_at
on public.transactions
for each row execute function public.sync_competition_standings();

create or replace function public.rebuild_competition_standings()
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  missing_timestamps bigint;
begin
  lock table public.transactions, public.campaigns, public.competition_metadata
  in share row exclusive mode;

  delete from public.competition_standings s
  where not exists (
    select 1 from public.campaigns c
    where c.campaign_id = s.campaign_id
      and c.competition_id = s.competition_id
  );

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
  group by c.competition_id, c.campaign_id
  on conflict (competition_id, campaign_id) do update
  set raised = excluded.raised,
      donation_count = excluded.donation_count;

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
