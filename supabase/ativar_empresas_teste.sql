-- ============================================================
-- UTILITÁRIO DE TESTE — ativar assinatura de empresas
-- Use enquanto o painel admin (Etapa 9) não existe.
-- Cole no SQL Editor do Supabase e rode.
-- ============================================================

-- Opção A: ativar TODAS as empresas cadastradas (bom para testar o feed)
update companies set assinatura_ativa = true;

-- Opção B: ativar apenas uma empresa específica pelo nome
-- update companies set assinatura_ativa = true where nome = 'Clean Master';

-- Ver o resultado
select nome, cidade, assinatura_ativa from companies order by nome;
