"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type NovaCotacao = {
  condominio: string;
  endereco: string;
  telefone: string;
  email: string;
  servico: string;
  urgencia: "baixa" | "media" | "alta";
  fotos: string[]; // URLs públicas já enviadas ao Storage
  empresaIds: string[];
};

export type CotacaoResult = { erro?: string; ok?: boolean };

/** Cria uma cotação e convida as empresas selecionadas */
export async function criarCotacao(
  dados: NovaCotacao
): Promise<CotacaoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada. Entre novamente." };

  if (!dados.condominio.trim()) return { erro: "Informe o nome do condomínio." };
  if (!dados.servico.trim()) return { erro: "Descreva o serviço desejado." };
  if (dados.empresaIds.length === 0)
    return { erro: "Selecione ao menos uma empresa." };

  // Cria a cotação
  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      sindico_id: user.id,
      condominio: dados.condominio.trim(),
      endereco: dados.endereco.trim(),
      telefone: dados.telefone.trim(),
      email: dados.email.trim(),
      servico: dados.servico.trim(),
      urgencia: dados.urgencia,
    })
    .select("id")
    .single();

  if (error || !quote) {
    return { erro: "Não foi possível criar a cotação. Tente novamente." };
  }

  // Fotos
  if (dados.fotos.length > 0) {
    await supabase
      .from("quote_photos")
      .insert(dados.fotos.map((url) => ({ quote_id: quote.id, url })));
  }

  // Empresas convidadas
  const { error: convErro } = await supabase.from("quote_companies").insert(
    dados.empresaIds.map((company_id) => ({
      quote_id: quote.id,
      company_id,
    }))
  );
  if (convErro) {
    return { erro: "Cotação criada, mas houve erro ao convidar as empresas." };
  }

  revalidatePath("/cotacao");
  return { ok: true };
}

/** Cancela uma cotação */
export async function cancelarCotacao(quoteId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("quotes").update({ status: "cancelada" }).eq("id", quoteId);
  revalidatePath("/cotacao");
}

/**
 * Repete uma cotação: cria uma nova cópia (ativa) com os mesmos dados e empresas.
 */
export async function repetirCotacao(quoteId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orig } = await supabase
    .from("quotes")
    .select("condominio, endereco, telefone, email, servico, urgencia")
    .eq("id", quoteId)
    .single();
  if (!orig) return;

  const { data: nova } = await supabase
    .from("quotes")
    .insert({ ...orig, sindico_id: user.id })
    .select("id")
    .single();
  if (!nova) return;

  const { data: empresas } = await supabase
    .from("quote_companies")
    .select("company_id")
    .eq("quote_id", quoteId);

  if (empresas && empresas.length > 0) {
    await supabase.from("quote_companies").insert(
      empresas.map((e) => ({ quote_id: nova.id, company_id: e.company_id }))
    );
  }

  revalidatePath("/cotacao");
}
