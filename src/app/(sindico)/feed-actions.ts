"use server";

import { createClient } from "@/lib/supabase/server";

/** Alterna o like de um vídeo (retorna o novo estado) */
export async function toggleLike(
  videoId: string,
  liked: boolean
): Promise<{ liked: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { liked };

  if (liked) {
    await supabase
      .from("likes")
      .delete()
      .eq("sindico_id", user.id)
      .eq("video_id", videoId);
    return { liked: false };
  }

  await supabase.from("likes").insert({ sindico_id: user.id, video_id: videoId });
  return { liked: true };
}

/** Adiciona/remove uma empresa da carteira (Banco de Empresas) */
export async function toggleWallet(
  companyId: string,
  inWallet: boolean
): Promise<{ inWallet: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { inWallet };

  if (inWallet) {
    await supabase
      .from("wallet")
      .delete()
      .eq("sindico_id", user.id)
      .eq("company_id", companyId);
    return { inWallet: false };
  }

  await supabase
    .from("wallet")
    .insert({ sindico_id: user.id, company_id: companyId });
  return { inWallet: true };
}
