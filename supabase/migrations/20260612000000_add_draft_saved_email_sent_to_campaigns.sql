alter table "public"."campaigns"
add column if not exists "draft_saved_email_sent" boolean not null default false;
