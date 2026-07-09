import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import BancoList, { type WalletCompany } from "./BancoList";

type CompanyJoin = {
  id: string;
  profile_id: string;
  nome: string;
  cidade: string;
  onde_atende: string;
  segments: { nome: string } | { nome: string }[] | null;
};

type WalletRow = {
  company_id: string;
  companies: CompanyJoin | CompanyJoin[] | null;
};

/** Botão 4 — Banco de Empresas: carteira de fornecedores agrupada por segmento */
export default async function BancoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: raw } = await supabase
    .from("wallet")
    .select(
      "company_id, companies(id, profile_id, nome, cidade, onde_atende, segments(nome))"
    )
    .eq("sindico_id", user.id);

  const empresas: WalletCompany[] = ((raw as unknown as WalletRow[]) ?? [])
    .map((r) => (Array.isArray(r.companies) ? r.companies[0] : r.companies))
    .filter((c): c is CompanyJoin => Boolean(c))
    .map((c) => {
      const seg = Array.isArray(c.segments) ? c.segments[0] : c.segments;
      return {
        id: c.id,
        profileId: c.profile_id,
        nome: c.nome,
        cidade: c.cidade,
        onde_atende: c.onde_atende,
        segmento: seg?.nome ?? "Outros",
      };
    });

  return (
    <div className="pb-28">
      <PageHeader
        title="Banco de Empresas"
        subtitle="Sua carteira de fornecedores, organizada por tema."
      />
      <div className="px-5 py-5">
        <BancoList inicial={empresas} />
      </div>
    </div>
  );
}
