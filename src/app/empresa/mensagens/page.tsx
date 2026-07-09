import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ConversasView from "@/components/mensagens/ConversasView";
import { carregarConversas } from "@/lib/messages";

/** Mensagens da empresa com os síndicos */
export default async function EmpresaMensagensPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const conversas = await carregarConversas(supabase, user.id);

  return (
    <div className="flex-1">
      <header className="rounded-b-3xl bg-gradient-to-br from-primary to-primary-light px-6 pb-6 pt-8 text-white">
        <Link
          href="/empresa"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/85"
        >
          <ChevronLeft size={18} /> Voltar
        </Link>
        <h1 className="text-2xl font-bold">Mensagens</h1>
        <p className="mt-1 text-sm text-white/85">
          Converse com os síndicos interessados.
        </p>
      </header>
      <div className="px-6 pb-28 pt-6">
        <ConversasView conversas={conversas} basePath="/empresa/mensagens" />
      </div>
    </div>
  );
}
