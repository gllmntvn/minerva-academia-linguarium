create table public.study_events (
  user_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null,
  occurred_at timestamptz not null,
  payload jsonb not null,
  primary key (user_id, id),
  constraint study_event_payload_size check (octet_length(payload::text) <= 2048),
  constraint study_event_payload_shape check (
    jsonb_typeof(payload) = 'object'
    and payload ?& array['id', 'at', 'language', 'mode', 'kind', 'title']
    and payload->>'id' = id::text
    and jsonb_typeof(payload->'at') = 'number'
    and jsonb_typeof(payload->'title') = 'string'
    and payload->>'language' in ('en', 'es', 'it', 'de', 'fr')
    and payload->>'mode' in ('flashcards', 'leitura', 'escrita')
    and payload->>'kind' in ('answer', 'session')
  )
);

create index study_events_user_time_idx on public.study_events (user_id, occurred_at, id);

alter table public.study_events enable row level security;
revoke all on table public.study_events from public, anon, authenticated;
grant select, insert on table public.study_events to authenticated;

create policy "Conta lê apenas o próprio histórico"
  on public.study_events for select to authenticated using ((select auth.uid()) = user_id);

create policy "Conta registra apenas o próprio histórico"
  on public.study_events for insert to authenticated with check ((select auth.uid()) = user_id);
