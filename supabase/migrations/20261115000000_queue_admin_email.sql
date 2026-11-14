begin;

-- Private commit boundary. The server must validate content and resolve recipients
-- before calling this; browsers cannot execute it or submit arbitrary snapshots.
create function public.queue_admin_email(
  p_email_id uuid,
  p_actor_id uuid,
  p_expected_version bigint,
  p_competition_id bigint,
  p_subject text,
  p_body_html text,
  p_recipient_groups text[],
  p_recipients jsonb
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  draft public.admin_emails%rowtype;
  inserted_count bigint;
begin
  if not exists (select 1 from public.users u where u.id = p_actor_id and u.is_admin is true) then
    raise exception using errcode = '42501', message = 'Not authorized';
  end if;
  if p_expected_version is null or p_expected_version < 1 then
    raise exception 'email_draft_conflict';
  end if;

  select e.* into draft from public.admin_emails e
  where e.id = p_email_id and e.created_by = p_actor_id
  for update;
  if not found then
    raise exception 'email_draft_conflict';
  end if;

  if draft.status <> 'draft' then
    if draft.queued_at is null then raise exception 'email_draft_conflict'; end if;
    return jsonb_build_object('email_id', draft.id, 'status', draft.status,
      'recipient_count', (select count(*) from public.admin_email_recipients r where r.email_id = draft.id),
      'already_queued', true);
  end if;

  if draft.version <> p_expected_version or
    draft.competition_id is distinct from p_competition_id or
    draft.subject is distinct from p_subject or
    draft.body_html is distinct from p_body_html or
    draft.recipient_groups is distinct from p_recipient_groups then
    raise exception 'email_draft_conflict';
  end if;
  if p_competition_id is null or not (select count(*) = 1 and min(c.competition_id) = p_competition_id
    from public.competition_metadata c where c.is_current is true) then
    raise exception 'email_competition_changed';
  end if;
  if p_subject is null or btrim(p_subject) = '' or length(p_subject) > 1000 or
    p_body_html is null or btrim(p_body_html) = '' or octet_length(p_body_html) > 500000 or
    coalesce(cardinality(p_recipient_groups), 0) = 0 or
    jsonb_typeof(p_recipients) is distinct from 'array' then
    raise exception 'email_snapshot_invalid';
  end if;
  if jsonb_array_length(p_recipients) = 0 or exists (
    select 1 from public.admin_email_recipients r where r.email_id = draft.id
  ) then
    raise exception 'email_snapshot_invalid';
  end if;

  insert into public.admin_email_recipients
    (email_id, user_id, campaign_id, recipient_email, first_name, campaign_url, status)
  select draft.id, r.user_id, r.campaign_id, btrim(r.recipient_email),
    coalesce(r.first_name, ''), nullif(btrim(r.campaign_url), ''), 'pending'
  from jsonb_to_recordset(p_recipients) as r(
    user_id uuid, campaign_id bigint, recipient_email text, first_name text, campaign_url text
  );
  get diagnostics inserted_count = row_count;

  update public.admin_emails e
  set status = 'queued', queued_at = now(), completed_at = null, last_error = null
  where e.id = draft.id;

  return jsonb_build_object('email_id', draft.id, 'status', 'queued',
    'recipient_count', inserted_count, 'already_queued', false);
end;
$$;

revoke all on function public.queue_admin_email(uuid, uuid, bigint, bigint, text, text, text[], jsonb)
  from public, anon, authenticated;
grant execute on function public.queue_admin_email(uuid, uuid, bigint, bigint, text, text, text[], jsonb)
  to service_role;

commit;
