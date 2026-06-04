alter table "public"."transactions"
  add column if not exists "transacted_at" timestamp with time zone;
