begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into public.campaigns(campaign_id, status) overriding system value
values (-910300001, 'published'), (-910300002, 'published');

set local role service_role;
insert into public.campaign_publication_operations(campaign_id, action)
values (-910300001, 'suspend');
select throws_ok(
  $$insert into public.campaign_publication_operations(campaign_id, action) values(-910300001, 'republish')$$,
  '23505', 'duplicate key value violates unique constraint "campaign_publication_operations_pkey"',
  'A second action cannot reserve the same campaign'
);
insert into public.campaign_publication_operations(campaign_id, action)
values (-910300002, 'republish');
select is((select count(*) from public.campaign_publication_operations where campaign_id in (-910300001,-910300002)), 2::bigint, 'Different campaigns can be reserved independently');
update public.campaign_publication_operations set error='Needs reconciliation' where campaign_id=-910300001;
select is((select error from public.campaign_publication_operations where campaign_id=-910300001), 'Needs reconciliation', 'Uncertain outcomes can be recorded durably');
delete from public.campaign_publication_operations where campaign_id=-910300001 and operation_id='00000000-0000-0000-0000-000000000000';
select is((select count(*) from public.campaign_publication_operations where campaign_id=-910300001), 1::bigint, 'A wrong operation token cannot release a reservation');

reset role;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000001"}';
set local role authenticated;
select is((select count(*) from public.campaign_publication_operations where campaign_id=-910300001), 0::bigint, 'Non-admin users cannot inspect operations');
select throws_ok(
  $$insert into public.campaign_publication_operations(campaign_id, action) values(-910300001, 'republish')$$,
  '42501', 'permission denied for table campaign_publication_operations', 'Browsers cannot acquire reservations'
);
select ok(not has_table_privilege('authenticated', 'public.campaign_publication_operations', 'DELETE'), 'Browsers cannot clear reservations');
select ok(not has_table_privilege('anon', 'public.campaign_publication_operations', 'SELECT'), 'Anonymous callers cannot inspect operations');
reset role;

delete from public.campaigns where campaign_id in (-910300001,-910300002);
select is((select count(*) from public.campaign_publication_operations where campaign_id in (-910300001,-910300002)), 0::bigint, 'Campaign deletion still cleans up operation records');
select * from finish();
rollback;
