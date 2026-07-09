-- ============================================================
-- CORREÇÃO — nome de exibição no chat
-- Cria uma função segura que retorna apenas o NOME de exibição
-- (empresa → nome da empresa; síndico → nome), sem expor e-mail/telefone.
-- Cole no SQL Editor do Supabase e rode.
-- ============================================================

create or replace function display_names(ids uuid[])
returns table (id uuid, nome text, eh_empresa boolean)
language sql stable security definer set search_path = public as $$
  select
    p.id,
    case
      when p.role = 'empresa' then coalesce(c.nome, nullif(p.nome, ''), 'Empresa')
      else coalesce(nullif(p.nome, ''), 'Síndico')
    end as nome,
    (p.role = 'empresa') as eh_empresa
  from profiles p
  left join companies c on c.profile_id = p.id
  where p.id = any(ids)
    and (
      p.id = auth.uid()
      -- empresa ativa (síndico iniciando conversa)
      or (p.role = 'empresa' and exists (
        select 1 from companies c2
        where c2.profile_id = p.id and c2.assinatura_ativa = true
      ))
      -- já existe conversa entre os dois
      or exists (
        select 1 from messages m
        where (m.sender_id = auth.uid() and m.recipient_id = p.id)
           or (m.sender_id = p.id and m.recipient_id = auth.uid())
      )
    );
$$;
