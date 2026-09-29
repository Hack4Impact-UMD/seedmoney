# Current competition audiences

## Source of truth

Use `public.users.email` for applicant and account email. This is the address the
person registered and signs in with. `campaigns.contact_email` is editable
application contact information and must never be used to identify a user,
determine application status, or choose a targeted-email recipient.

Campaign ownership is defined only by:

```text
users.id -> campaign_members.user_id
campaign_members.campaign_id -> campaigns.campaign_id
```

Only a `campaign_members.role` of `campaign_leader` counts as starting or owning
an application. Select the competition by `competition_metadata.is_current`,
then match `campaigns.competition_id` to that exact ID. Do not infer the current
competition from a year.

The admin **List of Users** page applies these rules. Its status counts and CSV
export use account email, leader memberships, and the selected competition ID.
The export includes the current search and status filters and has one row per
account. Admin accounts are excluded.

Under the existing schema, `not_started` means a non-admin account has no leader
campaign in the selected competition. There is no separate competition
registration record for an account that has not started a campaign.

## Status meanings

| Status | Meaning |
| --- | --- |
| `not_started` | Derived audience state: the account has no leader campaign in the selected competition. It is not stored on `campaigns`. |
| `in_progress` | The applicant created a draft and has not submitted it. |
| `pending` | The applicant submitted the application and it is waiting for admin review. |
| `approved` | An admin approved the application and its unpublished Givebutter campaign was created successfully. |
| `denied` | An admin denied the application. An admin may return it to `pending`. |
| `published` | The Givebutter campaign was published and the local launch update succeeded. |
| `publish_failed` | Givebutter campaign creation or publication failed and requires retry or review. |
| `archived` | Historical display state. The current UI presents approved campaigns from a previous competition as archived; no production write currently assigns this status. |

A user can lead multiple campaigns in one competition. Status-specific counts
count that account once for each status it has, so those counts can overlap.
`not_started` is exclusive because it requires zero campaigns.

## External sends

If a send is prepared outside the app, use this query as the starting audience.
Filter the result by `statuses` only after checking the counts and several known
accounts. The query intentionally does not read `campaigns.contact_email`.

```sql
with current_competition as (
  select competition_id
  from public.competition_metadata
  where is_current is true
  order by start_date desc
  limit 1
)
select
  u.id as user_id,
  u.email as account_email,
  u.first_name,
  u.last_name,
  coalesce(
    string_agg(
      distinct c.status::text,
      ';' order by c.status::text
    ) filter (where c.campaign_id is not null),
    'not_started'
  ) as statuses,
  array_remove(array_agg(distinct c.campaign_id), null) as campaign_ids
from public.users u
cross join current_competition current
left join public.campaign_members cm
  on cm.user_id = u.id
 and cm.role = 'campaign_leader'
left join public.campaigns c
  on c.campaign_id = cm.campaign_id
 and c.competition_id = current.competition_id
where u.is_admin is false
group by u.id, u.email, u.first_name, u.last_name
order by u.email;
```

Before sending, verify the exported row count, confirm that known approved users
do not appear as `not_started`, and spot-check accounts whose application contact
email differs from their account email.
