begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into public.competition_metadata (competition_id, start_date, end_date)
overriding system value values (-910100001, '2026-11-15', '2026-12-15');

insert into public.campaigns (campaign_id, competition_id, status, raised, donors)
overriding system value values
  (-910100001, -910100001, 'published', 777, 77),
  (-910100002, -910100001, 'published', 0, 0),
  (-910100003, -910100001, 'suspended', 0, 0);

insert into public.transactions (
  transaction_id, campaign_id, givebutter_id, amount_donated, status, date, transacted_at
)
overriding system value values
  (-910100001, -910100001, 'standings-before-start', 100, 'succeeded', '2026-11-15', '2026-11-15 16:59:59+00'),
  (-910100002, -910100001, 'standings-at-start', 12.34, 'succeeded', '2026-11-15', '2026-11-15 17:00:00+00'),
  (-910100003, -910100001, 'standings-before-end', 25.66, 'succeeded', '2026-12-15', '2026-12-15 16:59:59.999+00'),
  (-910100004, -910100001, 'standings-at-end', 400, 'succeeded', '2026-12-15', '2026-12-15 17:00:00+00'),
  (-910100005, -910100001, 'standings-failed', 500, 'failed', '2026-11-20', '2026-11-20 18:00:00+00'),
  (-910100006, -910100001, 'standings-pending', 500, 'pending', '2026-11-20', '2026-11-20 18:00:00+00'),
  (-910100007, -910100001, 'standings-missing-time', 100, 'succeeded', '2026-11-20', null),
  (-910100008, -910100001, 'standings-paid', 2, ' PAID ', '2026-11-20', '2026-11-20 18:00:00+00');

select is((select raised from public.competition_standings where campaign_id=-910100001), 40::numeric, 'Only eligible successful donations count, including cents');
select is((select donation_count from public.competition_standings where campaign_id=-910100001), 3::bigint, 'Count donations rather than unique donors');
select is((select raised from public.campaigns where campaign_id=-910100001), 777::bigint, 'Standings trigger does not double-update overall raised');
select is((select donors from public.campaigns where campaign_id=-910100001), 77::bigint, 'Standings trigger leaves overall donor handling unchanged');

update public.transactions set status='succeeded' where transaction_id=-910100006;
select is((select raised from public.competition_standings where campaign_id=-910100001), 540::numeric, 'A pending donation contributes when it succeeds');
select is((select donation_count from public.competition_standings where campaign_id=-910100001), 4::bigint, 'Success transition contributes one donation');

select throws_ok(
  $$insert into public.transactions (transaction_id,campaign_id,givebutter_id,amount_donated,status,transacted_at) overriding system value values(-910100099,-910100001,'standings-at-start',12.34,'succeeded','2026-11-15 17:00:00+00')$$,
  '23505', 'duplicate key value violates unique constraint "transactions_givebutter_id_key"',
  'Duplicate Givebutter events cannot be inserted twice'
);
select is((select raised from public.competition_standings where campaign_id=-910100001), 540::numeric, 'Rejected duplicate does not change totals');

update public.transactions set status='refunded' where transaction_id=-910100006;
select is((select raised from public.competition_standings where campaign_id=-910100001), 40::numeric, 'Changing a donation out of success removes its contribution');
select is((select donation_count from public.competition_standings where campaign_id=-910100001), 3::bigint, 'Removing success adjusts the count');

update public.transactions set amount_donated=20 where transaction_id=-910100002;
select is((select raised from public.competition_standings where campaign_id=-910100001), 47.66::numeric, 'Correcting an amount applies only its difference');
select is((select donation_count from public.competition_standings where campaign_id=-910100001), 3::bigint, 'Correcting an amount does not duplicate the donation');

update public.transactions set transacted_at='2026-12-15 17:00:00+00' where transaction_id=-910100002;
select is((select raised from public.competition_standings where campaign_id=-910100001), 27.66::numeric, 'Moving a donation to the excluded end boundary removes it');
update public.transactions set transacted_at='2026-11-15 17:00:00+00' where transaction_id=-910100002;
select is((select raised from public.competition_standings where campaign_id=-910100001), 47.66::numeric, 'Moving it back to the inclusive start boundary restores it');

update public.transactions set campaign_id=-910100002 where transaction_id=-910100002;
select is((select raised from public.competition_standings where campaign_id=-910100001), 27.66::numeric, 'Reassigning a transaction removes its old contribution');
select is((select raised from public.competition_standings where campaign_id=-910100002), 20::numeric, 'Reassigning a transaction adds its new contribution');
delete from public.transactions where transaction_id=-910100002;
select is((select raised from public.competition_standings where campaign_id=-910100002), 0::numeric, 'Deleting a transaction removes its contribution');
select is((select donation_count from public.competition_standings where campaign_id=-910100002), 0::bigint, 'Deleting a transaction removes its count');

insert into public.transactions (transaction_id,campaign_id,givebutter_id,amount_donated,status,transacted_at)
overriding system value values(-910100010,-910100001,'standings-late-notification',5,'succeeded','2026-12-15 16:59:00+00');
select is((select raised from public.competition_standings where campaign_id=-910100001), 32.66::numeric, 'Eligibility uses donation time, not notification arrival time');

update public.competition_standings set raised=999, donation_count=999 where campaign_id=-910100001;
select lives_ok('select public.rebuild_competition_standings()', 'Backfill can be rerun');
select is((select raised from public.competition_standings where campaign_id=-910100001), 32.66::numeric, 'Backfill agrees with incremental updates');
select is((select donation_count from public.competition_standings where campaign_id=-910100001), 3::bigint, 'Backfill repairs donation counts');
select is((select raised from public.competition_standings where campaign_id=-910100002), 0::numeric, 'Campaigns without eligible donations remain present with zero totals');
select lives_ok('select public.rebuild_competition_standings()', 'Repeated backfill is safe');
select is((select raised from public.competition_standings where campaign_id=-910100001), 32.66::numeric, 'Repeated backfill does not double-count');

select ok(not has_function_privilege('anon','public.rebuild_competition_standings()','EXECUTE'), 'Visitors cannot rebuild standings');
select ok(not has_function_privilege('authenticated','public.apply_competition_donation_delta(public.transactions,integer)','EXECUTE'), 'Browsers cannot invoke the totals helper');

set local request.jwt.claims = '{"role":"anon"}';
set local role anon;
select is((select count(*) from public.competition_standings where competition_id=-910100001), 2::bigint, 'Public reads exclude suspended campaigns');
reset role;

update public.campaigns set status='suspended' where campaign_id=-910100001;
set local role anon;
select is((select count(*) from public.competition_standings where competition_id=-910100001), 1::bigint, 'Suspension immediately removes a campaign from public contention');
reset role;

select lives_ok('delete from public.campaigns where campaign_id=-910100001', 'Deleting a campaign with transactions still succeeds');
select is((select count(*) from public.competition_standings where campaign_id=-910100001), 0::bigint, 'Campaign deletion cascades to its standings');
select ok(exists(select 1 from public.campaigns where campaign_id=-910100002), 'Unrelated campaigns remain intact');

insert into public.transactions (transaction_id,campaign_id,givebutter_id,amount_donated,status,transacted_at)
overriding system value values(-910100011,-910100002,'standings-parent-correction',100,'succeeded','2026-12-15 17:30:00+00');
select is((select raised from public.competition_standings where campaign_id=-910100002), 0::numeric, 'Donation starts outside the original window');
update public.competition_metadata set end_date='2026-12-16' where competition_id=-910100001;
select is((select raised from public.competition_standings where campaign_id=-910100002), 100::numeric, 'Extending the window includes existing donations atomically');
update public.transactions set amount_donated=300 where transaction_id=-910100011;
select is((select raised from public.competition_standings where campaign_id=-910100002), 300::numeric, 'Correcting a newly eligible donation does not subtract an uncounted contribution');
select is((select donation_count from public.competition_standings where campaign_id=-910100002), 1::bigint, 'Date corrections preserve the correct count');
update public.competition_metadata set end_date='2026-12-15' where competition_id=-910100001;
select is((select raised from public.competition_standings where campaign_id=-910100002), 0::numeric, 'Shrinking the window removes newly ineligible donations');

insert into public.competition_metadata (competition_id,start_date,end_date)
overriding system value values(-910100002,'2026-11-15','2026-12-16');
update public.campaigns set competition_id=-910100002 where campaign_id=-910100002;
select is((select count(*) from public.competition_standings where campaign_id=-910100002 and competition_id=-910100001), 0::bigint, 'Reassignment removes the old competition row');
select is((select raised from public.competition_standings where campaign_id=-910100002 and competition_id=-910100002), 300::numeric, 'Reassignment recalculates using the new competition window');
update public.transactions set amount_donated=350 where transaction_id=-910100011;
select is((select raised from public.competition_standings where campaign_id=-910100002), 350::numeric, 'Corrections after reassignment remain accurate');
select is((select donation_count from public.competition_standings where campaign_id=-910100002), 1::bigint, 'Corrections after reassignment retain the count');
update public.campaigns set competition_id=null where campaign_id=-910100002;
select is((select count(*) from public.competition_standings where campaign_id=-910100002), 0::bigint, 'Removing a competition clears its standings');
select is((select count(*) from public.transactions where transaction_id=-910100011), 1::bigint, 'Removing a competition preserves its donation ledger');
update public.campaigns set competition_id=-910100002 where campaign_id=-910100002;
select is((select raised from public.competition_standings where campaign_id=-910100002), 350::numeric, 'Assigning a competition restores eligible totals');

select * from finish();
rollback;
