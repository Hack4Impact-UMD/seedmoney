alter table "public"."campaigns" add column "user_id" uuid;

alter table "public"."campaigns" add constraint "campaigns_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."campaigns" validate constraint "campaigns_user_id_fkey";


