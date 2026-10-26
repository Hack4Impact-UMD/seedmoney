drop view if exists "public"."leaderboard_transactions";

alter type "public"."status" rename to "status__old_version_to_be_dropped";

create type "public"."status" as enum ('pending', 'approved', 'denied', 'in_progress', 'published', 'archived', 'publish_failed', 'suspended');

alter table "public"."campaigns" alter column status type "public"."status" using status::text::"public"."status";

drop type "public"."status__old_version_to_be_dropped";

set check_function_bodies = off;

create or replace view "public"."leaderboard_transactions" as  SELECT t.campaign_id,
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

CREATE TRIGGER protect_bucket_control_insert BEFORE INSERT ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns('service_role');

CREATE TRIGGER protect_bucket_control_update BEFORE UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns();

CREATE TRIGGER protect_bucket_control_update_role AFTER UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_lifecycle_service_role('service_role');


