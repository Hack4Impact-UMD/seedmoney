  create table "public"."competition_standings" (
    "competition_id" bigint not null,
    "campaign_id" bigint not null,
    "raised" numeric not null default '0'::numeric,
    "donation_count" bigint not null default '0'::bigint
      );


alter table "public"."competition_standings" enable row level security;

alter table "public"."competition_metadata" add column "publish_at" timestamp with time zone;

CREATE UNIQUE INDEX competition_standings_pkey ON public.competition_standings USING btree (competition_id, campaign_id);

alter table "public"."competition_standings" add constraint "competition_standings_pkey" PRIMARY KEY using index "competition_standings_pkey";

alter table "public"."competition_standings" add constraint "competition_standings_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(campaign_id) ON DELETE CASCADE not valid;

alter table "public"."competition_standings" validate constraint "competition_standings_campaign_id_fkey";

alter table "public"."competition_standings" add constraint "competition_standings_competition_id_fkey" FOREIGN KEY (competition_id) REFERENCES public.competition_metadata(competition_id) not valid;

alter table "public"."competition_standings" validate constraint "competition_standings_competition_id_fkey";

set check_function_bodies = off;

create or replace view "public"."leaderboard_transactions"
with (security_invoker = on) as  SELECT t.campaign_id,
    t.date,
    t.transacted_at,
    t.amount_donated,
    t.status
   FROM (public.transactions t
     JOIN public.campaigns c ON ((c.campaign_id = t.campaign_id)))
  WHERE (c.status = 'published'::public.status);


CREATE OR REPLACE FUNCTION public.prevent_normal_user_answer_field_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.role() = 'service_role' or (select public.is_in_app_admin()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.answer_id is distinct from new.answer_id then
      raise exception 'Users cannot change answer_id';
    end if;

    if old.campaign_id is distinct from new.campaign_id then
      raise exception 'Users cannot change campaign_id';
    end if;

    if old.question_id is distinct from new.question_id then
      raise exception 'Users cannot change question_id';
    end if;

    return new;
  end if;

  return new;
end;
$function$
;

grant select on table "public"."competition_standings" to "anon";

grant select on table "public"."competition_standings" to "authenticated";

grant delete on table "public"."competition_standings" to "service_role";

grant insert on table "public"."competition_standings" to "service_role";

grant references on table "public"."competition_standings" to "service_role";

grant select on table "public"."competition_standings" to "service_role";

grant trigger on table "public"."competition_standings" to "service_role";

grant truncate on table "public"."competition_standings" to "service_role";

grant update on table "public"."competition_standings" to "service_role";


  create policy "Admins can read all standings"
  on "public"."competition_standings"
  as permissive
  for select
  to authenticated
using (( SELECT public.is_in_app_admin() AS is_in_app_admin));



  create policy "Public can read published campaign standings"
  on "public"."competition_standings"
  as permissive
  for select
  to anon, authenticated
using ((EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.campaign_id = competition_standings.campaign_id) AND (c.competition_id = competition_standings.competition_id) AND (c.status = 'published'::public.status)))));



  create policy "Admins can upload email images"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'email_images'::text) AND ( SELECT public.is_in_app_admin() AS is_in_app_admin)));


CREATE TRIGGER enforce_versioning_status_transition BEFORE UPDATE OF versioning_status ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_versioning_status_transition();

CREATE TRIGGER protect_active_lifecycle_states BEFORE DELETE ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_active_lifecycle_states();

CREATE TRIGGER protect_bucket_control_insert BEFORE INSERT ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns('service_role');

CREATE TRIGGER protect_bucket_control_update BEFORE UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns();

CREATE TRIGGER protect_bucket_control_update_role AFTER UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_lifecycle_service_role('service_role');

CREATE TRIGGER wake_lifecycle_on_policy_write AFTER INSERT OR UPDATE OF lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.wake_lifecycle_state();

CREATE TRIGGER wake_lifecycle_on_versioning_enable AFTER UPDATE OF versioning_status ON storage.buckets FOR EACH ROW WHEN ((new.lifecycle_configuration IS NOT NULL)) EXECUTE FUNCTION storage.wake_lifecycle_state();


