alter table "public"."campaign_members" alter column "user_id" set default auth.uid();

alter table "public"."campaign_members" alter column "user_id" drop identity;

alter table "public"."campaign_members" alter column "user_id" set data type uuid using "user_id"::uuid;

alter table "public"."users" alter column "id" set default auth.uid();

alter table "public"."users" alter column "id" drop identity;

alter table "public"."users" alter column "id" set data type uuid using "id"::uuid;


