alter table "public"."answers" enable row level security;

alter table "public"."campaign_image_records" enable row level security;

alter table "public"."campaign_members" enable row level security;

alter table "public"."campaigns" enable row level security;

alter table "public"."users" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_in_app_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce((
    select u.is_admin
    from public.users u
    where u.id = auth.uid()
  ), false);
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_user_admin_self_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- normal users cannot change admin status
  if old.is_admin is distinct from new.is_admin
     and not (select public.is_in_app_admin()) then
    raise exception 'You are not allowed to change is_admin';
  end if;

  -- normal users should not change their own id
  if old.id is distinct from new.id then
    raise exception 'You are not allowed to change user id';
  end if;

  -- normal users should not change created_at
  if old.created_at is distinct from new.created_at then
    raise exception 'You are not allowed to change created_at';
  end if;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin
  insert into public.users (
    id,
    created_at,
    first_name,
    middle_name,
    last_name,
    email,
    phone_number,
    is_admin
  )
  values (
    new.id,
    new.created_at,

    /* first_name */
    coalesce(
      nullif(new.raw_user_meta_data->>'first_name', ''),
      nullif(new.raw_user_meta_data->>'given_name', ''),
      nullif(split_part(coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        ''
      ), ' ', 1), '')
    ),

    /* middle_name */
    nullif(new.raw_user_meta_data->>'middle_name', ''),

    /* last_name */
    coalesce(
      nullif(new.raw_user_meta_data->>'last_name', ''),
      nullif(new.raw_user_meta_data->>'family_name', ''),
      nullif(
        case
          when strpos(trim(coalesce(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            ''
          )), ' ') > 0
          then regexp_replace(
            trim(coalesce(
              new.raw_user_meta_data->>'full_name',
              new.raw_user_meta_data->>'name',
              ''
            )),
            '^.*\s+',
            ''
          )
          else null
        end,
        ''
      )
    ),

    new.email,

    coalesce(
      nullif(new.raw_user_meta_data->>'phone_number', ''),
      null
    ),

    false
  )
  on conflict (id) do update set
    first_name   = excluded.first_name,
    middle_name  = excluded.middle_name,
    last_name    = excluded.last_name,
    email        = excluded.email,
    phone_number = excluded.phone_number;

  return new;
end;$function$
;


  create policy "Users can add themselves as first campaign member"
  on "public"."campaign_members"
  as permissive
  for insert
  to public
with check (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.campaign_id = campaign_members.campaign_id) AND (c.status = 'in_progress'::public.status)))) AND (NOT (EXISTS ( SELECT 1
   FROM public.campaign_members cm
  WHERE (cm.campaign_id = campaign_members.campaign_id))))));



  create policy "Users can view own campaign memberships and admins can view all"
  on "public"."campaign_members"
  as permissive
  for select
  to authenticated
using (((user_id = auth.uid()) OR ( SELECT public.is_in_app_admin() AS is_in_app_admin)));



  create policy "Authenticated users can create in-progress campaigns"
  on "public"."campaigns"
  as permissive
  for insert
  to authenticated
with check ((status = 'in_progress'::public.status));



  create policy "Members and admins can view campaigns"
  on "public"."campaigns"
  as permissive
  for select
  to authenticated
using ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM public.campaign_members cm
  WHERE ((cm.campaign_id = campaigns.campaign_id) AND (cm.user_id = auth.uid()))))));



  create policy "Members can edit in-progress campaigns and admins can edit all"
  on "public"."campaigns"
  as permissive
  for update
  to authenticated
using ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR ((status = 'in_progress'::public.status) AND (EXISTS ( SELECT 1
   FROM public.campaign_members cm
  WHERE ((cm.campaign_id = campaigns.campaign_id) AND (cm.user_id = auth.uid())))))))
with check ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR ((status = ANY (ARRAY['in_progress'::public.status, 'pending'::public.status])) AND (EXISTS ( SELECT 1
   FROM public.campaign_members cm
  WHERE ((cm.campaign_id = campaigns.campaign_id) AND (cm.user_id = auth.uid())))))));



  create policy "Admins can update users"
  on "public"."users"
  as permissive
  for update
  to authenticated
using (( SELECT public.is_in_app_admin() AS is_in_app_admin))
with check (( SELECT public.is_in_app_admin() AS is_in_app_admin));



  create policy "Admins can view all users"
  on "public"."users"
  as permissive
  for select
  to authenticated
using (( SELECT public.is_in_app_admin() AS is_in_app_admin));



  create policy "Users can update their own basic info and admins can update all"
  on "public"."users"
  as permissive
  for update
  to authenticated
using (((auth.uid() = id) OR ( SELECT public.is_in_app_admin() AS is_in_app_admin)))
with check (((auth.uid() = id) OR ( SELECT public.is_in_app_admin() AS is_in_app_admin)));



  create policy "Users can view their own user row"
  on "public"."users"
  as permissive
  for select
  to authenticated
using ((auth.uid() = id));


CREATE TRIGGER prevent_user_admin_self_update_trigger BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.prevent_user_admin_self_update();


