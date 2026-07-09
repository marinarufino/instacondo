import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Video, Bell, Calendar, LogOut, CheckCircle2, Clock } from "lucide-react";
import { logout } from "../(auth)/actions";
import { ConnexaMark } from "@/components/ConnexaLogo";

/** Painel inicial da empresa */
export default async function EmpresaHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("nome, assinatura_ativa")
    .eq("profile_id", user.id)
    .single();

  // Empresa sem cadastro completo → volta pro cadastro
  if (!company) redirect("/empresa/cadastro");

  const ativa = company.assinatura_ativa;

  const atalhos = [
    {
      icon: Video,
      titulo: "Meus vídeos",
      desc: "Até 5 vídeos",
      href: "/empresa/videos",
      etapa: null,
    },
    {
      icon: Bell,
      titulo: "Cotações",
      desc: "Recebidas dos síndicos",
      href: null,
      etapa: "Etapa 6",
    },
    {
      icon: Calendar,
      titulo: "Agenda",
      desc: "Visitas marcadas",
      href: null,
      etapa: "Etapa 7",
    },
  ];

  return (
    <main className="flex-1">
      <header className="rounded-b-3xl bg-gradient-to-br from-primary to-primary-light px-6 pb-6 pt-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
              <ConnexaMark size={22} />
            </span>
            <span className="font-bold">Connexa Empresas</span>
          </div>
          <form action={logout}>
            <button
              className="rounded-full bg-white/15 p-2"
              aria-label="Sair"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
        <h1 className="mt-5 text-2xl font-bold">{company.nome}</h1>

        {/* Status da assinatura */}
        <div
          className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            ativa ? "bg-green-400/20 text-green-50" : "bg-amber-400/20 text-amber-50"
          }`}
        >
          {ativa ? <CheckCircle2 size={14} /> : <Clock size={14} />}
          {ativa ? "Assinatura ativa" : "Aguardando ativação"}
        </div>
      </header>

      <section className="px-6 py-6">
        <h2 className="mb-3 text-base font-bold text-dark">Gerenciar</h2>
        <div className="flex flex-col gap-3">
          {atalhos.map(({ icon: Icon, titulo, desc, href, etapa }) => {
            const conteudo = (
              <>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={20} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark">{titulo}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
                {etapa && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-muted">
                    {etapa}
                  </span>
                )}
              </>
            );
            return href ? (
              <Link
                key={titulo}
                href={href}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-transform active:scale-[0.99]"
              >
                {conteudo}
              </Link>
            ) : (
              <div
                key={titulo}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 opacity-70 shadow-sm"
              >
                {conteudo}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
