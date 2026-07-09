"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type VideoActionState = { erro?: string; ok?: boolean };

/**
 * Registra um vídeo já enviado ao Storage.
 * Regras do escopo (também garantidas por trigger no banco):
 * máx. 5 vídeos por empresa e duração de até 120s.
 */
export async function registrarVideo(
  storagePath: string,
  duracaoSeg: number
): Promise<VideoActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada. Entre novamente." };

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("profile_id", user.id)
    .single();
  if (!company) return { erro: "Empresa não encontrada." };

  if (duracaoSeg < 1 || duracaoSeg > 120) {
    return { erro: "O vídeo deve ter no máximo 2 minutos (120s)." };
  }

  // Conta vídeos atuais para dar mensagem clara antes do trigger
  const { count } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id);

  if ((count ?? 0) >= 5) {
    return {
      erro: "Você já tem 5 vídeos. Apague um para adicionar outro.",
    };
  }

  const { data: pub } = supabase.storage.from("videos").getPublicUrl(storagePath);

  const { error } = await supabase.from("videos").insert({
    company_id: company.id,
    url: pub.publicUrl,
    duracao_seg: Math.round(duracaoSeg),
    ordem: (count ?? 0) + 1,
  });

  if (error) {
    return { erro: "Não foi possível salvar o vídeo. Tente novamente." };
  }

  revalidatePath("/empresa/videos");
  return { ok: true };
}

/** Remove um vídeo (registro + arquivo no Storage) */
export async function apagarVideo(
  videoId: string,
  storagePath: string
): Promise<VideoActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada." };

  const { error } = await supabase.from("videos").delete().eq("id", videoId);
  if (error) return { erro: "Não foi possível apagar o vídeo." };

  // Remove o arquivo do Storage (best-effort)
  if (storagePath) {
    await supabase.storage.from("videos").remove([storagePath]);
  }

  revalidatePath("/empresa/videos");
  return { ok: true };
}
