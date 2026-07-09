import { createClient } from "@/lib/supabase/server";
import { SearchX, MapPin, UserRound } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import WalletButton from "@/components/WalletButton";
import FilterBar from "./FilterBar";
import type { Region, Segment } from "@/lib/types";

type CompanyRow = {
  id: string;
  nome: string;
  cidade: string;
  onde_atende: string;
  segments: { nome: string } | { nome: string }[] | null;
};

/** Botão 2 — Filtro: busca empresas por segmento e região */
export default async function FiltroPage({
  searchParams,
}: {
  searchParams: Promise<{ segmento?: string; regiao?: string }>;
}) {
  const { segmento, regiao } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Catálogo para os selects
  const [{ data: regioes }, { data: segmentos }] = await Promise.all([
    supabase.from("regions").select("id, nome, ativa").eq("ativa", true).order("nome"),
    supabase.from("segments").select("id, nome").order("nome"),
  ]);

  // Empresas ativas conforme filtro
  let query = supabase
    .from("companies")
    .select("id, nome, cidade, onde_atende, segments(nome)")
    .eq("assinatura_ativa", true)
    .order("nome");
  if (segmento) query = query.eq("segment_id", segmento);
  if (regiao) query = query.eq("region_id", regiao);
  const { data: empresasRaw } = await query;

  // Carteira atual do síndico
  const { data: walletRaw } = user
    ? await supabase.from("wallet").select("company_id").eq("sindico_id", user.id)
    : { data: [] as { company_id: string }[] };
  const walletIds = new Set((walletRaw ?? []).map((w) => w.company_id));

  const empresas = (empresasRaw as CompanyRow[]) ?? [];

  return (
    <div className="pb-28">
      <PageHeader
        title="Filtro"
        subtitle="Encontre empresas por especialidade e região."
      />

      <div className="px-5 py-5">
        <FilterBar
          regioes={(regioes as Region[]) ?? []}
          segmentos={(segmentos as Segment[]) ?? []}
        />

        <p className="mt-4 text-xs font-medium text-muted">
          {empresas.length}{" "}
          {empresas.length === 1 ? "empresa encontrada" : "empresas encontradas"}
        </p>

        <div className="mt-3 flex flex-col gap-3">
          {empresas.map((e) => {
            const seg = Array.isArray(e.segments) ? e.segments[0] : e.segments;
            return (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light to-primary text-white">
                  <UserRound size={22} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark">{e.nome}</p>
                  <p className="text-xs text-primary">{seg?.nome}</p>
                  {(e.cidade || e.onde_atende) && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <MapPin size={11} />
                      {e.cidade || e.onde_atende}
                    </p>
                  )}
                </div>
                <WalletButton companyId={e.id} inicial={walletIds.has(e.id)} />
              </div>
            );
          })}
        </div>

        {empresas.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted">
            <SearchX size={32} />
            <p className="text-sm">
              Nenhuma empresa encontrada com esses filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
