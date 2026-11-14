begin;
create table public.admin_emails (
  id uuid primary key default gen_random_uuid(),
  competition_id bigint references public.competition_metadata(competition_id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  subject text not null default '',
  body_html text not null default '',
  recipient_groups text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft','queued','sending','sent','partially_failed','failed')),
  version bigint not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  queued_at timestamptz,
  completed_at timestamptz,
  last_error text,
  check (recipient_groups <@ array['all','not_started','unfinished','approved']::text[]
    and array_position(recipient_groups, null) is null)
);
create table public.admin_email_recipients (
  id uuid primary key default gen_random_uuid(),
  email_id uuid not null references public.admin_emails(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  campaign_id bigint references public.campaigns(campaign_id) on delete set null,
  recipient_email text not null check (btrim(recipient_email) <> ''),
  email_key text generated always as (lower(btrim(recipient_email))) stored,
  first_name text not null default '',
  campaign_url text,
  status text not null default 'pending'
    check (status in ('pending','sending','accepted','failed','unknown','skipped')),
  attempts integer not null default 0 check (attempts >= 0),
  provider_request_id uuid,
  provider_message_id text,
  last_error text,
  last_attempt_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (email_id, email_key)
);
create index admin_emails_history_idx on public.admin_emails(status, created_at desc);
create index admin_email_recipients_work_idx on public.admin_email_recipients(email_id, status);
create function public.touch_admin_email() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now(); new.version := old.version + 1; return new;
end;
$$;
create trigger touch_admin_email before update on public.admin_emails
for each row execute function public.touch_admin_email();
alter table public.admin_emails enable row level security;
alter table public.admin_email_recipients enable row level security;
revoke all on public.admin_emails, public.admin_email_recipients from public, anon, authenticated;
grant select on public.admin_emails, public.admin_email_recipients to authenticated;
grant select, insert, update, delete on public.admin_emails, public.admin_email_recipients to service_role;
revoke all on function public.touch_admin_email() from public, anon, authenticated;
create policy "Admins can read admin emails" on public.admin_emails
for select to authenticated using ((select public.is_in_app_admin()));
create policy "Admins can read admin email recipients" on public.admin_email_recipients
for select to authenticated using ((select public.is_in_app_admin()));
commit;
