-- Applicants see an on-hold campaign exactly like a pending one, so members
-- keep the same image-read and answer-write access they have while pending.
--
-- Policy names are the ones Postgres actually stored: identifiers longer than
-- 63 characters are truncated, and the Storage dashboard appends a suffix
-- (e.g. "1052rgn_0") to policies created there.

alter policy "Members can view in-progress campaign images and admins can vie"
on public.campaign_image_records
using (
  (select public.is_in_app_admin())
  or exists (
    select 1
    from public.campaign_members cm
    join public.campaigns c on c.campaign_id = cm.campaign_id
    where cm.campaign_id = campaign_image_records.campaign_id
      and cm.user_id = auth.uid()
      and c.status in (
        'in_progress'::public.status,
        'pending'::public.status,
        'on_hold'::public.status
      )
  )
);

alter policy "Members and admins can read respective images 1052rgn_0"
on storage.objects
using (
  bucket_id = 'campaign_images'::text
  and name ~ '^campaigns/[0-9]+/'::text
  and (
    (select public.is_in_app_admin())
    or exists (
      select 1
      from public.campaign_members cm
      join public.campaigns c on c.campaign_id = cm.campaign_id
      where cm.campaign_id = (split_part(objects.name, '/'::text, 2))::integer
        and cm.user_id = auth.uid()
        and c.status in (
          'in_progress'::public.status,
          'pending'::public.status,
          'on_hold'::public.status
        )
    )
  )
);

alter policy "Members can create answers for in-progress or pending campaigns"
on public.answers
with check (
  ((select public.is_in_app_admin()) or (
    exists (
      select 1
      from public.campaign_members cm
      join public.campaigns c on c.campaign_id = cm.campaign_id
      where cm.campaign_id = answers.campaign_id
        and cm.user_id = auth.uid()
        and c.status in (
          'in_progress'::public.status,
          'pending'::public.status,
          'on_hold'::public.status
        )
    )
    and exists (
      select 1
      from public.questions q
      where q.question_id = answers.question_id
        and q.is_active = true
    )
  ))
);

alter policy "Members can update answers for in-progress or pending campaigns"
on public.answers
using (
  ((select public.is_in_app_admin()) or exists (
    select 1
    from public.campaign_members cm
    join public.campaigns c on c.campaign_id = cm.campaign_id
    where cm.campaign_id = answers.campaign_id
      and cm.user_id = auth.uid()
      and c.status in (
        'in_progress'::public.status,
        'pending'::public.status,
        'on_hold'::public.status
      )
  ))
)
with check (
  ((select public.is_in_app_admin()) or exists (
    select 1
    from public.campaign_members cm
    join public.campaigns c on c.campaign_id = cm.campaign_id
    where cm.campaign_id = answers.campaign_id
      and cm.user_id = auth.uid()
      and c.status in (
        'in_progress'::public.status,
        'pending'::public.status,
        'on_hold'::public.status
      )
  ))
);
