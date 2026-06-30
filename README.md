<h1 style="display: flex; align-items: center; justify-content: center; gap: 8px;">
  SeedMoney
  <img src="public/seedMoneyLogo.png" alt="SeedMoney" width="20" />
</h1>
 
## 📞 Team Contacts

| Name                   | Role      | Contact                     |
| ---------------------- | --------- | --------------------------- |
| **Esha Vigneswaran**   | Tech Lead | eshavigneswaran@gmail.com   |
| **Samarth Kolanupaka** | Tech Lead | samarthkolanupaka@gmail.com |

## Supabase Auth Email Confirmation

This app requires Supabase email confirmation for email/password signup. Local
Supabase is configured in `supabase/config.toml`, and the built-in confirmation
email is branded in `supabase/templates/confirmation.html`.

Production setup is manual unless Supabase and Brevo credentials are provided:

1. In Supabase Auth email settings, enable email confirmations and keep email
   autoconfirm disabled.
2. In Supabase Auth URL settings, set the production site URL and allow-list the
   production `/callback` URL.
3. In Supabase custom SMTP settings, enable SMTP with Brevo:
   - Host: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: the Brevo SMTP login
   - Password: the Brevo SMTP key
   - Sender name: `SeedMoney`
   - Sender email: the verified SeedMoney sender, for example
     `challenge@seedmoney.org` if that sender is verified in Brevo
4. In Supabase email templates, set the confirmation subject to
   `Confirm your SeedMoney account` and use the contents of
   `supabase/templates/confirmation.html`.

Do not create a Brevo template for signup confirmation. Supabase owns the email
template and uses Brevo only as the SMTP transport. Do not commit Brevo SMTP
credentials.

Optional Management API payload sketch, with real secrets supplied only at
deploy time:

```json
{
  "email_confirmations": true,
  "site_url": "https://<production-domain>",
  "additional_redirect_urls": ["https://<production-domain>/callback"],
  "smtp": {
    "enabled": true,
    "host": "smtp-relay.brevo.com",
    "port": 587,
    "user": "<brevo-smtp-login>",
    "pass": "<brevo-smtp-key>",
    "sender_name": "SeedMoney",
    "admin_email": "<verified-sender-email>"
  },
  "mailer_subjects_confirmation": "Confirm your SeedMoney account",
  "mailer_templates_confirmation_content": "<contents of supabase/templates/confirmation.html>"
}
```

Before using the Management API, verify the current Supabase field names in the
official API docs. Dashboard setup is the default source of truth for production.

References:

- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/auth/passwords
