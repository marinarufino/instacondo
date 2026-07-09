-- ============================================================
-- CONNEXA — Schema do banco (Etapa 2)
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em RUN.
-- ============================================================

-- ── Tipos ───────────────────────────────────────────────────
create type user_role as enum ('sindico', 'empresa', 'admin');
create type urgencia_nivel as enum ('baixa', 'media', 'alta');
create type quote_status as enum ('ativa', 'cancelada', 'concluida');
create type convite_status as enum ('pendente', 'aceita', 'recusada');

-- ── Regiões (RJ e SP no início; admin pode adicionar) ───────
create table regions (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ativa boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Segmentos / especialidades ──────────────────────────────
create table segments (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  created_at timestamptz not null default now()
);

-- ── Perfis (espelha auth.users) ─────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'sindico',
  nome text not null default '',
  email text not null default '',
  telefone text not null default '',
  region_id uuid references regions(id),
  created_at timestamptz not null default now()
);

-- ── Empresas ────────────────────────────────────────────────
create table companies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  cnpj text not null default '',
  nome text not null,
  descricao text not null default '',
  cidade text not null default '',
  onde_atende text not null default '',
  servicos text not null default '',
  region_id uuid references regions(id),
  segment_id uuid references segments(id),
  assinatura_ativa boolean not null default false, -- admin ativa manualmente no MVP
  created_at timestamptz not null default now()
);

-- ── Vídeos (máx. 5 por empresa, máx. 120s) ──────────────────
create table videos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  url text not null,
  duracao_seg int not null check (duracao_seg between 1 and 120),
  ordem int not null default 1,
  created_at timestamptz not null default now()
);

-- Regra do escopo: para postar o 6º vídeo, precisa apagar um dos 5
create or replace function check_max_videos()
returns trigger language plpgsql as $$
begin
  if (select count(*) from videos where company_id = new.company_id) >= 5 then
    raise exception 'Limite de 5 vídeos atingido. Apague um vídeo para adicionar outro.';
  end if;
  return new;
end $$;

create trigger trg_max_videos
  before insert on videos
  for each row execute function check_max_videos();

-- ── Likes ───────────────────────────────────────────────────
create table likes (
  sindico_id uuid not null references profiles(id) on delete cascade,
  video_id uuid not null references videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (sindico_id, video_id)
);

-- ── Carteira / Banco de Empresas do síndico ─────────────────
create table wallet (
  sindico_id uuid not null references profiles(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (sindico_id, company_id)
);

-- ── Patrocinadores / banners do feed ────────────────────────
create table sponsors (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  banner_url text not null default '',
  link_url text not null default '',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Configurações globais (frequência do banner etc.) ───────
create table settings (
  id int primary key default 1 check (id = 1), -- linha única
  banner_frequency int not null default 5,      -- banner a cada X vídeos
  max_sponsors int not null default 10
);
insert into settings (id) values (1);

-- ── Cotações ────────────────────────────────────────────────
create table quotes (
  id uuid primary key default gen_random_uuid(),
  sindico_id uuid not null references profiles(id) on delete cascade,
  condominio text not null,
  endereco text not null,
  telefone text not null,
  email text not null,
  servico text not null,
  urgencia urgencia_nivel not null default 'media',
  status quote_status not null default 'ativa',
  created_at timestamptz not null default now()
);

create table quote_photos (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  url text not null
);

-- Empresas convidadas para a cotação (aceita ou recusa — sem meio-termo)
create table quote_companies (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  status convite_status not null default 'pendente',
  unique (quote_id, company_id)
);

-- Janelas de 1h definidas pelo síndico (1 empresa por horário)
create table quote_slots (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  inicio timestamptz not null,
  fim timestamptz not null,
  unique (quote_id, inicio)
);

-- Visita agendada: 1 slot = 1 empresa (empresa pode marcar mais de uma data)
create table appointments (
  id uuid primary key default gen_random_uuid(),
  quote_company_id uuid not null references quote_companies(id) on delete cascade,
  slot_id uuid not null unique references quote_slots(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Propostas anexadas (base para a IA da Fase 2)
create table proposals (
  id uuid primary key default gen_random_uuid(),
  quote_company_id uuid not null unique references quote_companies(id) on delete cascade,
  arquivo_url text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- SEGURANÇA (RLS)
-- ============================================================

-- Função auxiliar: o usuário logado é admin?
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Função auxiliar: id da empresa do usuário logado
create or replace function my_company_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from companies where profile_id = auth.uid();
$$;

alter table regions enable row level security;
alter table segments enable row level security;
alter table profiles enable row level security;
alter table companies enable row level security;
alter table videos enable row level security;
alter table likes enable row level security;
alter table wallet enable row level security;
alter table sponsors enable row level security;
alter table settings enable row level security;
alter table quotes enable row level security;
alter table quote_photos enable row level security;
alter table quote_companies enable row level security;
alter table quote_slots enable row level security;
alter table appointments enable row level security;
alter table proposals enable row level security;

-- Leitura pública (catálogo)
create policy "regions_read" on regions for select using (true);
create policy "segments_read" on segments for select using (true);
create policy "sponsors_read" on sponsors for select using (ativo = true or is_admin());
create policy "settings_read" on settings for select using (true);

-- Admin gerencia catálogo
create policy "regions_admin" on regions for all using (is_admin());
create policy "segments_admin" on segments for all using (is_admin());
create policy "sponsors_admin" on sponsors for all using (is_admin());
create policy "settings_admin" on settings for update using (is_admin());

-- Perfis: dono lê/edita o seu; admin lê todos
create policy "profiles_own" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles_insert" on profiles for insert with check (id = auth.uid());
create policy "profiles_update" on profiles for update using (id = auth.uid());

-- Empresas: todos veem as ativas; dono e admin veem/editam a sua
create policy "companies_read" on companies
  for select using (assinatura_ativa = true or profile_id = auth.uid() or is_admin());
create policy "companies_insert" on companies for insert with check (profile_id = auth.uid());
create policy "companies_update" on companies
  for update using (profile_id = auth.uid() or is_admin());

-- Vídeos: todos veem os de empresas ativas; empresa gerencia os seus
create policy "videos_read" on videos for select using (
  company_id in (select id from companies where assinatura_ativa = true)
  or company_id = my_company_id() or is_admin()
);
create policy "videos_insert" on videos for insert with check (company_id = my_company_id());
create policy "videos_delete" on videos for delete using (company_id = my_company_id());

-- Likes e carteira: síndico gerencia os seus (admin lê para o dashboard)
create policy "likes_own" on likes for all using (sindico_id = auth.uid() or is_admin())
  with check (sindico_id = auth.uid());
create policy "wallet_own" on wallet for all using (sindico_id = auth.uid() or is_admin())
  with check (sindico_id = auth.uid());

-- Funções auxiliares para cotações (SECURITY DEFINER evita recursão entre
-- as políticas de quotes e quote_companies)
create or replace function owns_quote(q uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from quotes where id = q and sindico_id = auth.uid());
$$;

create or replace function company_invited(q uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from quote_companies
    where quote_id = q and company_id = my_company_id()
  );
$$;

create or replace function owns_qc(qc uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from quote_companies qcp
    join quotes q on q.id = qcp.quote_id
    where qcp.id = qc and q.sindico_id = auth.uid()
  );
$$;

create or replace function qc_is_my_company(qc uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from quote_companies
    where id = qc and company_id = my_company_id()
  );
$$;

-- Cotações: síndico dono; empresa convidada vê; admin vê
create policy "quotes_sindico" on quotes for all using (sindico_id = auth.uid() or is_admin())
  with check (sindico_id = auth.uid());
create policy "quotes_empresa_read" on quotes for select
  using (company_invited(id));

create policy "quote_photos_access" on quote_photos for all
  using (owns_quote(quote_id) or company_invited(quote_id) or is_admin())
  with check (owns_quote(quote_id));

create policy "quote_companies_sindico" on quote_companies for all
  using (owns_quote(quote_id) or is_admin())
  with check (owns_quote(quote_id));
create policy "quote_companies_empresa" on quote_companies for select
  using (company_id = my_company_id());
create policy "quote_companies_empresa_resposta" on quote_companies for update
  using (company_id = my_company_id());

create policy "quote_slots_access" on quote_slots for all
  using (owns_quote(quote_id) or company_invited(quote_id) or is_admin())
  with check (owns_quote(quote_id));

create policy "appointments_access" on appointments for all
  using (owns_qc(quote_company_id) or qc_is_my_company(quote_company_id) or is_admin())
  with check (qc_is_my_company(quote_company_id));

create policy "proposals_access" on proposals for all
  using (owns_qc(quote_company_id) or qc_is_my_company(quote_company_id) or is_admin())
  with check (qc_is_my_company(quote_company_id));

-- ============================================================
-- PERFIL AUTOMÁTICO ao criar usuário no Auth
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, nome, email)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'sindico'),
    coalesce(new.raw_user_meta_data->>'nome', ''),
    coalesce(new.email, '')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- STORAGE — buckets de vídeos, fotos, propostas e banners
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('videos', 'videos', true),
  ('quote-photos', 'quote-photos', true),
  ('proposals', 'proposals', false),
  ('banners', 'banners', true);

create policy "storage_read_public" on storage.objects for select
  using (bucket_id in ('videos', 'quote-photos', 'banners'));
create policy "storage_upload_auth" on storage.objects for insert
  with check (auth.uid() is not null);
create policy "storage_delete_own" on storage.objects for delete
  using (owner = auth.uid() or is_admin());
create policy "storage_proposals_read" on storage.objects for select
  using (bucket_id = 'proposals' and auth.uid() is not null);

-- ============================================================
-- SEED — dados iniciais
-- ============================================================
insert into regions (nome) values ('Rio de Janeiro'), ('São Paulo');

insert into segments (nome) values
  ('Limpeza e Conservação'),
  ('Segurança'),
  ('Manutenção Predial'),
  ('Jardinagem e Paisagismo'),
  ('Hidráulica'),
  ('Elétrica'),
  ('Elevadores'),
  ('Pintura e Reformas'),
  ('Dedetização'),
  ('Portaria e Controle de Acesso'),
  ('Piscinas'),
  ('Administração e Contabilidade');
