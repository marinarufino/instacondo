# Connexa

> **Conecta. Facilita. Transforma.** — micro rede social de vídeos que conecta síndicos a empresas/fornecedores de condomínio.

App web mobile-first (PWA), construído com **Next.js + TypeScript + Tailwind CSS** e **Supabase** (autenticação, banco de dados e armazenamento de vídeos).

## Rodando localmente

```bash
npm install
# Copie .env.local.example para .env.local e preencha as chaves do Supabase
npm run dev
```

Abra http://localhost:3000

## Variáveis de ambiente

Veja `.env.local.example`. As essenciais:

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon/publishable) |
| `NEXT_PUBLIC_APP_URL` | URL pública do app (usada nos links dos e-mails) |
| `RESEND_API_KEY` | (Opcional) chave do Resend para envio de e-mails |
| `EMAIL_FROM` | (Opcional) remetente dos e-mails |

## Banco de dados

Os scripts SQL ficam em `supabase/`:
- `schema.sql` — cria todas as tabelas, políticas (RLS), triggers e dados iniciais. Rode uma vez no SQL Editor.
- `tornar_admin.sql` — promove um usuário a administrador.
- `ativar_empresas_teste.sql` — utilitário para ativar assinaturas em testes.

## Deploy na Vercel

1. Faça login em [vercel.com](https://vercel.com) com o GitHub.
2. **Add New → Project** e selecione o repositório `instacondo`.
3. Em **Environment Variables**, adicione as variáveis acima (a `NEXT_PUBLIC_APP_URL` deve ser a URL final do projeto na Vercel).
4. **Deploy**. A cada push na branch `main`, a Vercel publica automaticamente.

## Estrutura

- `src/app/(auth)` — login e cadastro
- `src/app/(sindico)` — feed, filtro, cotação, banco de empresas, perfil
- `src/app/empresa` — área da empresa (vídeos, cotações recebidas)
- `src/app/admin` — painel do administrador (métricas, mapa, gestão)
- `src/lib` — clientes Supabase, e-mail e tipos

## Roadmap

- **Fase 2** — IA comparativa de propostas (anexos já previstos no schema)
- **Fase 3** — App do Condomínio (modelo simples)
