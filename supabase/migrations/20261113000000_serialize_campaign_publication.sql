create table public.campaign_publication_operations (
  campaign_id bigint primary key references public.campaigns(campaign_id) on delete cascade,
  operation_id uuid not null default gen_random_uuid(),
  action text not null check (action in ('suspend', 'republish')),
  started_at timestamptz not null default now(),
  error text
);

alter table public.campaign_publication_operations enable row level security;
revoke all on public.campaign_publication_operations from public, anon, authenticated;
grant select on public.campaign_publication_operations to authenticated;
grant select, insert, update, delete on public.campaign_publication_operations to service_role;

create policy "Admins can inspect campaign publication operations"
on public.campaign_publication_operations for select to authenticated
using ((select public.is_in_app_admin()));
