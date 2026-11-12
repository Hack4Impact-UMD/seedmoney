# Campaign Suspension

Apply `20261113000000_serialize_campaign_publication.sql` before deploying the
suspend/republish actions. They require the existing Supabase service-role key.
No campaign status values or campaign types change.

Both actions authenticate the administrator, then reserve the campaign in
`campaign_publication_operations` before reading its current status. The primary
key prevents overlapping operations across tabs and server instances. Different
campaigns remain independent. Successful and definitively rejected operations
release their reservation.

If remote republishing succeeds but the local Published write fails, the action
uses the existing Givebutter PUT to unpublish again and restores Suspended
locally. Failed recovery records the mismatch and retains the reservation.

Reservations deliberately do not expire: a timed-out Givebutter request could
still complete after an automatic expiry. Network errors, uncertain remote
responses, and interrupted server executions leave the reservation in place.
Administrators can inspect the table; only the trusted backend can write it.

For a retained reservation, inspect its `error` and `started_at`, confirm the
original request is no longer running, and verify the campaign's publication
state directly in Givebutter. Reconcile its Supabase status with that state.
Only then remove that campaign's operation row in the Supabase SQL editor or
table editor. Never clear an actively running operation to bypass the guard.

Run the action regressions with:

```sh
node --test scripts/test-campaign-suspension.mjs
```
