begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

-- All fixtures and current-competition changes are rolled back at the end.
update public.competition_metadata set is_current = false where is_current;
insert into public.competition_metadata(competition_id, start_date, is_current)
values (1911000001, '2026-11-15', true);
insert into auth.users(id, email) values
  ('ee110000-0000-0000-0000-000000000001', 'queue-admin@example.org'),
  ('ee110000-0000-0000-0000-000000000002', 'queue-other@example.org'),
  ('ee110000-0000-0000-0000-000000000003', 'queue-recipient@example.org');
delete from public.users where id in (
  'ee110000-0000-0000-0000-000000000001', 'ee110000-0000-0000-0000-000000000002', 'ee110000-0000-0000-0000-000000000003'
);
insert into public.users(id, email, is_admin) values
  ('ee110000-0000-0000-0000-000000000001', 'queue-admin@example.org', true),
  ('ee110000-0000-0000-0000-000000000002', 'queue-other@example.org', true),
  ('ee110000-0000-0000-0000-000000000003', 'queue-recipient@example.org', false);
insert into public.admin_emails(id, created_by, competition_id, subject, body_html, recipient_groups)
select ('ee120000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
  'ee110000-0000-0000-0000-000000000001', 1911000001, 'Queue test', '<p>News</p>', array['all']
from generate_series(1, 8) i;

create function pg_temp.queue_test(n integer, v bigint default 1, recipients jsonb default
  '[{"user_id":"ee110000-0000-0000-0000-000000000003","recipient_email":"queue-recipient@example.org","first_name":"Garden"}]'
) returns jsonb language sql as $$
  select public.queue_admin_email(
    ('ee120000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
    'ee110000-0000-0000-0000-000000000001', v, 1911000001, 'Queue test', '<p>News</p>', array['all'], recipients
  );
$$;

select ok(not has_function_privilege('anon', 'public.queue_admin_email(uuid,uuid,bigint,bigint,text,text,text[],jsonb)', 'execute'), 'Anon cannot queue');
select ok(not has_function_privilege('authenticated', 'public.queue_admin_email(uuid,uuid,bigint,bigint,text,text,text[],jsonb)', 'execute'), 'Browser admins cannot bypass server validation');
select ok(has_function_privilege('service_role', 'public.queue_admin_email(uuid,uuid,bigint,bigint,text,text,text[],jsonb)', 'execute'), 'Service role can queue');
select is(pg_temp.queue_test(1)->>'already_queued', 'false', 'First request queues the draft');
select is((select status from public.admin_emails where id='ee120000-0000-0000-0000-000000000001'), 'queued', 'Draft becomes queued');
select is((select version from public.admin_emails where id='ee120000-0000-0000-0000-000000000001'), 2::bigint, 'Existing version trigger still runs');
select is((select count(*) from public.admin_email_recipients where email_id='ee120000-0000-0000-0000-000000000001'), 1::bigint, 'Recipient snapshot committed');
select is(pg_temp.queue_test(1)->>'already_queued', 'true', 'Repeat request reports the existing job');
select is((select count(*) from public.admin_email_recipients where email_id='ee120000-0000-0000-0000-000000000001'), 1::bigint, 'Repeat request cannot add recipients');
update public.admin_emails set status='sent' where id='ee120000-0000-0000-0000-000000000001';
select is(pg_temp.queue_test(1)->>'status', 'sent', 'Retry after delivery cannot requeue the email');

select throws_ok($$ select pg_temp.queue_test(2, 99) $$, 'P0001', 'email_draft_conflict', 'Stale versions fail');
select throws_ok($$ select public.queue_admin_email('ee120000-0000-0000-0000-000000000002',
  'ee110000-0000-0000-0000-000000000002', 1, 1911000001, 'Queue test', '<p>News</p>', array['all'], '[]') $$,
  'P0001', 'email_draft_conflict', 'Other admins cannot queue this owner draft');
select throws_ok($$ select public.queue_admin_email('ee120000-0000-0000-0000-000000000002',
  'ee110000-0000-0000-0000-000000000003', 1, 1911000001, 'Queue test', '<p>News</p>', array['all'], '[]') $$,
  '42501', 'Not authorized', 'Actor must still be an admin');
select throws_ok($$ select public.queue_admin_email('ee120000-0000-0000-0000-000000000002',
  'ee110000-0000-0000-0000-000000000001', 1, 1911000001, 'Different text', '<p>News</p>', array['all'], '[]') $$,
  'P0001', 'email_draft_conflict', 'Only the exact validated content can be queued');
select throws_ok($$ select pg_temp.queue_test(2, 1, '[]') $$, 'P0001', 'email_snapshot_invalid', 'Empty snapshots fail');

select throws_ok($$ select pg_temp.queue_test(3, 1,
  '[{"recipient_email":" duplicate@example.org "},{"recipient_email":"DUPLICATE@example.org"}]') $$,
  '23505', 'duplicate key value violates unique constraint "admin_email_recipients_email_id_email_key_key"', 'Duplicate addresses reject the whole snapshot');
select is((select count(*) from public.admin_email_recipients where email_id='ee120000-0000-0000-0000-000000000003'), 0::bigint, 'Failed insert leaves no partial recipients');
select is((select status from public.admin_emails where id='ee120000-0000-0000-0000-000000000003'), 'draft', 'Failed insert leaves the draft editable');
select throws_ok($$ select pg_temp.queue_test(4, 1,
  '[{"recipient_email":"good@example.org"},{"recipient_email":"bad@example.org","user_id":"ee119999-0000-0000-0000-000000000099"}]') $$,
  '23503', 'insert or update on table "admin_email_recipients" violates foreign key constraint "admin_email_recipients_user_id_fkey"', 'Deleted recipients roll back the whole queue operation');
select is((select count(*) from public.admin_email_recipients where email_id='ee120000-0000-0000-0000-000000000004'), 0::bigint, 'Foreign-key failure leaves no partial snapshot');

update public.competition_metadata set is_current=false where competition_id=1911000001;
select throws_ok($$ select pg_temp.queue_test(5) $$, 'P0001', 'email_competition_changed', 'Missing current competition blocks queueing');
update public.competition_metadata set is_current=true where competition_id=1911000001;
insert into public.competition_metadata(competition_id, start_date, is_current) values(1911000002, '2027-11-15', true);
select throws_ok($$ select pg_temp.queue_test(5) $$, 'P0001', 'email_competition_changed', 'Ambiguous current competition blocks queueing');
delete from public.competition_metadata where competition_id=1911000002;

select is((pg_temp.queue_test(6, 1, (select jsonb_agg(jsonb_build_object('recipient_email', 'bulk-'||i||'@example.org')) from generate_series(1, 1205) i)))->>'recipient_count',
  '1205', 'RPC inserts the full snapshot beyond the REST row limit');
select is((select count(*) from public.admin_email_recipients where email_id='ee120000-0000-0000-0000-000000000006'), 1205::bigint, 'All snapshot rows persist together');

select * from finish();
rollback;
