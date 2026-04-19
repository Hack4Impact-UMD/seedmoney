alter table "public"."campaigns" alter column "size" set default '""'::text;

alter table "public"."campaigns" alter column "size" set not null;

alter table "public"."campaigns" alter column "size" set data type text using "size"::text;


