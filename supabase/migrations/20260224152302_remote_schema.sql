CREATE UNIQUE INDEX answers_pkey ON public.answers USING btree (answer_id);

CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (question_id);

alter table "public"."answers" add constraint "answers_pkey" PRIMARY KEY using index "answers_pkey";

alter table "public"."questions" add constraint "questions_pkey" PRIMARY KEY using index "questions_pkey";

alter table "public"."answers" add constraint "answers_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(campaign_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."answers" validate constraint "answers_campaign_id_fkey";

alter table "public"."answers" add constraint "answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."answers" validate constraint "answers_question_id_fkey";

alter table "public"."campaign_members" add constraint "campaign_members_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(campaign_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."campaign_members" validate constraint "campaign_members_campaign_id_fkey";

alter table "public"."campaign_members" add constraint "campaign_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."campaign_members" validate constraint "campaign_members_user_id_fkey";


