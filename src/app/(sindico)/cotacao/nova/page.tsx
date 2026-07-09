import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NovaCotacaoForm, { type CarteiraEmpresa } from "./form";

type WalletRow = {
  companies:
    | {
        id: string;
        nome: string;
        segments: { nome: string } | { nome: string }[] | null;
      }
    | {
        id: string;
        nome: string;
        segments: { nome: string } | { nome: string }[] | null;
      }[]
    | null;
};

/** Carrega a carteira do síndico (fonte da seleção de empresas) */
export default async function NovaCotacaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: raw } = await supabase
    .from("wallet")
    .select("companies(id, nome, segments(nome))")
    .eq("sindico_id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, telefone")
    .eq("id", user.id)
    .single();

  const carteira: CarteiraEmpresa[] = ((raw as WalletRow[]) ?? [])
    .map((r) => (Array.isArray(r.companies) ? r.companies[0] : r.companies))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => {
      const seg = Array.isArray(c.segments) ? c.segments[0] : c.segments;
      return { id: c.id, nome: c.nome, segmento: seg?.nome ?? "Outros" };
    });

  return (
    <NovaCotacaoForm
      carteira={carteira}
      emailPadrao={profile?.email ?? ""}
      telefonePadrao={profile?.telefone ?? ""}
    />
  );
}
