# Admin Email Send Validation

Draft autosave is unchanged: incomplete HTML can be saved and corrected later.
`prepareAdminEmail` is the shared server-only validation boundary for both send
and test-send. It authorizes the admin, validates content, resolves a fresh
audience, and checks the competition and personalized subjects. The UI validation
action returns errors or a count, never recipient addresses.

The composer validates before opening confirmation, again on confirmation, and
before simulating a test send. It keeps the draft unchanged on failure, displays
errors, and prevents duplicate validation requests or edits during a check.
Bulk delivery uses `queueAdminEmail`, which calls `prepareAdminEmail` again before
queueing rather than trusting prior browser validation. Test sends also prepare
again before forwarding one address to the Edge Function; see
`admin-email-test-sends.md`. See `admin-email-delivery.md` for bulk delivery.
The existing event-email Edge Function is untouched.

## Supported Content

Messages are HTML body fragments with explicitly closed non-void tags. The
existing Lezer HTML parser checks structure and attribute syntax; `html-validate`
checks HTML content models, including table/list nesting. `sanitize-html`
compares normalized input against an email-safe allowlist; stripping a tag,
attribute, or style causes rejection, not silent rewriting. Basic formatting,
tables, HTTP(S) images, absolute HTTP(S)/mailto/tel links, and common inline text,
color, spacing, and size styles are supported. Scripts, forms, SVG, embedded
frames, comments/conditional comments, full-document wrappers, relative URLs,
event attributes, and unsupported CSS are not supported. This deliberately
conservative policy is not a guarantee of identical rendering in every mail app.

Only `{{first_name}}` and `{{campaign_url}}` are recognized. They may appear in
subject/body text; only the entire quoted `href="{{campaign_url}}"` attribute
form is supported for attributes. Unknown, incomplete, or misplaced placeholders
block validation. Recipient values are escaped in HTML, and personalized subject
lines must remain nonempty, within the limit, and free of control characters.

`campaign_url` requires the Approved Campaigns group and a valid HTTPS Givebutter
URL for every resolved recipient, even when other groups are selected. An account
must lead exactly one approved/published campaign in the current competition;
multiple eligible campaigns are blocked rather than selecting an arbitrary URL.
No special grants, subscription workflows, database changes, or provider calls
are added here.

The validation libraries require Node 22.22+. The package engine and both CI
workflows now target Node 22; [Vercel honors the package engine](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
on the next deployment. Local development should use Node 22 as well. Existing unrelated
`npm audit` advisories remain outside this feature's scope.

```sh
node --test scripts/test-email-send-validation.mjs scripts/test-email-recipients.mjs scripts/test-email-drafts.mjs
```

The local browser suite also verifies validation errors, unchanged draft content,
valid confirmation, and mocked test delivery. See `admin-email-drafts.md` for setup.
