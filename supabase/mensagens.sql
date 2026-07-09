-- ============================================================
-- MENSAGENS — chat entre síndico e empresa
-- Cole no SQL Editor do Supabase e rode.
-- ============================================================

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles(id) on delete cascade,
  recipient_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_pair on messages (sender_id, recipient_id, created_at);
create index if not exists idx_messages_recipient on messages (recipient_id, read);

alter table messages enable row level security;

-- Cada um vê e gerencia apenas as mensagens em que participa
drop policy if exists "messages_read" on messages;
create policy "messages_read" on messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists "messages_insert" on messages;
create policy "messages_insert" on messages for insert
  with check (sender_id = auth.uid());

-- Marcar como lida (só quem recebeu)
drop policy if exists "messages_update" on messages;
create policy "messages_update" on messages for update
  using (recipient_id = auth.uid());
