"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type EmpresaState = { erro?: string };

/** Salva os dados complementares da empresa e leva para a tela de assinatura */
export async function salvarEmpresa(
  _prev: EmpresaState,
  formData: FormData
): Promise<EmpresaState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const nome = String(formData.get("nome") ?? "").trim();
  const cnpj = String(formData.get("cnpj") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const cidade = String(formData.get("cidade") ?? "").trim();
  const segment_id = String(formData.get("segment_id") ?? "");
  const region_id = String(formData.get("region_id") ?? "");
  const onde_atende = String(formData.get("onde_atende") ?? "").trim();
  const servicos = String(formData.get("servicos") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();

  if (!nome) return { erro: "Informe o nome da empresa." };
  if (!segment_id) return { erro: "Selecione o segmento de atuação." };
  if (!region_id) return { erro: "Selecione a região." };

  // Atualiza telefone no perfil
  await supabase.from("profiles").update({ telefone, region_id }).eq("id", user!.id);

  // Cria (ou atualiza) a empresa vinculada ao perfil
  const { error } = await supabase.from("companies").upsert(
    {
      profile_id: user!.id,
      nome,
      cnpj,
      cidade,
      segment_id,
      region_id,
      onde_atende,
      servicos,
      descricao,
      assinatura_ativa: false,
    },
    { onConflict: "profile_id" }
  );

  if (error) {
    return { erro: "Não foi possível salvar. Verifique os dados e tente de novo." };
  }

  redirect("/empresa/assinatura");
}
