# Password recovery links

The login page's Forgot Password / Activate Account button opens an email-entry
modal. After CAPTCHA, it calls Supabase `resetPasswordForEmail` with a
`/reset-password` redirect on the current origin. The email link opens the
existing Change Password modal after authentication. Settings still uses its
original verification-code flow.

Deploy the code before updating the Supabase Reset Password email template.
Keep the Site URL unchanged. The production redirect allowlist already includes
`https://challenge.seedmoney.org/**`.

In Authentication > Email Templates > Reset Password, replace every
`{{ .ConfirmationURL }}` (the button, fallback link href, and fallback link text) with:

```html
{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&amp;type=recovery
```

Send a fresh **password recovery** email from the dashboard to test. Do not use
Send Magic Link: that is a different authentication flow. Old emails still point
to the old destination; request a new email rather than reusing one.

The direct token-hash template makes dashboard-sent emails work without an
explicit redirect and lets users open recovery links in another browser/device.
The default ConfirmationURL template also works for requests from the login
modal when opened in the same browser, using PKCE. Standard implicit recovery
links targeted at `/reset-password` are also supported. Do not change the Magic
Link or signup confirmation templates for this feature.

The page verifies the single-use recovery token before opening the existing
Change Password modal. Recovery skips its separate email-code step, because the
recovery link already verifies the user. The settings modal retains its existing
verification flow. Closing the recovery modal or choosing Log In signs out the
recovery session in this browser and returns to login.

No database migration is required. A missing, expired, used, or wrong-type token
must show an error without exposing the password form. Refreshing the recovery
page after verification loses its in-memory form state and requires a new link.

## Local Testing

`supabase/config.toml` now allows `/reset-password` on localhost and 127.0.0.1.
An already-running local Supabase stack must be restarted to pick up this config:

```sh
npx supabase stop
npx supabase start
```

This does not require `db push` or `db reset`. Do not point local tests at
production. Local Supabase delivers recovery emails to its local mail inbox;
`npx supabase status` shows the inbox URL. CAPTCHA must also accept localhost.

## Checks

Unit tests cover recovery credentials, rejection paths, and the unchanged settings
verification/nonce behavior. Isolated browser tests mock Auth and CAPTCHA to
ensure no real email/provider can be contacted. Run with Playwright installed and
the app running locally:

```sh
node --test scripts/test-password-recovery.mjs scripts/test-change-password-modal.mjs
TEST_BASE_URL=http://localhost:3000 node scripts/test-password-recovery-browser.mjs
```

After deployment and the production template update, complete one real recovery
with a test account, then verify login with its new password. Local/mocked tests
do not validate production SMTP, CAPTCHA, or dashboard template settings.

## CAPTCHA And Production Rollout

Login now consumes each CAPTCHA token once, blocks concurrent sign-in attempts,
and resets the widget after an attempt, including network failures. Signup and
confirmation resends retain their existing widget reset and now block concurrent
submissions. Login, signup, and recovery clear tokens on widget timeout as well
as expiration/errors. Supabase Auth remains responsible for server-side CAPTCHA
validation; do not add a second Siteverify request that consumes the same token.

The login page directs Google users to Log in with Google. It does not expose
account-provider information or block recovery based on an email lookup.

Before deploying, merge the current main branch into this branch so existing
launch fixes are preserved. Deploy the app first, then change only the Reset
Password template as described above and request a fresh email. Keep the Site
URL unchanged. No migration, database push, account deletion, or temporary
password SQL is part of this change.

Check these with a designated production test account:

- Failed email login resets CAPTCHA and disables both login buttons until a new solve.
- Retry with a new CAPTCHA succeeds; also test after leaving the page idle for over five minutes.
- Signup/resend failures require a new CAPTCHA and do not send duplicate requests.
- Recovery email opens the password modal on desktop and phone; the new password works.
- Expired/reused recovery links show an error instead of signup or a password form.
- Google sign-in still works and its guidance is visible.

Review Supabase Authentication logs around any new failure. Local tests cannot
prove production CAPTCHA keys, hostname configuration, SMTP delivery, or quotas
are correct. Share timestamps and redacted error codes, not passwords or tokens.
