-- Per-user alert delivery controls. No notification provider is activated by
-- this migration; it only stores the user's explicit preferences.
create table public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default true,
  web_push_enabled boolean not null default false,
  minimum_severity public.impact_severity not null default 'high',
  market_hours_only boolean not null default false,
  timezone text not null default 'America/Chicago',
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

create policy "notification preferences are readable by owner"
  on public.notification_preferences for select using (auth.uid() = user_id);
create policy "notification preferences are insertable by owner"
  on public.notification_preferences for insert with check (auth.uid() = user_id);
create policy "notification preferences are editable by owner"
  on public.notification_preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_notification_preferences_timestamp()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger notification_preferences_updated_at
before update on public.notification_preferences
for each row execute procedure public.set_notification_preferences_timestamp();
