import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Inbox } from "lucide-react";
import CotacaoEmpresaCard, { type ConviteEmpresa } from "./CotacaoEmpresaCard";

/** Caixa de entrada de cotações da empresa */
export default async function EmpresaCotacoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("profile_id", user.id)
    .single();
  if (!company) redirect("/empresa/cadastro");

  // Convites recebidos
  const { data: convites } = await supabase
    .from("quote_companies")
    .select(
      "id, status, quotes(id, condominio, endereco, servico, urgencia, status, created_at)"
    )
    .eq("company_id", company.id);

  type ConviteRow = {
    id: string;
    status: "pendente" | "aceita" | "recusada";
    quotes:
      | {
          id: string;
          condominio: string;
          endereco: string;
          servico: string;
          urgencia: "baixa" | "media" | "alta";
          status: string;
          created_at: string;
        }
      | {
          id: string;
          condominio: string;
          endereco: string;
          servico: string;
          urgencia: "baixa" | "media" | "alta";
          status: string;
          created_at: string;
        }[]
      | null;
  };

  const rows = (convites as ConviteRow[]) ?? [];

  // Horários disponíveis por cotação (sem agendamento ainda)
  const quoteIds = rows
    .map((r) => (Array.isArray(r.quotes) ? r.quotes[0]?.id : r.quotes?.id))
    .filter(Boolean) as string[];

  const slotsPorQuote: Record<
    string,
    { id: string; inicio: string; ocupado: boolean }[]
  > = {};

  if (quoteIds.length > 0) {
    const { data: slots } = await supabase
      .from("quote_slots")
      .select("id, quote_id, inicio, appointments(id)")
      .in("quote_id", quoteIds)
      .order("inicio");

    type SlotRow = {
      id: string;
      quote_id: string;
      inicio: string;
      appointments: { id: string }[];
    };
    ((slots as SlotRow[]) ?? []).forEach((s) => {
      (slotsPorQuote[s.quote_id] ??= []).push({
        id: s.id,
        inicio: s.inicio,
        ocupado: s.appointments.length > 0,
      });
    });
  }

  const convitesData: ConviteEmpresa[] = rows
    .map((r) => {
      const q = Array.isArray(r.quotes) ? r.quotes[0] : r.quotes;
      if (!q) return null;
      return {
        quoteCompanyId: r.id,
        status: r.status,
        condominio: q.condominio,
        endereco: q.endereco,
        servico: q.servico,
        urgencia: q.urgencia,
        cotacaoCancelada: q.status === "cancelada",
        slots: slotsPorQuote[q.id] ?? [],
      };
    })
    .filter((c): c is ConviteEmpresa => c !== null);

  return (
    <div className="flex-1">
      <header className="rounded-b-3xl bg-gradient-to-br from-primary to-primary-light px-6 pb-6 pt-8 text-white">
        <Link
          href="/empresa"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/85"
        >
          <ChevronLeft size={18} /> Voltar
        </Link>
        <h1 className="text-2xl font-bold">Cotações recebidas</h1>
        <p className="mt-1 text-sm text-white/85">
          Aceite escolhendo um horário ou recuse o convite.
        </p>
      </header>

      <div className="px-6 pb-28 pt-6">
        {convitesData.length > 0 ? (
          <div className="flex flex-col gap-4">
            {convitesData.map((c) => (
              <CotacaoEmpresaCard key={c.quoteCompanyId} convite={c} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted">
            <Inbox size={32} />
            <p className="text-sm">
              Nenhuma cotação recebida ainda. Quando um síndico enviar, ela
              aparece aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
