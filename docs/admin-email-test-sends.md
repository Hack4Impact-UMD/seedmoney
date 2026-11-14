# Admin Test Emails

The Test send dialog now calls `sendAdminTestEmail`. It reuses
`prepareAdminEmail` to authorize the admin and validate HTML, placeholders,
competition, audience, and the test address before any delivery request.

Only the entered test address is forwarded. Personalization uses the same example
values as Preview (Jane and the example Givebutter URL), not a real recipient's
details. The original draft and bulk recipient queue are not modified, and tests
are not recorded as bulk sends in sent history.

The server action invokes the existing `send-admin-email` Edge Function using the
existing service-role client. The new `mode: "test"` path accepts service-role
requests only; browser user JWTs cannot submit HTML directly to this path. Brevo
credentials stay in Supabase. The existing `{ email_id }` bulk path is unchanged.

## Required Dashboard Update

Before using the button, replace the existing **send-admin-email** function's
source in the Supabase dashboard with the separately provided updated source and
deploy it. Keep Verify JWT off, as before; the function handles authorization.
Its source remains outside this repository. No migration, new tables, or new app
environment variables are required.

Localhost must use the same Supabase project's URL, public key, and service-role
JWT as the deployed function (the legacy `service_role` key, not an `sb_secret_`
key; the function compares it with its built-in service-role credential).
Restart Next.js after changing local environment
variables. A local Supabase instance without the function will show a visible
configuration error instead of pretending the test succeeded.

## Outcomes

The dialog reports provider acceptance, not confirmed inbox delivery. Definite
rejection, rate limits, and unavailable/misconfigured functions show errors.
Network/timeout and ambiguous results explicitly warn to check the inbox or
provider logs before trying again. There are no automatic retries.

Duplicate clicks are guarded synchronously. An unchanged uncertain test reuses
its request ID for provider idempotency; an acknowledged test or definite
rejection clears it. This is not a durable exactly-once guarantee across reloads
or beyond the provider's idempotency window.

## Validation

`node --test scripts/test-admin-test-email.mjs` tests validation, single-address
isolation, example personalization, configuration errors, and uncertain outcomes.
The local browser suite mocks test-action responses and verifies error/success
feedback, duplicate-click protection, same-request retry, and an unchanged draft
with no bulk recipient snapshot. No real emails are sent by these tests.
