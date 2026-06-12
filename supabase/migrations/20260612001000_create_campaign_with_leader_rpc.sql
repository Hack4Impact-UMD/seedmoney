set check_function_bodies = off;

create or replace function public.create_campaign_with_leader(campaign_data jsonb)
returns public.campaigns
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  current_user_id uuid := auth.uid();
  created_campaign public.campaigns;
  beneficiaries text[];
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if coalesce(campaign_data->>'status', 'in_progress') <> 'in_progress' then
    raise exception 'Campaigns must start in_progress';
  end if;

  if jsonb_typeof(campaign_data->'project_beneficiaries') = 'array' then
    select array_agg(value)
    into beneficiaries
    from jsonb_array_elements_text(campaign_data->'project_beneficiaries') as item(value);
  end if;

  insert into public.campaigns (
    name,
    organization_name,
    givebutterlink,
    givebutter_id,
    givebutter_slug,
    raised,
    donors,
    status,
    date_created,
    street,
    city,
    state,
    country,
    zipcode,
    project_category,
    project_beneficiaries,
    existence,
    impact,
    size,
    goal,
    ein,
    contact_first_name,
    contact_last_name,
    contact_email,
    contact_role,
    mailing_street_1,
    mailing_street_2,
    mailing_city,
    mailing_state,
    mailing_country,
    mailing_zipcode,
    competition_id,
    opt_in_ai
  )
  values (
    campaign_data->>'name',
    campaign_data->>'organization_name',
    campaign_data->>'givebutterlink',
    campaign_data->>'givebutter_id',
    campaign_data->>'givebutter_slug',
    coalesce(nullif(campaign_data->>'raised', '')::bigint, 0),
    coalesce(nullif(campaign_data->>'donors', '')::bigint, 0),
    'in_progress'::public.status,
    campaign_data->>'date_created',
    campaign_data->>'street',
    campaign_data->>'city',
    campaign_data->>'state',
    campaign_data->>'country',
    campaign_data->>'zipcode',
    campaign_data->>'project_category',
    beneficiaries,
    nullif(campaign_data->>'existence', '')::public.existence,
    coalesce(nullif(campaign_data->>'impact', '')::bigint, 0),
    coalesce(campaign_data->>'size', ''),
    coalesce(nullif(campaign_data->>'goal', '')::bigint, 0),
    campaign_data->>'ein',
    campaign_data->>'contact_first_name',
    campaign_data->>'contact_last_name',
    campaign_data->>'contact_email',
    campaign_data->>'contact_role',
    campaign_data->>'mailing_street_1',
    campaign_data->>'mailing_street_2',
    campaign_data->>'mailing_city',
    campaign_data->>'mailing_state',
    campaign_data->>'mailing_country',
    campaign_data->>'mailing_zipcode',
    nullif(campaign_data->>'competition_id', '')::bigint,
    coalesce(nullif(campaign_data->>'opt_in_ai', '')::boolean, false)
  )
  returning *
  into created_campaign;

  insert into public.campaign_members (
    campaign_id,
    user_id,
    role
  )
  values (
    created_campaign.campaign_id,
    current_user_id,
    'campaign_leader'
  );

  return created_campaign;
end;
$function$;

grant execute on function public.create_campaign_with_leader(jsonb) to authenticated;
