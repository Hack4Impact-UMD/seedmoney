drop policy if exists "Members can create answers for in-progress campaigns and admins" on "public"."answers";
drop policy if exists "Members can create answers for in-progress or pending campaigns and admins" on "public"."answers";

create policy "Members can create answers for in-progress or pending campaigns and admins"
on "public"."answers"
as permissive
for insert
to public
with check (
  ((select public.is_in_app_admin()) or (
    exists (
      select 1
      from public.campaign_members cm
      join public.campaigns c on c.campaign_id = cm.campaign_id
      where cm.campaign_id = answers.campaign_id
        and cm.user_id = auth.uid()
        and c.status in ('in_progress'::public.status, 'pending'::public.status)
    )
    and exists (
      select 1
      from public.questions q
      where q.question_id = answers.question_id
        and q.is_active = true
    )
  ))
);

drop policy if exists "Members can update answers for in-progress campaigns and admins" on "public"."answers";
drop policy if exists "Members can update answers for in-progress or pending campaigns and admins" on "public"."answers";

create policy "Members can update answers for in-progress or pending campaigns and admins"
on "public"."answers"
as permissive
for update
to authenticated
using (
  ((select public.is_in_app_admin()) or exists (
    select 1
    from public.campaign_members cm
    join public.campaigns c on c.campaign_id = cm.campaign_id
    where cm.campaign_id = answers.campaign_id
      and cm.user_id = auth.uid()
      and c.status in ('in_progress'::public.status, 'pending'::public.status)
  ))
)
with check (
  ((select public.is_in_app_admin()) or exists (
    select 1
    from public.campaign_members cm
    join public.campaigns c on c.campaign_id = cm.campaign_id
    where cm.campaign_id = answers.campaign_id
      and cm.user_id = auth.uid()
      and c.status in ('in_progress'::public.status, 'pending'::public.status)
  ))
);
