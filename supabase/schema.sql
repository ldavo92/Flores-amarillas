-- GANA EN 10: Supervivencia — Supabase schema
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_token text not null,
  game_state jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists rooms_code_idx on rooms (code);

-- Keep updated_at fresh on every change.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists rooms_set_updated_at on rooms;
create trigger rooms_set_updated_at
  before update on rooms
  for each row
  execute function set_updated_at();

-- Realtime
alter publication supabase_realtime add table rooms;

-- Open MVP policies. Write access is gated in the app via host_token.
alter table rooms enable row level security;

drop policy if exists "rooms_select" on rooms;
create policy "rooms_select" on rooms for select using (true);

drop policy if exists "rooms_insert" on rooms;
create policy "rooms_insert" on rooms for insert with check (true);

drop policy if exists "rooms_update" on rooms;
create policy "rooms_update" on rooms for update using (true) with check (true);
