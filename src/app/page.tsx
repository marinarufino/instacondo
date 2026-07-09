import {
  Bell,
  Search,
  Sparkles,
  Shield,
  Wrench,
  Leaf,
  LayoutGrid,
  Star,
  Play,
} from "lucide-react";
import { ConnexaMark } from "@/components/ConnexaLogo";

/** Dados de demonstração — serão substituídos pelo Supabase na Etapa 4 */
const categorias = [
  { nome: "Limpeza", icon: Sparkles },
  { nome: "Segurança", icon: Shield },
  { nome: "Manutenção", icon: Wrench },
  { nome: "Jardinagem", icon: Leaf },
  { nome: "Outros", icon: LayoutGrid },
];

const destaques = [
  { nome: "Clean Master", segmento: "Limpeza e Conservação", nota: 4.9 },
  { nome: "SeguraMax", segmento: "Segurança Patrimonial", nota: 4.8 },
  { nome: "Manuten+", segmento: "Manutenção Predial", nota: 4.7 },
];

export default function Home() {
  return (
    <div>
      {/* ── Header roxo (identidade visual) ─────────────── */}
      <header className="rounded-b-3xl bg-gradient-to-br from-primary to-primary-light px-5 pb-6 pt-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
              <ConnexaMark size={24} />
            </span>
            <span className="text-lg font-bold">Connexa</span>
          </div>
          <button
            aria-label="Notificações"
            className="relative rounded-full bg-white/15 p-2"
          >
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-400" />
          </button>
        </div>

        <h1 className="mt-5 text-2xl font-bold">Olá, Síndico! 👋</h1>
        <p className="mt-1 text-sm text-white/85">
          Conecte-se com empresas confiáveis e soluções para o seu condomínio.
        </p>

        {/* Busca */}
        <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-md">
          <Search size={18} className="text-muted" />
          <input
            className="w-full bg-transparent text-sm text-dark outline-none placeholder:text-muted"
            placeholder="Buscar serviços ou empresas"
          />
        </div>
      </header>

      {/* ── Categorias ──────────────────────────────────── */}
      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-dark">Categorias</h2>
          <button className="text-xs font-semibold text-primary">
            Ver todas
          </button>
        </div>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
          {categorias.map(({ nome, icon: Icon }) => (
            <button
              key={nome}
              className="flex min-w-[72px] flex-col items-center gap-2 rounded-2xl bg-white px-3 py-3 shadow-sm transition-colors hover:bg-primary/5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={20} />
              </span>
              <span className="text-[11px] font-medium text-dark">{nome}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Empresas em destaque ────────────────────────── */}
      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-dark">
            Empresas em destaque
          </h2>
          <button className="text-xs font-semibold text-primary">
            Ver todas
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {destaques.map((e) => (
            <div
              key={e.nome}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light to-primary text-white">
                <Play size={20} fill="currentColor" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-dark">{e.nome}</p>
                <p className="text-xs text-muted">{e.segmento}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-500">
                  <Star size={12} fill="currentColor" /> {e.nota}
                </p>
              </div>
              <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-transform active:scale-95">
                Ver perfil
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tagline ─────────────────────────────────────── */}
      <p className="mt-8 pb-4 text-center text-sm font-semibold">
        <span className="text-dark">Conecta. Facilita. </span>
        <span className="text-accent">Transforma.</span>
      </p>
    </div>
  );
}
