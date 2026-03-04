set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  insert into public.users (id, created_at, first_name, middle_name, last_name, email, phone_number, is_admin)
  values (
    new.id,
    new.created_at,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'middle_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    new.raw_user_meta_data->>'phone_number',
    false
  )
  on conflict (id) do update set
    first_name   = excluded.first_name,
    middle_name  = excluded.middle_name,
    last_name    = excluded.last_name,
    email        = excluded.email,
    phone_number = excluded.phone_number,
    is_admin     = excluded.is_admin;
  
  return new;
end;
$function$
;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


