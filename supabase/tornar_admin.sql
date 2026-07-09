-- ============================================================
-- Tornar um usuário ADMINISTRADOR
-- Troque o e-mail abaixo pelo e-mail da conta que será admin.
-- Dica: crie uma conta nova só para o admin (ex.: admin@connexa.com)
-- ou use uma conta existente (ela deixará de ver as telas de síndico).
-- ============================================================

update profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'COLOQUE_O_EMAIL_AQUI'
);

-- Conferir
select p.nome, p.role, u.email
from profiles p
join auth.users u on u.id = p.id
where p.role = 'admin';
