# Connexa — Planejamento de Implementação (MVP Fase 1)

> Repositório: `instacondo` · Marca do produto: **Connexa** — "Conecta. Facilita. Transforma."
> Baseado no escopo `escopo_app_sindico_empresas.md` e nas imagens de paleta e identidade visual.

---

## 1. Decisões confirmadas

| Decisão | Escolha |
|---|---|
| Marca | **Connexa** (seguir a identidade visual da imagem) |
| Plataforma MVP | **Web mobile-first (PWA)** — desenhado como app de celular, instalável, roda no navegador. Migração futura para mobile nativo. |
| Backend | **Supabase** (Auth + Postgres + Storage de vídeos) |
| Pagamento | **Simulado no MVP** — tela de assinatura pronta, admin ativa a empresa manualmente. Stripe/Mercado Pago em fase posterior. |
| Escopo | **Fase 1 completa** (sem IA — fica para Fase 2) |

### Padrões adotados para pontos em aberto do escopo (configuráveis pelo admin)
- **Banner a cada 5 vídeos** no feed (admin pode mudar para 4/7).
- **Até 10 patrocinadores** cadastráveis.
- Feed aceita **somente vídeo** (sem fotos/posts).
- Empresas produzem os próprios vídeos (app só recebe upload).

---

## 2. Stack técnica

| Camada | Tecnologia | Motivo |
|---|---|---|
| Frontend | **Next.js (App Router) + TypeScript + Tailwind CSS** | Rápido, mobile-first, vira PWA, deploy grátis na Vercel |
| Backend/BD | **Supabase** (Postgres + RLS) | Auth, banco relacional (bom p/ dashboard), storage de vídeo |
| Vídeos | Supabase Storage + `<video>` HTML5 com scroll snap vertical | Limite de 5 vídeos/empresa controlado no banco |
| E-mails | **Resend** (ou SMTP do Supabase) | Notificações de cotação/agendamento |
| Mapa (admin) | **Leaflet + OpenStreetMap** | Grátis, sem chave de API paga |
| Deploy | **Vercel** (front) + Supabase Cloud | Planos gratuitos suficientes p/ MVP |

---

## 3. Design System — Connexa

### Paleta (da imagem oficial)
| Token | Hex | Uso |
|---|---|---|
| `primary` | `#6D28D9` | Roxo principal — botões, headers, logo |
| `primary-light` | `#8B5CF6` | Roxo claro — gradientes, hovers, destaques |
| `dark` | `#0F172A` | Azul-marinho — textos, títulos |
| `gray` | `#64748B` | Cinza — textos secundários |
| `background` | `#F8FAFC` | Branco gelo — fundo das telas |
| `accent` | `#06B6D4` | Ciano — destaques pontuais, tagline "Transforma." |

### Diretrizes da identidade visual (da imagem)
- Logo "C" em gradiente roxo (`#6D28D9 → #8B5CF6`).
- Fundo claro (`#F8FAFC`), cards brancos arredondados com sombra suave.
- Header/hero roxo com texto branco (ex.: "Olá, Síndico!").
- Botões primários roxos com cantos bem arredondados (pill).
- Ícones de linha (outline) roxos.
- Barra de navegação inferior com 4–5 itens + botão central "+" roxo.
- Estilo geral: **simples, leve, limpo, pouca informação por tela** (frase-guia: "agora minha vida é simples").

---

## 4. Modelo de dados (Postgres/Supabase)

```
profiles          — id, role (sindico|empresa|admin), nome, email, telefone
regions           — id, nome (Rio de Janeiro, São Paulo), ativa
segments          — id, nome (Hidráulica, Segurança, Limpeza, ...)
companies         — id, profile_id, cnpj, nome, descricao, cidade, region_id,
                    segment_id, onde_atende, servicos, assinatura_ativa (bool)
videos            — id, company_id, url, duracao_seg (≤120), ordem
                    → trigger/constraint: máx. 5 por empresa
likes             — sindico_id, video_id
wallet            — sindico_id, company_id (carteira/banco de empresas)
sponsors          — id, nome, banner_url, ativo (máx. 10)
settings          — banner_frequency (default 5)
quotes            — id, sindico_id, condominio, endereco, telefone, email,
                    servico, urgencia, status (ativa|cancelada)
quote_photos      — quote_id, url
quote_companies   — quote_id, company_id, status (pendente|aceita|recusada)
quote_slots       — quote_id, inicio, fim (janelas de 1h definidas pelo síndico)
appointments      — quote_company_id, slot_id (visita agendada)
proposals         — quote_company_id, arquivo_url (base p/ IA na Fase 2)
```

**Regras de negócio no banco/API:**
1. Máx. **5 vídeos por empresa** — para postar o 6º, precisa apagar um.
2. Vídeo com **duração máx. 120s** (validado no upload).
3. **Nº de horários ≥ nº de empresas** na cotação — senão, erro: *"escolha menos empresas ou aumente seu calendário"*.
4. **1 empresa por horário** (slot único).
5. Empresa só **aceita ou recusa** convite — sem meio-termo. Pode marcar mais de uma data.
6. Empresa sem `assinatura_ativa` não aparece no feed nem recebe cotações.

---

## 5. Telas

### Síndico (mobile-first, nav inferior com 4 botões)
1. **Empresas (Feed)** — scroll vertical de vídeos (snap), like ❤, adicionar à carteira ➕, "conhecer a empresa" (descrição, cidade, onde atende, serviços), banner de patrocínio a cada 5 vídeos.
2. **Filtro** — por segmento e região (RJ/SP).
3. **Cotação** — formulário (condomínio, endereço, telefone, e-mail, serviço, urgência, fotos) → selecionar empresas (carteira agrupada por tema, marcar todas/algumas) → definir calendário (dias + janela, slots de 1h) → enviar. Ações: cancelar / repetir cotação. Tela "Minhas visitas": lista vertical de agendamentos.
4. **Banco de Empresas** — carteira agrupada por segmento, com remoção.

### Empresa
- Cadastro (e-mail, telefone, CNPJ, nome, segmento) + tela de assinatura R$ 39,90 (simulada).
- Gestão de vídeos (upload, máx. 5, substituição obrigatória).
- Cotações recebidas → ver detalhes → **aceitar** (escolher data/s no calendário do síndico) ou **recusar**.
- Anexar proposta (arquivo) — preparação p/ IA da Fase 2.

### Admin (desktop, dashboard colorido)
- Métricas: empresas cadastradas, presença em carteiras, cotações recebidas por empresa, síndicos ativos × inativos, empresas por síndico.
- **Mapa** (Leaflet): síndicos e empresas por região.
- Gestão: regiões, patrocinadores/banners (frequência configurável), ativação manual de assinaturas.

---

## 6. Etapas de implementação

| # | Etapa | Entrega |
|---|---|---|
| 1 | **Fundação** | Next.js + TS + Tailwind com tokens Connexa, layout mobile-first, logo, nav inferior, componentes base (botão, card, input) |
| 2 | **Supabase** | Projeto, schema completo, RLS, seed de regiões/segmentos |
| 3 | **Auth & Cadastros** | Login/cadastro síndico e empresa, onboarding, assinatura simulada, perfil |
| 4 | **Feed de vídeos** | Upload (limite 5 / 120s), scroll vertical, like, carteira, "conhecer empresa", banners |
| 5 | **Filtro + Banco de Empresas** | Filtro segmento/região, carteira agrupada por tema |
| 6 | **Cotação** | Formulário + fotos + seleção de empresas + envio |
| 7 | **Calendário** | Slots de 1h, regra horários ≥ empresas, aceite/recusa da empresa, lista de visitas |
| 8 | **E-mails** | Notificação de cotação recebida e de agendamento |
| 9 | **Dashboard Admin** | Métricas, mapa, gestão de regiões/patrocinadores/assinaturas |
| 10 | **PWA + Deploy** | Manifest/ícones instaláveis, polimento visual, deploy Vercel + Supabase |

**Fase 2 (futuro):** IA comparativa de propostas (anexos já previstos no schema).
**Fase 3 (futuro):** App do Condomínio (modelo simples).

---

## 7. O que vou precisar de você durante o desenvolvimento

- Criar conta gratuita no **Supabase** (etapa 2) e no **Resend** (etapa 8) — te guio na hora.
- Conta na **Vercel** para o deploy (etapa 10).
- Validar o visual da etapa 1 antes de seguir (pra garantir que ficou fiel à identidade Connexa).
