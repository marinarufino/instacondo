"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ResponderResult = { erro?: string; ok?: boolean };

/** Empresa aceita o convite escolhendo um horário (ou recusa) */
export async function responderConvite(
  quoteCompanyId: string,
  resposta: "aceita" | "recusada",
  slotId?: string
): Promise<ResponderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada." };

  if (resposta === "recusada") {
    await supabase
      .from("quote_companies")
      .update({ status: "recusada" })
      .eq("id", quoteCompanyId);
    revalidatePath("/empresa/cotacoes");
    return { ok: true };
  }

  // Aceitar: se a cotação tem horários, precisa escolher um
  if (slotId) {
    const { error } = await supabase.from("appointments").insert({
      quote_company_id: quoteCompanyId,
      slot_id: slotId,
    });
    if (error) {
      // slot_id é único — se outra empresa pegou o horário primeiro
      return {
        erro: "Esse horário acabou de ser preenchido. Escolha outro.",
      };
    }
  }

  await supabase
    .from("quote_companies")
    .update({ status: "aceita" })
    .eq("id", quoteCompanyId);

  revalidatePath("/empresa/cotacoes");
  return { ok: true };
}
