alter table "public"."campaign_members" drop constraint "campaign_members_user_id_fkey";

alter table "public"."campaign_members" drop constraint "campaign_members_pkey";

drop index if exists "public"."campaign_members_pkey";

CREATE UNIQUE INDEX campaign_members_pkey ON public.campaign_members USING btree (campaign_id, user_id);

alter table "public"."campaign_members" add constraint "campaign_members_pkey" PRIMARY KEY using index "campaign_members_pkey";

alter table "public"."campaign_members" add constraint "campaign_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."campaign_members" validate constraint "campaign_members_user_id_fkey";
