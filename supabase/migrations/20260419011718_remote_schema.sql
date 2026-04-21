alter type "public"."status" rename to "status__old_version_to_be_dropped";

create type "public"."status" as enum ('submitted_under_review', 'approved', 'not_approved', 'in_progress', 'published', 'archived');

alter table "public"."campaigns" alter column status type "public"."status" using status::text::"public"."status";

drop type "public"."status__old_version_to_be_dropped";


