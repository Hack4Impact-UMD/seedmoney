drop policy "Users can add themselves as first campaign member" on "public"."campaign_members";

alter table "public"."competition_metadata" enable row level security;

alter table "public"."questions" enable row level security;

alter table "public"."transactions" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.prevent_normal_user_answer_field_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if (select public.is_in_app_admin()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.ai_answer is not null then
      raise exception 'Users cannot set ai_answer';
    end if;

    if new.final_answer is not null then
      raise exception 'Users cannot set final_answer';
    end if;

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

    if old.ai_answer is distinct from new.ai_answer then
      raise exception 'Users cannot change ai_answer';
    end if;

    if old.final_answer is distinct from new.final_answer then
      raise exception 'Users cannot change final_answer';
    end if;

    return new;
  end if;

  return new;
end;
$function$
;


  create policy "Members and admins can view answers"
  on "public"."answers"
  as permissive
  for select
  to authenticated
using ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM public.campaign_members cm
  WHERE ((cm.campaign_id = answers.campaign_id) AND (cm.user_id = auth.uid()))))));



  create policy "Members can create answers for in-progress campaigns and admins"
  on "public"."answers"
  as permissive
  for insert
  to public
with check ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR ((EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = answers.campaign_id) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status)))) AND (EXISTS ( SELECT 1
   FROM public.questions q
  WHERE ((q.question_id = answers.question_id) AND (q.is_active = true)))))));



  create policy "Members can update answers for in-progress campaigns and admins"
  on "public"."answers"
  as permissive
  for update
  to authenticated
using ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = answers.campaign_id) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status))))))
with check ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = answers.campaign_id) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status))))));



  create policy "Members can add images to in-progress campaigns and admins can "
  on "public"."campaign_image_records"
  as permissive
  for insert
  to authenticated
with check ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = campaign_image_records.campaign_id) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status))))));



  create policy "Members can delete in-progress campaign images and admins can d"
  on "public"."campaign_image_records"
  as permissive
  for delete
  to authenticated
using ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = campaign_image_records.campaign_id) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status))))));



  create policy "Members can update in-progress campaign images and admins can u"
  on "public"."campaign_image_records"
  as permissive
  for update
  to authenticated
using ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = campaign_image_records.campaign_id) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status))))))
with check ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = campaign_image_records.campaign_id) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status))))));



  create policy "Members can view in-progress campaign images and admins can vie"
  on "public"."campaign_image_records"
  as permissive
  for select
  to authenticated
using ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = campaign_image_records.campaign_id) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status))))));



  create policy "Admins can delete campaigns"
  on "public"."campaigns"
  as permissive
  for delete
  to authenticated
using (( SELECT public.is_in_app_admin() AS is_in_app_admin));



  create policy "Admins can create competition metadata"
  on "public"."competition_metadata"
  as permissive
  for insert
  to authenticated
with check (( SELECT public.is_in_app_admin() AS is_in_app_admin));



  create policy "Admins can delete competition metadata"
  on "public"."competition_metadata"
  as permissive
  for delete
  to authenticated
using (( SELECT public.is_in_app_admin() AS is_in_app_admin));



  create policy "Admins can update competition metadata"
  on "public"."competition_metadata"
  as permissive
  for update
  to authenticated
using (( SELECT public.is_in_app_admin() AS is_in_app_admin))
with check (( SELECT public.is_in_app_admin() AS is_in_app_admin));



  create policy "Anyone can view competition metadata"
  on "public"."competition_metadata"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Admins can delete questions"
  on "public"."questions"
  as permissive
  for delete
  to authenticated
using (( SELECT public.is_in_app_admin() AS is_in_app_admin));



  create policy "Admins can update questions"
  on "public"."questions"
  as permissive
  for update
  to authenticated
using (( SELECT public.is_in_app_admin() AS is_in_app_admin))
with check (( SELECT public.is_in_app_admin() AS is_in_app_admin));



  create policy "Users can view active questions and admins can view all"
  on "public"."questions"
  as permissive
  for select
  to authenticated
using (((is_active = true) OR ( SELECT public.is_in_app_admin() AS is_in_app_admin)));



  create policy "Members and admins can view transactions"
  on "public"."transactions"
  as permissive
  for select
  to authenticated
using ((( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM public.campaign_members cm
  WHERE ((cm.campaign_id = transactions.campaign_id) AND (cm.user_id = auth.uid()))))));



  create policy "Users can add themselves as first campaign member"
  on "public"."campaign_members"
  as permissive
  for insert
  to authenticated
with check (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.campaign_id = campaign_members.campaign_id) AND (c.status = 'in_progress'::public.status)))) AND (NOT (EXISTS ( SELECT 1
   FROM public.campaign_members cm
  WHERE (cm.campaign_id = campaign_members.campaign_id))))));


CREATE TRIGGER prevent_normal_user_answer_field_changes_trigger BEFORE INSERT OR UPDATE ON public.answers FOR EACH ROW EXECUTE FUNCTION public.prevent_normal_user_answer_field_changes();

drop policy "Give users authenticated access to folder 1052rgn_0" on "storage"."objects";

drop policy "Give users authenticated access to folder 1052rgn_1" on "storage"."objects";

drop policy "Give users authenticated access to folder 1052rgn_2" on "storage"."objects";

drop policy "Give users authenticated access to folder 1052rgn_3" on "storage"."objects";


  create policy "Members and admins can delete images respectively 1052rgn_0"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'campaign_images'::text) AND (name ~ '^campaigns/[0-9]+/'::text) AND (( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = (split_part(objects.name, '/'::text, 2))::integer) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status)))))));



  create policy "Members and admins can read respective images 1052rgn_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'campaign_images'::text) AND (name ~ '^campaigns/[0-9]+/'::text) AND (( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = (split_part(objects.name, '/'::text, 2))::integer) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status)))))));



  create policy "Members and admins can update images 1052rgn_0"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'campaign_images'::text) AND (name ~ '^campaigns/[0-9]+/'::text) AND (( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = (split_part(objects.name, '/'::text, 2))::integer) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status)))))));



  create policy "Members and admins can upload images 1052rgn_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'campaign_images'::text) AND (name ~ '^campaigns/[0-9]+/'::text) AND (( SELECT public.is_in_app_admin() AS is_in_app_admin) OR (EXISTS ( SELECT 1
   FROM (public.campaign_members cm
     JOIN public.campaigns c ON ((c.campaign_id = cm.campaign_id)))
  WHERE ((cm.campaign_id = (split_part(objects.name, '/'::text, 2))::integer) AND (cm.user_id = auth.uid()) AND (c.status = 'in_progress'::public.status)))))));



