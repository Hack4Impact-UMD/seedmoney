alter table "public"."campaign_members"
  drop constraint if exists "campaign_members_user_id_fkey";
alter table "public"."campaign_members"
  drop constraint if exists "campaign_members_pkey";

alter table "public"."campaign_members" drop column if exists "user_id";
alter table "public"."campaign_members"
  add column "user_id" uuid not null default auth.uid();

alter table "public"."users" drop constraint if exists "users_pkey";
alter table "public"."users" drop column if exists "id";

alter table "public"."users"
  add column "id" uuid not null default auth.uid() primary key references auth.users(id) on delete cascade;

alter table "public"."campaign_members"
  add constraint "campaign_members_user_id_fkey"
  foreign key ("user_id") references "public"."users"("id") on delete cascade;

alter table "public"."campaign_members"
  add constraint "campaign_members_pkey"
  primary key ("user_id", "campaign_id");
