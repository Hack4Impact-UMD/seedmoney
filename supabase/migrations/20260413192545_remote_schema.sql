set check_function_bodies = off;

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
    phone_number = excluded.phone_number,
    is_admin     = excluded.is_admin;

  return new;
end;$function$
;


