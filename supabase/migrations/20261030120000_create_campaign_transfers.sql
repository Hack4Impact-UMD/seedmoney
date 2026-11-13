-- Campaign ownership transfer invitations.
-- Sending an invitation never changes ownership; only accept_campaign_transfer does.
-- A pending invitation whose expires_at has passed counts as expired, even before
-- its status is updated, and does not block account deletion.

create type public.campaign_transfer_status as enum (
  'pending',
  'accepted',
  'cancelled',
  'expired'
);

create table public.campaign_transfers (
  transfer_id uuid primary key default gen_random_uuid(),
  campaign_id bigint not null references public.campaigns(campaign_id) on update cascade on delete cascade,
  inviter_id uuid not null references public.users(id) on delete cascade,
  recipient_email text not null,
  token_hash text not null unique,
  status public.campaign_transfer_status not null default 'pending',
  sent_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references public.users(id) on delete cascade,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  constraint campaign_transfers_recipient_email_lowercase
    check (recipient_email = lower(btrim(recipient_email)))
);

create unique index campaign_transfers_one_pending_per_campaign
  on public.campaign_transfers (campaign_id)
  where status = 'pending';

create index campaign_transfers_inviter_id_idx
  on public.campaign_transfers (inviter_id);

create index campaign_transfers_recipient_email_idx
  on public.campaign_transfers (recipient_email);

alter table public.campaign_transfers enable row level security;

-- Writes go through server actions (service role) and accept_campaign_transfer.
-- Browser clients may only read, and never the token hash.
revoke all on table public.campaign_transfers from anon, authenticated;
grant select (
  transfer_id,
  campaign_id,
  inviter_id,
  recipient_email,
  status,
  sent_at,
  expires_at,
  accepted_at,
  accepted_by,
  cancelled_at,
  created_at
) on public.campaign_transfers to authenticated;

create policy "Inviters and admins can view campaign transfers"
  on public.campaign_transfers
  as permissive
  for select
  to authenticated
  using (
    inviter_id = auth.uid()
    or (select public.is_in_app_admin())
  );

set check_function_bodies = off;

-- Accepts a transfer for the signed-in user. Returns one of:
-- accepted, not_found, expired, cancelled, already_accepted,
-- email_mismatch, invalid, profile_missing.
create or replace function public.accept_campaign_transfer(p_token text)
returns table (result text, campaign_id bigint)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  transfer public.campaign_transfers;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_token is null or btrim(p_token) = '' then
    return query select 'not_found'::text, null::bigint;
    return;
  end if;

  select ct.*
  into transfer
  from public.campaign_transfers ct
  where ct.token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
  for update;

  if not found then
    return query select 'not_found'::text, null::bigint;
    return;
  end if;

  if transfer.status = 'accepted' then
    return query select 'already_accepted'::text, transfer.campaign_id;
    return;
  end if;

  if transfer.status = 'cancelled' then
    return query select 'cancelled'::text, transfer.campaign_id;
    return;
  end if;

  if transfer.status = 'expired' or transfer.expires_at <= now() then
    update public.campaign_transfers ct
    set status = 'expired'
    where ct.transfer_id = transfer.transfer_id
      and ct.status = 'pending';

    return query select 'expired'::text, transfer.campaign_id;
    return;
  end if;

  select lower(btrim(au.email))
  into current_email
  from auth.users au
  where au.id = current_user_id
    and au.email_confirmed_at is not null;

  if current_email is null or current_email <> transfer.recipient_email then
    return query select 'email_mismatch'::text, transfer.campaign_id;
    return;
  end if;

  if transfer.inviter_id = current_user_id
    or not exists (
      select 1
      from public.campaign_members cm
      where cm.campaign_id = transfer.campaign_id
        and cm.user_id = transfer.inviter_id
        and cm.role = 'campaign_leader'
    ) then
    return query select 'invalid'::text, transfer.campaign_id;
    return;
  end if;

  if not exists (select 1 from public.users u where u.id = current_user_id) then
    return query select 'profile_missing'::text, transfer.campaign_id;
    return;
  end if;

  insert into public.campaign_members (campaign_id, user_id, role)
  values (transfer.campaign_id, current_user_id, 'campaign_leader')
  on conflict on constraint campaign_members_pkey
  do update set role = 'campaign_leader';

  delete from public.campaign_members cm
  where cm.campaign_id = transfer.campaign_id
    and cm.user_id = transfer.inviter_id;

  update public.campaign_transfers ct
  set status = 'accepted',
      accepted_at = now(),
      accepted_by = current_user_id
  where ct.transfer_id = transfer.transfer_id;

  return query select 'accepted'::text, transfer.campaign_id;
end;
$function$;

revoke execute on function public.accept_campaign_transfer(text) from public, anon;
grant execute on function public.accept_campaign_transfer(text) to authenticated;
