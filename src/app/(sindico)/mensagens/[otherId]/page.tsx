import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatThread from "@/components/mensagens/ChatThread";
import { carregarThread } from "@/lib/messages";

/** Conversa do síndico com uma empresa */
export default async function ThreadPage({
  params,
}: {
  params: Promise<{ otherId: string }>;
}) {
  const { otherId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { nome, ehEmpresa, mensagens } = await carregarThread(
    supabase,
    user.id,
    otherId
  );

  return (
    <ChatThread
      currentUserId={user.id}
      otherId={otherId}
      nome={nome}
      ehEmpresa={ehEmpresa}
      mensagens={mensagens}
      backHref="/mensagens"
      comNav
    />
  );
}
