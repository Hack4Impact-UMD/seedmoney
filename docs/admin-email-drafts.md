# Admin Email Drafts

Requires the existing `20261114000000_create_admin_email_tables.sql` migration
and server-side `SUPABASE_SERVICE_ROLE_KEY`. No additional schema changes are
needed. Every action calls `requireAdmin` and scopes writes to the signed-in
admin's own draft.

Compose restores that admin's most recently updated draft. A blank compose page
does not create a row. Changes save after 700 ms of inactivity; writes are
serialized, and edits made during a request are saved next. Subject, HTML,
recipient groups, and the competition selected on initial creation persist.
HTML can remain incomplete while drafting; this is not send-time validation.
Restored drafts open in HTML mode to avoid silently losing formatting through
the more restricted Text editor. New messages still start in Text mode.

Updates and discard check both `status = draft` and the expected `version`.
Conflicts preserve local content until the admin explicitly reloads. An exact
replayed request can acknowledge an already-committed write, but never overwrite
a newer version. Validation errors can be corrected without replaying an
invalid payload. Failed saves never display a successful save confirmation.

Sent-history navigation waits for pending edits to save. Closing/reloading a tab
with unsaved changes triggers the browser's warning; other client navigation
makes a best-effort final save. This is not offline storage: don't close a tab
after a failed save without resolving it or retaining the text separately.

Discard waits for saves to finish, deletes only the expected owned draft, and
does not delete uploaded images that might be referenced elsewhere. No sending,
recipient counts, sent-history loading, or event-email behavior is changed.

```sh
node --test scripts/test-email-drafts.mjs
```

The optional `scripts/test-email-drafts-browser.mjs` checks the running app at
`http://localhost:3001` against local Supabase only. It creates and cleans up its
own admin fixture and drafts. Install Playwright separately and set
`PLAYWRIGHT_MODULE` to its module path; `CHROME_EXECUTABLE` can override the
browser executable. No Playwright dependency is added to the app.
