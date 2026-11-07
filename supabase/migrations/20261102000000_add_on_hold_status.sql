-- Kept in its own migration: Postgres cannot use a new enum value in the
-- same transaction that adds it.
alter type public.status add value if not exists 'on_hold';
