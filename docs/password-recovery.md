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
