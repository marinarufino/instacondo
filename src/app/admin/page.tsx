import { createClient } from "@/lib/supabase/server";
import {
  Building2,
  CheckCircle2,
  Users,
  FileText,
  Activity,
  MapPin,
} from "lucide-react";
import MapaRegioes, { type RegiaoMapa } from "./MapaRegioes";
import {
  ToggleAssinatura,
  RegioesManager,
  PatrocinadoresManager,
  FrequenciaBanner,
} from "./Controles";

function nomeRegiao(
  regions: { nome: string } | { nome: string }[] | null
): string {
  const r = Array.isArray(regions) ? regions[0] : regions;
  return r?.nome ?? "—";
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { data: companies },
    { data: profiles },
    { data: wallet },
    { data: quotes },
    { data: quoteCompanies },
    { data: regions },
    { data: sponsors },
    { data: settings },
  ] = await Promise.all([
    supabase.from("companies").select("id, nome, assinatura_ativa, region_id, regions(nome)"),
    supabase.from("profiles").select("id, nome, role, region_id"),
    supabase.from("wallet").select("sindico_id, company_id"),
    supabase.from("quotes").select("id, sindico_id"),
    supabase.from("quote_companies").select("company_id"),
    supabase.from("regions").select("id, nome, ativa").order("nome"),
    supabase.from("sponsors").select("id, nome, banner_url, link_url, ativo"),
    supabase.from("settings").select("banner_frequency").single(),
  ]);

  const comps = companies ?? [];
  const profs = profiles ?? [];
  const wal = wallet ?? [];
  const qts = quotes ?? [];
  const qcs = quoteCompanies ?? [];
  const regs = regions ?? [];

  const sindicos = profs.filter((p) => p.role === "sindico");
  const empresasAtivas = comps.filter((c) => c.assinatura_ativa).length;
  const sindicosAtivos = new Set(qts.map((q) => q.sindico_id)).size;

  // Contagens por empresa
  const carteirasPorEmpresa = new Map<string, number>();
  wal.forEach((w) =>
    carteirasPorEmpresa.set(
      w.company_id,
      (carteirasPorEmpresa.get(w.company_id) ?? 0) + 1
    )
  );
  const cotacoesPorEmpresa = new Map<string, number>();
  qcs.forEach((q) =>
    cotacoesPorEmpresa.set(
      q.company_id,
      (cotacoesPorEmpresa.get(q.company_id) ?? 0) + 1
    )
  );
  const empresasPorSindico = new Map<string, number>();
  wal.forEach((w) =>
    empresasPorSindico.set(
      w.sindico_id,
      (empresasPorSindico.get(w.sindico_id) ?? 0) + 1
    )
  );
  const sindicoTemCotacao = new Set(qts.map((q) => q.sindico_id));

  // Dados do mapa (por região)
  const mapa: RegiaoMapa[] = regs.map((r) => ({
    nome: r.nome,
    empresas: comps.filter((c) => c.region_id === r.id).length,
    sindicos: sindicos.filter((s) => s.region_id === r.id).length,
  }));

  const metrics = [
    { icon: Building2, label: "Empresas", valor: comps.length, cor: "text-primary bg-primary/10" },
    { icon: CheckCircle2, label: "Empresas ativas", valor: empresasAtivas, cor: "text-green-600 bg-green-100" },
    { icon: Users, label: "Síndicos", valor: sindicos.length, cor: "text-accent bg-accent/10" },
    { icon: FileText, label: "Cotações", valor: qts.length, cor: "text-amber-600 bg-amber-100" },
    { icon: Activity, label: "Síndicos ativos", valor: sindicosAtivos, cor: "text-rose-600 bg-rose-100" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-dark">Painel do Administrador</h1>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl bg-white p-4 shadow-sm">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.cor}`}>
              <m.icon size={18} />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-dark">{m.valor}</p>
            <p className="text-xs text-muted">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Mapa */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-dark">
          <MapPin size={18} className="text-primary" /> Mapa por região
        </h2>
        <MapaRegioes regioes={mapa} />
        <p className="mt-2 text-xs text-muted">
          Tamanho do círculo = total de empresas + síndicos na região. Clique para
          ver os números.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Empresas */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-dark">Empresas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-muted">
                  <th className="pb-2">Nome</th>
                  <th className="pb-2">Região</th>
                  <th className="pb-2 text-center">Carteiras</th>
                  <th className="pb-2 text-center">Cotações</th>
                  <th className="pb-2 text-right">Assinatura</th>
                </tr>
              </thead>
              <tbody>
                {comps.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50">
                    <td className="py-2 font-medium text-dark">{c.nome}</td>
                    <td className="py-2 text-muted">{nomeRegiao(c.regions)}</td>
                    <td className="py-2 text-center text-muted">
                      {carteirasPorEmpresa.get(c.id) ?? 0}
                    </td>
                    <td className="py-2 text-center text-muted">
                      {cotacoesPorEmpresa.get(c.id) ?? 0}
                    </td>
                    <td className="py-2 text-right">
                      <ToggleAssinatura companyId={c.id} ativa={c.assinatura_ativa} />
                    </td>
                  </tr>
                ))}
                {comps.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted">
                      Nenhuma empresa cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Síndicos */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-dark">Síndicos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-muted">
                  <th className="pb-2">Nome</th>
                  <th className="pb-2 text-center">Empresas na carteira</th>
                  <th className="pb-2 text-right">Situação</th>
                </tr>
              </thead>
              <tbody>
                {sindicos.map((s) => {
                  const ativo = sindicoTemCotacao.has(s.id);
                  return (
                    <tr key={s.id} className="border-b border-slate-50">
                      <td className="py-2 font-medium text-dark">
                        {s.nome || "—"}
                      </td>
                      <td className="py-2 text-center text-muted">
                        {empresasPorSindico.get(s.id) ?? 0}
                      </td>
                      <td className="py-2 text-right">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ativo
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {sindicos.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-muted">
                      Nenhum síndico cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Regiões */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-dark">Regiões</h2>
          <RegioesManager regioes={regs} />
        </section>

        {/* Patrocinadores + frequência */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-dark">
            Patrocinadores (banners)
          </h2>
          <div className="mb-4">
            <FrequenciaBanner atual={settings?.banner_frequency ?? 5} />
          </div>
          <PatrocinadoresManager patrocinadores={sponsors ?? []} />
        </section>
      </div>
    </div>
  );
}
