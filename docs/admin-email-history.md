# Sent History

The existing history page now reads `admin_emails` and counts its saved
`admin_email_recipients`. No new table, migration, or Edge Function change is
needed for history. Deploy these app changes together with the campaign-token
fix, after its separate migration and Edge Function update.

All authenticated application admins can read completed bulk jobs, regardless
of who sent them. Each action checks `requireAdmin` and uses that session's
RLS-protected Supabase client, not a service-role client. Drafts, test sends,
and queued/sending jobs are not in completed history. Incomplete jobs remain in
the composer's existing resume flow.

The table shows the saved subject, completion date, selected recipient groups,
recipient count, and terminal job status. `sent` means **Accepted by provider**,
not confirmed delivery to each inbox. Partial and failed jobs remain visible.
Opening a subject shows outcome counts, saved errors, and the frozen message
template rendered with clearly labeled example values through the existing
sanitized preview. Recipient addresses never need to reach the browser.

Pagination and recipient-group/month filters run on the server. Dates and month
boundaries are UTC. Date choices are loaded independently of the current page.
Lists refresh every 30 seconds and on window focus. Failed reads show retry
controls rather than an empty-history claim. If a page disappears during a
refresh, a first-page recovery control is available.

Validation:

```sh
node --test scripts/test-email-history.mjs
```

For the optional local browser test, run the app on port 3034 with **local**
Supabase URL and keys, then:

```sh
node scripts/test-email-history-browser.mjs
```

Set `PLAYWRIGHT_MODULE` if Playwright is installed outside the app. The browser
test requires local Supabase, creates temporary records/accounts and cleans
them up, blocks email-function calls, and saves screenshots in the OS temporary
directory. It checks pagination, both filters, safe message preview and mobile
overflow. It does not send emails or alter production.
