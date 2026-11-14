# Atomic Admin Email Queue

Apply `20261115000000_queue_admin_email.sql` before using `queueAdminEmail`.
It adds only a private database function: no tables, columns, statuses, or
cross-feature triggers change. The migration has been tested locally; production
must receive it through the normal reviewed migration deployment.

The server action accepts only the saved draft ID and expected version. It
authorizes the admin, loads that admin's saved draft, and calls `prepareAdminEmail`
again. Subject, HTML, competition, groups, and recipients come from saved data
and the current membership-based audience, never a browser-supplied recipient
list or an earlier validation result.

The service-role-only RPC locks the draft, checks ownership, admin status,
version, exact validated content, and the current competition. It inserts the
entire recipient snapshot and changes the draft to `queued` with `queued_at` in
one transaction. A duplicate address, missing foreign key, or any other database
failure rolls back everything. A pre-existing partial draft snapshot is rejected
rather than silently replaced.

Concurrent queue calls serialize on the draft. The first creates the snapshot;
the second returns the existing job. `alreadyQueued: true` reports that a job
already exists, not that a stale caller's requested version was queued. It never
changes the frozen audience or queues another copy, including after delivery has
started or finished. An edit/discard that wins first causes the queue to fail its
version/existence check. Retry uncertain responses with the SAME ID, never create
a replacement automatically.

Recipients are frozen at validation/queue time. Later changes to account emails
or application status do not retroactively rebuild an already-queued snapshot.
Foreign-key deletion between validation and insertion fails atomically and can
be retried with fresh resolution. Ambiguous/missing current competition fails
closed before queueing.

The composer now queues on confirmation and calls the deployed `send-admin-email`
function in page-driven batches. See `admin-email-delivery.md`. There is no
scheduler; the page must remain open, or the admin can resume the same job later.
Test sends use a separate single-address mode without queueing (see
`admin-email-test-sends.md`), and sent history is not connected yet. Existing
event-driven emails are untouched.

```sh
node --test scripts/test-email-queue.mjs
node --test scripts/test-email-queue-db.mjs
```

The DB tests use only the local `supabase_db_seedmoney` Docker container. They
include 24 rollback/permission assertions, two-session queue/edit races, and a
real service-role/anonymous REST API permission and snapshot check.
The SQL suite rolls back its fixtures; concurrency fixtures are removed in
`finally`. The concurrency suite requires one existing local current competition.
