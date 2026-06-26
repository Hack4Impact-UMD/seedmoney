create or replace view public.leaderboard_transactions as
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
