update public.campaigns as campaign
set contact_email = leader.email
from (
  select distinct on (member.campaign_id)
    member.campaign_id,
    nullif(trim(account.email), '') as email
  from public.campaign_members as member
  join public.users as account on account.id = member.user_id
  where member.role = 'campaign_leader'
  order by
    member.campaign_id,
    lower(account.first_name || ' ' || account.last_name),
    account.id
) as leader
where campaign.campaign_id = leader.campaign_id
  and leader.email is not null
  and campaign.contact_email is distinct from leader.email;

create or replace function public.sync_campaign_contact_email_to_leader()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  leader_email text;
begin
  select account.email
    into leader_email
  from public.campaign_members as member
  join public.users as account on account.id = member.user_id
  where member.campaign_id = new.campaign_id
    and member.role = 'campaign_leader'
  order by lower(account.first_name || ' ' || account.last_name), account.id
  limit 1;

  if nullif(trim(leader_email), '') is not null then
    new.contact_email := leader_email;
  end if;

  return new;
end;
$function$;

drop trigger if exists campaigns_sync_contact_email_to_leader on public.campaigns;
create trigger campaigns_sync_contact_email_to_leader
before update of contact_email on public.campaigns
for each row
execute function public.sync_campaign_contact_email_to_leader();

create or replace function public.sync_campaign_contact_email_after_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  if new.email is distinct from old.email then
    update public.campaigns as campaign
    set contact_email = new.email
    from public.campaign_members as member
    where member.campaign_id = campaign.campaign_id
      and member.user_id = new.id
      and member.role = 'campaign_leader'
      and nullif(trim(new.email), '') is not null;
  end if;

  return new;
end;
$function$;

drop trigger if exists users_sync_campaign_contact_email on public.users;
create trigger users_sync_campaign_contact_email
after update of email on public.users
for each row
execute function public.sync_campaign_contact_email_after_user_email_change();