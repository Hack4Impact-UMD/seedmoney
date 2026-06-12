set check_function_bodies = off;

create or replace function public.prevent_normal_user_answer_field_changes()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if (select public.is_in_app_admin()) then
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
$function$;
