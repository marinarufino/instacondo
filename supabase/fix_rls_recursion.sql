-- ============================================================
-- CORREÇÃO — recursão infinita nas políticas de cotação
-- Cole no SQL Editor do Supabase e rode.
-- ============================================================

-- Funções auxiliares (SECURITY DEFINER = não re-disparam RLS, quebrando a recursão)

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

-- ── quotes ──────────────────────────────────────────────────
drop policy if exists "quotes_empresa_read" on quotes;
create policy "quotes_empresa_read" on quotes for select
  using (company_invited(id));

-- ── quote_companies ─────────────────────────────────────────
drop policy if exists "quote_companies_sindico" on quote_companies;
create policy "quote_companies_sindico" on quote_companies for all
  using (owns_quote(quote_id) or is_admin())
  with check (owns_quote(quote_id));

-- ── quote_photos ────────────────────────────────────────────
drop policy if exists "quote_photos_access" on quote_photos;
create policy "quote_photos_access" on quote_photos for all
  using (owns_quote(quote_id) or company_invited(quote_id) or is_admin())
  with check (owns_quote(quote_id));

-- ── quote_slots ─────────────────────────────────────────────
drop policy if exists "quote_slots_access" on quote_slots;
create policy "quote_slots_access" on quote_slots for all
  using (owns_quote(quote_id) or company_invited(quote_id) or is_admin())
  with check (owns_quote(quote_id));

-- ── appointments ────────────────────────────────────────────
drop policy if exists "appointments_access" on appointments;
create policy "appointments_access" on appointments for all
  using (owns_qc(quote_company_id) or qc_is_my_company(quote_company_id) or is_admin())
  with check (qc_is_my_company(quote_company_id));

-- ── proposals ───────────────────────────────────────────────
drop policy if exists "proposals_access" on proposals;
create policy "proposals_access" on proposals for all
  using (owns_qc(quote_company_id) or qc_is_my_company(quote_company_id) or is_admin())
  with check (qc_is_my_company(quote_company_id));
