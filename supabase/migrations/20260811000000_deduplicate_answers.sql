begin;

lock table public.answers in share row exclusive mode;

-- Keep the newest answer while retaining source fields omitted by admin-only edits.
with duplicate_groups as (
  select
    campaign_id,
    question_id,
    max(answer_id) as survivor_id
  from public.answers
  group by campaign_id, question_id
  having count(*) > 1
),
latest_values as (
  select
    duplicate_groups.survivor_id,
    (
      select answer.pre_ai_answer
      from public.answers as answer
      where answer.campaign_id = duplicate_groups.campaign_id
        and answer.question_id = duplicate_groups.question_id
        and nullif(btrim(answer.pre_ai_answer), '') is not null
      order by answer.answer_id desc
      limit 1
    ) as pre_ai_answer,
    (
      select answer.ai_answer
      from public.answers as answer
      where answer.campaign_id = duplicate_groups.campaign_id
        and answer.question_id = duplicate_groups.question_id
        and nullif(btrim(answer.ai_answer), '') is not null
      order by answer.answer_id desc
      limit 1
    ) as ai_answer,
    (
      select answer.final_answer
      from public.answers as answer
      where answer.campaign_id = duplicate_groups.campaign_id
        and answer.question_id = duplicate_groups.question_id
        and nullif(btrim(answer.final_answer), '') is not null
      order by answer.answer_id desc
      limit 1
    ) as final_answer
  from duplicate_groups
)
update public.answers as survivor
set
  pre_ai_answer = case
    when nullif(btrim(survivor.pre_ai_answer), '') is null
      then coalesce(latest_values.pre_ai_answer, '')
    else survivor.pre_ai_answer
  end,
  ai_answer = case
    when nullif(btrim(survivor.ai_answer), '') is null
      then coalesce(latest_values.ai_answer, '')
    else survivor.ai_answer
  end,
  final_answer = case
    when nullif(btrim(survivor.final_answer), '') is null
      then coalesce(latest_values.final_answer, '')
    else survivor.final_answer
  end
from latest_values
where survivor.answer_id = latest_values.survivor_id;

with duplicate_groups as (
  select
    campaign_id,
    question_id,
    max(answer_id) as survivor_id
  from public.answers
  group by campaign_id, question_id
  having count(*) > 1
)
delete from public.answers as answer
using duplicate_groups
where answer.campaign_id = duplicate_groups.campaign_id
  and answer.question_id = duplicate_groups.question_id
  and answer.answer_id <> duplicate_groups.survivor_id;

alter table public.answers
  add constraint answers_campaign_id_question_id_key
  unique (campaign_id, question_id);

commit;
