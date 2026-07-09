"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Envia uma mensagem para outro usuário (perfil) */
export async function enviarMensagem(
  recipientId: string,
  content: string
): Promise<{ erro?: string; ok?: boolean }> {
  const texto = content.trim();
  if (!texto) return { erro: "Mensagem vazia." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada." };
  if (recipientId === user.id) return { erro: "Você não pode enviar mensagem para si mesmo." };

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: recipientId,
    content: texto,
  });
  if (error) return { erro: "Não foi possível enviar a mensagem." };

  revalidatePath("/mensagens");
  revalidatePath(`/mensagens/${recipientId}`);
  revalidatePath("/empresa/mensagens");
  revalidatePath(`/empresa/mensagens/${recipientId}`);
  return { ok: true };
}
