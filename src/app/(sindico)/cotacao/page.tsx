import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CotacaoCard, { type CotacaoResumo } from "./CotacaoCard";

type QuoteRow = {
  id: string;
  condominio: string;
  servico: string;
  urgencia: "baixa" | "media" | "alta";
  status: "ativa" | "cancelada" | "concluida";
  created_at: string;
  quote_companies: { status: "pendente" | "aceita" | "recusada" }[];
};

/** Botão 3 — Cotação: lista de cotações + nova cotação */
export default async function CotacaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: raw } = await supabase
    .from("quotes")
    .select(
      "id, condominio, servico, urgencia, status, created_at, quote_companies(status)"
    )
    .eq("sindico_id", user.id)
    .order("created_at", { ascending: false });

  const cotacoes: CotacaoResumo[] = ((raw as QuoteRow[]) ?? []).map((q) => ({
    id: q.id,
    condominio: q.condominio,
    servico: q.servico,
    urgencia: q.urgencia,
    status: q.status,
    criadaEm: q.created_at,
    totalEmpresas: q.quote_companies.length,
    aceitas: q.quote_companies.filter((c) => c.status === "aceita").length,
    recusadas: q.quote_companies.filter((c) => c.status === "recusada").length,
  }));

  return (
    <div className="pb-28">
      <PageHeader
        title="Cotação"
        subtitle="Dispare cotações para as empresas da sua carteira."
      />

      <div className="px-5 py-5">
        <Link
          href="/cotacao/nova"
          className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary-light to-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform active:scale-[0.98]"
        >
          <Plus size={18} /> Nova cotação
        </Link>

        {cotacoes.length > 0 ? (
          <>
            <h2 className="mb-3 mt-6 text-sm font-bold text-dark">
              Minhas cotações
            </h2>
            <div className="flex flex-col gap-3">
              {cotacoes.map((c) => (
                <CotacaoCard key={c.id} cotacao={c} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted">
            <FileText size={32} />
            <p className="text-sm">
              Você ainda não enviou nenhuma cotação. Toque em “Nova cotação” para
              começar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
