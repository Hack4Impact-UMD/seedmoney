# Admin Email Delivery

The composer queues the saved, validated draft with `queueAdminEmail`, then calls
the dashboard-managed Supabase Edge Function at the `send-admin-emails` URL slug
(display name `send-admin-email`) through the
authenticated browser client. The function sends one batch and returns progress;
the page waits for its retry interval before requesting another batch.

Keep the page open while sending. Closing or navigating away stops further batch
requests, although an already-started batch may finish. Returning to the composer
finds the admin's oldest queued/sending email and offers **Resume sending**. It
does not automatically resume. A new bulk send is blocked until that job finishes.

The existing recipient snapshot is reused. Provider-accepted recipients are not
resent; uncertain outcomes require checking provider logs and are not retried
automatically. Accepted means accepted by the provider, not delivered to an inbox.
Rate limits respect the function's retry delay; network errors stop with a visible
error, and credential errors require correction before resuming.

No scheduler, cron secret, new environment variables, or additional migration is
needed for this step. The existing queue migration and deployed `send-admin-emails`
function are prerequisites. Test sends use a separate server-only mode in that
function (see `admin-email-test-sends.md`); sent-history integration is a separate
step. The deployed Edge Function source stays in Supabase.

Validation: `node --test scripts/test-email-delivery.mjs` covers batching,
backoff, invalid responses, failures, aborts, and authorized pending-job lookup.
`scripts/test-email-drafts-browser.mjs` uses local Supabase with mocked Edge
Function responses, including interrupted delivery and same-job resume. It sends
no real email.
