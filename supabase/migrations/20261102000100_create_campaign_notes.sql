-- Admin-only internal notes, one per campaign.
create table public.campaign_notes (
  campaign_id bigint primary key
    references public.campaigns (campaign_id) on delete cascade,
  note text not null,
  updated_by uuid references public.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.campaign_notes_set_updated()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger campaign_notes_set_updated
before update on public.campaign_notes
for each row execute function public.campaign_notes_set_updated();

alter table public.campaign_notes enable row level security;

revoke all on public.campaign_notes from anon, public;
grant select, insert, update, delete on public.campaign_notes to authenticated;

create policy "Admins can read campaign notes"
on public.campaign_notes
for select
to authenticated
using ((select public.is_in_app_admin()));

create policy "Admins can create campaign notes"
on public.campaign_notes
for insert
to authenticated
with check ((select public.is_in_app_admin()));

create policy "Admins can update campaign notes"
on public.campaign_notes
for update
to authenticated
using ((select public.is_in_app_admin()))
with check ((select public.is_in_app_admin()));

create policy "Admins can delete campaign notes"
on public.campaign_notes
for delete
to authenticated
using ((select public.is_in_app_admin()));

-- Places exactly one campaign on hold and, optionally, saves its note in the
-- same transaction. The scalar bigint parameter means a list of IDs is rejected.
-- Security invoker: the caller's RLS on campaigns and campaign_notes still applies.
create or replace function public.hold_campaign(
  p_campaign_id bigint,
  p_note text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_status public.status;
begin
  if not public.is_in_app_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select c.status into v_status
  from public.campaigns c
  where c.campaign_id = p_campaign_id
  for update;

  if not found then
    raise exception 'Campaign % was not found', p_campaign_id using errcode = 'P0002';
  end if;

  if v_status not in ('pending'::public.status, 'denied'::public.status) then
    raise exception 'Campaign % cannot be placed on hold from status %', p_campaign_id, v_status
      using errcode = '22023';
  end if;

  update public.campaigns
  set status = 'on_hold'::public.status
  where campaign_id = p_campaign_id;

  if p_note is not null and btrim(p_note) <> '' then
    insert into public.campaign_notes (campaign_id, note)
    values (p_campaign_id, btrim(p_note))
    on conflict (campaign_id) do update set note = excluded.note;
  end if;
end;
$$;

revoke all on function public.hold_campaign(bigint, text) from public, anon;
grant execute on function public.hold_campaign(bigint, text) to authenticated;
