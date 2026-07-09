import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ConversasView from "@/components/mensagens/ConversasView";
import { carregarConversas } from "@/lib/messages";

/** Botão 5 — Mensagens: conversas do síndico com empresas */
export default async function MensagensPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const conversas = await carregarConversas(supabase, user.id);

  return (
    <div className="pb-28">
      <PageHeader
        title="Mensagens"
        subtitle="Converse diretamente com as empresas."
      />
      <div className="px-5 py-5">
        <ConversasView conversas={conversas} basePath="/mensagens" />
      </div>
    </div>
  );
}
