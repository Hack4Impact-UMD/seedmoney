# Competition Standings

The public leaderboard and dashboard standing card use `competition_standings`,
not a campaign's overall fundraising totals. Only published campaigns from the
selected competition participate. Rank is eligible raised descending, eligible
donation count descending, then campaign ID ascending. Grant tiers remain shared.

## Donation Window

The competition's `start_date` and `end_date` are interpreted at noon in
`America/New_York`. The start is inclusive and the end is exclusive. For 2026,
that is November 15 at 17:00 UTC through December 15 at 17:00 UTC.

The transaction trigger maintains eligible totals atomically with inserts,
corrections, status changes, and deletions. Existing unique Givebutter transaction
IDs prevent duplicate notifications from contributing twice. Overall fundraising
totals and donation emails retain their existing flow. No closing-time job is
needed: late notifications still qualify using `transacted_at`, while donations
made after closing never qualify.

## Rollout

Apply the standings migrations before deploying the frontend changes. The
`20261112024940` migration backfills all existing campaign standings while holding
write locks so backfill cannot race incoming transactions.

Only successful transactions with an exact `transacted_at` qualify. The legacy
`date` column has no time of day and cannot establish noon-boundary eligibility.
The migration warns about successful records within the competition dates that
lack `transacted_at`. Reconcile those timestamps against Givebutter before
treating results as complete. Donations missing from `transactions` also require
reconciliation; a database backfill cannot recover records it never received.

Competition date edits and campaign competition reassignments automatically
recalculate affected standings in the same transaction. Donation processing takes
shared locks on those eligibility rows so concurrent edits cannot leave totals
based on stale dates or assignments. Full rebuilds acquire table locks in
parent-before-child order to avoid the campaign-deletion lock cycle.

For reconciliation after correcting missing ledger data, the SQL editor or
trusted service-role backend can also run a full rebuild:

```sql
select public.rebuild_competition_standings();
```

This rebuild is repeatable and resets totals from the transaction ledger. It
overwrites manual edits to standings. Suspensions simply remove campaigns from
the eligible query; their stored rows need not be deleted. These are tentative
results, not an immutable record of approved awards. Both displays refresh their
shared campaign query every 30 seconds while open.

Background refresh errors preserve the last successful query data. Initial
standings failures are confined to the standing-card area, and initial public
leaderboard failures use the existing empty-state component rather than a blank
page. The normal card and leaderboard layouts are unchanged.

## Tests

```sh
node --test scripts/test-leaderboard-ranking.mjs
node --test scripts/test-standings-refresh.mjs
node --test scripts/test-standings-concurrency.mjs
npx supabase test db
```

Run database tests against a local Supabase instance with the migrations applied.
The SQL tests use synthetic records and roll back all changes.
