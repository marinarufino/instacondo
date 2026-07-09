import type { createClient } from "@/lib/supabase/server";

type SB = Awaited<ReturnType<typeof createClient>>;

export type Conversa = {
  otherId: string;
  nome: string;
  ehEmpresa: boolean;
  ultima: string;
  quando: string;
  naoLidas: number;
};

export type Mensagem = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

/** Nome de exibição por perfil (empresa → nome da empresa; senão nome do perfil) */
async function nomesDisplay(supabase: SB, ids: string[]) {
  const mapa = new Map<string, { nome: string; ehEmpresa: boolean }>();
  if (ids.length === 0) return mapa;

  const [{ data: profs }, { data: comps }] = await Promise.all([
    supabase.from("profiles").select("id, nome, role").in("id", ids),
    supabase.from("companies").select("profile_id, nome").in("profile_id", ids),
  ]);

  const compMap = new Map(
    ((comps as { profile_id: string; nome: string }[]) ?? []).map((c) => [
      c.profile_id,
      c.nome,
    ])
  );
  ((profs as { id: string; nome: string; role: string }[]) ?? []).forEach((p) => {
    const ehEmpresa = p.role === "empresa";
    mapa.set(p.id, {
      nome: ehEmpresa ? compMap.get(p.id) || p.nome || "Empresa" : p.nome || "Síndico",
      ehEmpresa,
    });
  });
  return mapa;
}

/** Lista de conversas do usuário (agrupadas pela outra pessoa) */
export async function carregarConversas(
  supabase: SB,
  userId: string
): Promise<Conversa[]> {
  const { data } = await supabase
    .from("messages")
    .select("sender_id, recipient_id, content, read, created_at")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  type Row = {
    sender_id: string;
    recipient_id: string;
    content: string;
    read: boolean;
    created_at: string;
  };
  const rows = (data as Row[]) ?? [];

  const agg = new Map<string, { ultima: string; quando: string; naoLidas: number }>();
  for (const m of rows) {
    const other = m.sender_id === userId ? m.recipient_id : m.sender_id;
    if (!agg.has(other)) {
      agg.set(other, { ultima: m.content, quando: m.created_at, naoLidas: 0 });
    }
    if (m.recipient_id === userId && !m.read) {
      agg.get(other)!.naoLidas++;
    }
  }

  const ids = [...agg.keys()];
  const nomes = await nomesDisplay(supabase, ids);
  return ids.map((id) => ({
    otherId: id,
    nome: nomes.get(id)?.nome ?? "Usuário",
    ehEmpresa: nomes.get(id)?.ehEmpresa ?? false,
    ultima: agg.get(id)!.ultima,
    quando: agg.get(id)!.quando,
    naoLidas: agg.get(id)!.naoLidas,
  }));
}

/** Carrega a conversa entre o usuário e outra pessoa; marca as recebidas como lidas */
export async function carregarThread(
  supabase: SB,
  userId: string,
  otherId: string
): Promise<{ nome: string; ehEmpresa: boolean; mensagens: Mensagem[] }> {
  const { data } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });

  // marca como lidas as mensagens recebidas
  await supabase
    .from("messages")
    .update({ read: true })
    .eq("recipient_id", userId)
    .eq("sender_id", otherId)
    .eq("read", false);

  const nomes = await nomesDisplay(supabase, [otherId]);
  return {
    nome: nomes.get(otherId)?.nome ?? "Usuário",
    ehEmpresa: nomes.get(otherId)?.ehEmpresa ?? false,
    mensagens: (data as Mensagem[]) ?? [],
  };
}

/** Total de mensagens não lidas (para o selo na navegação) */
export async function contarNaoLidas(supabase: SB, userId: string): Promise<number> {
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("read", false);
  return count ?? 0;
}
