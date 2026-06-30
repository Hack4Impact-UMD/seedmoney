set check_function_bodies = off;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
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
    coalesce(
      nullif(new.raw_user_meta_data->>'first_name', ''),
      nullif(new.raw_user_meta_data->>'given_name', ''),
      nullif(split_part(coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        ''
      ), ' ', 1), '')
    ),
    nullif(new.raw_user_meta_data->>'middle_name', ''),
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
    nullif(new.raw_user_meta_data->>'phone_number', ''),
    false
  )
  on conflict (id) do update set
    first_name   = excluded.first_name,
    middle_name  = excluded.middle_name,
    last_name    = excluded.last_name,
    email        = excluded.email,
    phone_number = excluded.phone_number;

  return new;
end;
$function$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_confirmed_after_insert on auth.users;
drop trigger if exists on_auth_user_confirmed_after_update on auth.users;

create trigger on_auth_user_confirmed_after_insert
after insert on auth.users
for each row
when (new.email_confirmed_at is not null)
execute procedure public.handle_new_user();

create trigger on_auth_user_confirmed_after_update
after update of email_confirmed_at, email on auth.users
for each row
when (
  new.email_confirmed_at is not null
  and (
    old.email_confirmed_at is null
    or old.email is distinct from new.email
  )
)
execute procedure public.handle_new_user();
