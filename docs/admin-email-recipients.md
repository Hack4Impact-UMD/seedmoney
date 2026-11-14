# Admin Email Recipients

`readCurrentEmailAudience` is the admin-only, server-only source for recipient
resolution. It uses `users.email` and joins ownership by `campaign_members.user_id`
and `campaign_id`, never by `campaigns.contact_email`. Only `campaign_leader`
memberships count. Existing user-table audience helpers supply the status rules.

- All Users: all non-admin accounts, including accounts from previous years.
- Not Started: no leader campaign in the current competition.
- Unfinished: at least one current-competition `in_progress` campaign.
- Approved: at least one current-competition `approved` or `published` campaign.

Pending, denied, suspended, archived, and publish-failed campaigns do not qualify
as Unfinished or Approved, but do mean that their leader has started. Memberships
as an ordinary campaign member do not count as ownership. Groups can overlap
when an account leads several campaigns.

Addresses are trimmed and deduplicated case-insensitively, including across
selected groups. Each group count and the selected total count unique eligible
email addresses, not campaigns. Invalid/missing addresses are excluded and their
account count is reported. Stable user-ID ordering chooses personalization if
multiple selected accounts share an address. No email addresses leave the server
through the summary action.

Both users and current leader memberships are paginated using the same helper as
exports. Missing/ambiguous current competition or failed pages produce a visible
error, not partial counts. The browser query refreshes every 30 seconds, on focus,
and when selection changes. Confirmation is blocked while counts are loading,
unavailable, zero, or the saved draft belongs to a different/removed competition.

These are live audience estimates, not a frozen recipient snapshot. The future
sending implementation must call `readCurrentEmailAudience` again when queuing
and persist that resolved audience; it must not trust browser counts or recipient
IDs. Actual sending, token/HTML validation, sent-history loading, the existing
event-email Edge Function, and unsubscribe workflows are unchanged by this work.
No database changes or new environment variables are required beyond the draft
feature's existing service-role key.

```sh
node --test scripts/test-email-recipients.mjs scripts/test-email-drafts.mjs
```

The optional browser test in `scripts/test-email-drafts-browser.mjs` also checks
counts and overlapping groups against local Supabase, with temporary accounts
and campaigns that it removes afterwards. See `admin-email-drafts.md` for setup.
