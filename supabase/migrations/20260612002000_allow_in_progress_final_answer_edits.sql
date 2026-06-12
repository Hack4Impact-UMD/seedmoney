set check_function_bodies = off;

create or replace function public.prevent_normal_user_answer_field_changes()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  can_edit_final_answer boolean;
begin
  if (select public.is_in_app_admin()) then
    return new;
  end if;

  select exists (
    select 1
    from public.campaign_members cm
    join public.campaigns c on c.campaign_id = cm.campaign_id
    where cm.campaign_id = new.campaign_id
      and cm.user_id = auth.uid()
      and c.status = 'in_progress'::public.status
  )
  into can_edit_final_answer;

  if tg_op = 'INSERT' then
    if new.ai_answer is not null then
      raise exception 'Users cannot set ai_answer';
    end if;

    if new.final_answer is not null and not can_edit_final_answer then
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

    if old.final_answer is distinct from new.final_answer and not can_edit_final_answer then
      raise exception 'Users cannot change final_answer';
    end if;

    return new;
  end if;

  return new;
end;
$function$;
