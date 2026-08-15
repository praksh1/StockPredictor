-- MarketPulse AI initial domain schema. Apply through the Supabase migration tool,
-- never by copying credentials into the browser or committing a production connection string.

create extension if not exists pgcrypto;

create type public.assessment_direction as enum ('bullish', 'neutral', 'bearish');
create type public.impact_severity as enum ('low', 'medium', 'high', 'critical');
create type public.confidence_level as enum ('low', 'medium', 'high');
create type public.source_quality as enum ('official_filing', 'government', 'company_ir', 'major_publication', 'reputable_news', 'commentary', 'social', 'unverified');
create type public.delivery_channel as enum ('in_app', 'web_push', 'email');
create type public.delivery_status as enum ('pending', 'sent', 'failed', 'suppressed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A new Auth account receives a matching application profile. The function runs
-- only during Auth's insert; customers cannot choose or elevate their own role.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  monthly_price_cents integer not null check (monthly_price_cents >= 0),
  monthly_alert_limit integer check (monthly_alert_limit is null or monthly_alert_limit >= 0),
  stripe_price_id text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.securities (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  name text not null,
  exchange text not null,
  sector text,
  industry text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (ticker, exchange)
);

create table public.security_aliases (
  id uuid primary key default gen_random_uuid(),
  security_id uuid not null references public.securities(id) on delete cascade,
  alias text not null,
  normalized_alias text not null unique
);

create table public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'My Watchlist',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.watchlist_items (
  watchlist_id uuid not null references public.watchlists(id) on delete cascade,
  security_id uuid not null references public.securities(id),
  created_at timestamptz not null default now(),
  primary key (watchlist_id, security_id)
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  source_type text not null check (source_type in ('sec', 'company_ir', 'news', 'market_data', 'macro')),
  default_quality public.source_quality not null,
  license_notes text,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.source_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id),
  external_id text,
  canonical_url text not null,
  title text not null,
  published_at timestamptz,
  retrieved_at timestamptz not null default now(),
  content_hash text not null,
  evidence_excerpt text,
  metadata jsonb not null default '{}'::jsonb,
  unique (source_id, external_id),
  unique (source_id, canonical_url)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  title text not null,
  event_type text,
  importance_score smallint not null check (importance_score between 0 and 100),
  occurred_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_documents (
  event_id uuid not null references public.events(id) on delete cascade,
  source_document_id uuid not null references public.source_documents(id) on delete cascade,
  is_primary boolean not null default false,
  primary key (event_id, source_document_id)
);

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  security_id uuid not null references public.securities(id),
  direction public.assessment_direction not null,
  severity public.impact_severity not null,
  confidence public.confidence_level not null,
  source_quality public.source_quality not null,
  facts jsonb not null default '[]'::jsonb,
  inferences jsonb not null default '[]'::jsonb,
  drivers jsonb not null default '[]'::jsonb,
  counterarguments jsonb not null default '[]'::jsonb,
  market_context jsonb not null default '{}'::jsonb,
  provider text not null,
  model text not null,
  prompt_version text not null,
  status text not null check (status in ('validated', 'rejected', 'superseded')),
  created_at timestamptz not null default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null unique references public.analyses(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  security_id uuid not null references public.securities(id),
  headline text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create table public.alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.alerts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  channel public.delivery_channel not null,
  status public.delivery_status not null default 'pending',
  provider_message_id text,
  delivered_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  unique (alert_id, user_id, channel)
);

create table public.usage_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  alert_id uuid not null references public.alerts(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  units integer not null default 1 check (units = 1),
  created_at timestamptz not null default now(),
  unique (user_id, alert_id)
);

create index source_documents_published_at_idx on public.source_documents (published_at desc);
create index analyses_event_security_idx on public.analyses (event_id, security_id, created_at desc);
create index alerts_security_created_idx on public.alerts (security_id, created_at desc);
create index alert_deliveries_user_created_idx on public.alert_deliveries (user_id, created_at desc);
create index usage_ledger_user_period_idx on public.usage_ledger (user_id, period_start, period_end);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.securities enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.analyses enable row level security;
alter table public.alerts enable row level security;
alter table public.alert_deliveries enable row level security;
alter table public.usage_ledger enable row level security;

create policy "profiles are readable by owner" on public.profiles for select using (auth.uid() = id);
create policy "profiles are editable by owner" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "subscriptions are readable by owner" on public.subscriptions for select using (auth.uid() = user_id);
create policy "active securities are public" on public.securities for select using (is_active = true);
create policy "watchlists are managed by owner" on public.watchlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "watchlist items are managed through owned list" on public.watchlist_items for all using (
  exists (select 1 from public.watchlists w where w.id = watchlist_id and w.user_id = auth.uid())
) with check (
  exists (select 1 from public.watchlists w where w.id = watchlist_id and w.user_id = auth.uid())
);
create policy "analyses are readable through a delivery" on public.analyses for select using (
  exists (
    select 1 from public.alerts a
    join public.alert_deliveries d on d.alert_id = a.id
    where a.analysis_id = analyses.id and d.user_id = auth.uid()
  )
);
create policy "alerts are readable through a delivery" on public.alerts for select using (
  exists (
    select 1 from public.alert_deliveries d
    where d.alert_id = alerts.id and d.user_id = auth.uid()
  )
);
create policy "deliveries are readable by owner" on public.alert_deliveries for select using (auth.uid() = user_id);
create policy "usage is readable by owner" on public.usage_ledger for select using (auth.uid() = user_id);

-- Limit self-service profile updates to non-privileged fields. The service role
-- bypasses RLS for controlled administrative changes.
revoke update on public.profiles from authenticated;
grant update (display_name, updated_at) on public.profiles to authenticated;
