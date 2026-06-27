drop policy if exists "Anyone can view published campaigns" on public.campaigns;

create policy "Anyone can view published campaigns"
on public.campaigns
as permissive
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Anyone can view published leaderboard transactions" on public.transactions;

create policy "Anyone can view published leaderboard transactions"
on public.transactions
as permissive
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.campaigns c
    where c.campaign_id = transactions.campaign_id
      and c.status = 'published'
  )
);

create or replace view public.leaderboard_transactions
with (security_invoker = on)
as
select
  t.campaign_id,
  t.date,
  t.transacted_at,
  t.amount_donated,
  t.status
from public.transactions t
join public.campaigns c on c.campaign_id = t.campaign_id
where c.status = 'published';

comment on view public.leaderboard_transactions is
  'Public-safe transaction fields used for leaderboard grant calculations. Excludes donor PII.';

grant select on public.leaderboard_transactions to anon, authenticated;
