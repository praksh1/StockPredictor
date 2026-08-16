-- Keep ingestion records private by default. Customers may read only source
-- documents and events that support an alert delivered to their own account.

alter table public.plans enable row level security;
alter table public.security_aliases enable row level security;
alter table public.sources enable row level security;
alter table public.source_documents enable row level security;
alter table public.events enable row level security;
alter table public.event_documents enable row level security;

create policy "active plans are readable" on public.plans
for select using (is_active = true);

create policy "security aliases are readable" on public.security_aliases
for select using (
  exists (select 1 from public.securities s where s.id = security_aliases.security_id and s.is_active = true)
);

create policy "enabled sources are readable" on public.sources
for select using (is_enabled = true);

create policy "events are readable through a delivery" on public.events
for select using (
  exists (
    select 1 from public.alerts a
    join public.alert_deliveries d on d.alert_id = a.id
    where a.event_id = events.id and d.user_id = auth.uid()
  )
);

create policy "source documents are readable through a delivery" on public.source_documents
for select using (
  exists (
    select 1
    from public.event_documents ed
    join public.alerts a on a.event_id = ed.event_id
    join public.alert_deliveries d on d.alert_id = a.id
    where ed.source_document_id = source_documents.id and d.user_id = auth.uid()
  )
);

create policy "event documents are readable through a delivery" on public.event_documents
for select using (
  exists (
    select 1
    from public.alerts a
    join public.alert_deliveries d on d.alert_id = a.id
    where a.event_id = event_documents.event_id and d.user_id = auth.uid()
  )
);

