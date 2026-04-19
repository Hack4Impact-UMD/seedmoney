alter table "public"."campaigns" alter column "size" set data type text using "size"::text;

update "public"."campaigns" set "size" = '' where "size" is null;

alter table "public"."campaigns" alter column "size" set default ''::text;

alter table "public"."campaigns" alter column "size" set not null;

