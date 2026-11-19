# Campaign URL Tokens

`{{campaign_url}}` resolves every approved/published campaign led by the recipient
in the current competition. Recipients still receive one email. Links are ordered
by campaign ID and duplicate URL strings are removed. Missing or invalid links
block real sends instead of silently omitting a campaign.

In body text, multiple URLs become separate clickable links on separate lines.
An anchor containing the token expands into one anchor per campaign, retaining
its formatting and adding the campaign name to distinguish the links. Subjects
use a comma-separated list. Single-campaign output stays unchanged.

Test sends use example values independently of real audience eligibility. They
do not look up the test address's campaigns or send to the selected audience.

## Deployment Order

1. Apply `20261119000000_admin_email_campaign_links.sql` after reviewing the usual
   `supabase db push --dry-run` output. It adds a nullable JSON snapshot column
   and updates only the recipient insert in the existing queue function.
2. Update the **existing** dashboard-managed function at URL slug
   `send-admin-emails` (display name `send-admin-email`). Do not create a new
   endpoint or change JWT/authentication settings.
3. Deploy the app changes. Do not queue multi-campaign emails on the old worker:
   it cannot render the new snapshots.

To prepare the dashboard paste without checking the Edge Function into the repo:

```sh
mkdir -p /tmp/seedmoney-email-links
npx supabase functions download send-admin-emails --project-ref dclqnkxvkxecsxsdxkcv --use-api --workdir /tmp/seedmoney-email-links
node scripts/prepare-admin-email-function.mjs /tmp/seedmoney-email-links/supabase/functions/send-admin-emails/index.ts /tmp/send-admin-emails-updated.ts
ADMIN_EMAIL_EDGE_SOURCE=/tmp/seedmoney-email-links/supabase/functions/send-admin-emails/index.ts node --test scripts/test-email-edge-links.mjs
```

The preparation script fails if the expected deployed-code markers have changed.
It embeds the app's same token renderer, adds the frozen-link column to the read,
and validates both new and legacy snapshots. Transport, authorization, provider
idempotency, batch claims, and retry handling are unchanged. Paste the generated
file into the existing dashboard function and deploy it there.

Already-queued rows have `campaign_links = NULL` and retain their existing
single-URL rendering. New snapshots never re-read campaign ownership during
delivery or resume. No existing emails are requeued or resent by this migration.

After deployment, test both token placements and send a deliberately scoped real
email to an account with multiple campaigns before using the token in a bulk send.
