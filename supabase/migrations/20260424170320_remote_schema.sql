alter type "public"."status" rename to "status__old_version_to_be_dropped";

create type "public"."status" as enum ('pending', 'approved', 'denied', 'in_progress', 'published', 'archived', 'publish_failed');

alter table "public"."campaigns" alter column status type "public"."status" using status::text::"public"."status";

drop type "public"."status__old_version_to_be_dropped";

alter table "public"."campaigns" alter column "size" set default '""'::text;


