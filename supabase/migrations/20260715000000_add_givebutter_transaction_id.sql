alter table public.transactions
add column if not exists givebutter_id text;

create unique index if not exists transactions_givebutter_id_key
on public.transactions (givebutter_id)
where givebutter_id is not null;
