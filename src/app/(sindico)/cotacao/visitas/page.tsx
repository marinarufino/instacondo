import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CalendarCheck, Building2, Clock } from "lucide-react";

type QuoteCompanyJoin = {
  companies: { nome: string } | { nome: string }[] | null;
  quotes:
    | { condominio: string; sindico_id: string }
    | { condominio: string; sindico_id: string }[]
    | null;
};

type AppointmentRow = {
  id: string;
  quote_slots: { inicio: string } | { inicio: string }[] | null;
  quote_companies: QuoteCompanyJoin | QuoteCompanyJoin[] | null;
};

function pick<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

/** Lista vertical de visitas agendadas do síndico */
export default async function VisitasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: raw } = await supabase
    .from("appointments")
    .select(
      "id, quote_slots(inicio), quote_companies(companies(nome), quotes(condominio, sindico_id))"
    );

  const visitas = ((raw as unknown as AppointmentRow[]) ?? [])
    .map((a) => {
      const slot = pick(a.quote_slots);
      const qc = pick(a.quote_companies);
      const empresa = pick(qc?.companies ?? null);
      const quote = pick(qc?.quotes ?? null);
      return {
        id: a.id,
        inicio: slot?.inicio ?? "",
        empresa: empresa?.nome ?? "Empresa",
        condominio: quote?.condominio ?? "",
        sindicoId: quote?.sindico_id ?? "",
      };
    })
    .filter((v) => v.sindicoId === user.id && v.inicio)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));

  return (
    <div className="flex-1 pb-28">
      <header className="rounded-b-3xl bg-gradient-to-br from-primary to-primary-light px-6 pb-6 pt-8 text-white">
        <Link
          href="/cotacao"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/85"
        >
          <ChevronLeft size={18} /> Voltar
        </Link>
        <h1 className="text-2xl font-bold">Minhas visitas</h1>
        <p className="mt-1 text-sm text-white/85">
          {visitas.length} visita{visitas.length !== 1 ? "s" : ""} agendada
          {visitas.length !== 1 ? "s" : ""}.
        </p>
      </header>

      <div className="px-5 py-5">
        {visitas.length > 0 ? (
          <div className="flex flex-col gap-3">
            {visitas.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <span className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="text-sm font-bold leading-none">
                    {formatarDia(v.inicio)}
                  </span>
                  <span className="text-[10px] uppercase">
                    {formatarMes(v.inicio)}
                  </span>
                </span>
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-dark">
                    <Building2 size={14} className="text-primary" />
                    {v.empresa}
                  </p>
                  <p className="text-xs text-muted">{v.condominio}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-accent">
                    <Clock size={12} /> {formatarHora(v.inicio)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted">
            <CalendarCheck size={32} />
            <p className="text-sm">
              Nenhuma visita agendada ainda. As empresas que aceitarem e
              escolherem um horário aparecem aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatarDia(iso: string) {
  return iso.split("T")[0].split("-")[2];
}
const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function formatarMes(iso: string) {
  const m = parseInt(iso.split("T")[0].split("-")[1], 10);
  return meses[m - 1] ?? "";
}
function formatarHora(iso: string) {
  return iso.split("T")[1]?.slice(0, 5) ?? "";
}
