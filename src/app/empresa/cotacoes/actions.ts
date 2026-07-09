"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail, emailLayout } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** Notifica o síndico dono da cotação sobre a resposta da empresa */
async function notificarSindico(
  supabase: Awaited<ReturnType<typeof createClient>>,
  quoteCompanyId: string,
  resposta: "aceita" | "recusada"
) {
  const { data } = await supabase
    .from("quote_companies")
    .select("companies(nome), quotes(condominio, profiles(email))")
    .eq("id", quoteCompanyId)
    .single();
  if (!data) return;

  type Row = {
    companies: { nome: string } | { nome: string }[] | null;
    quotes:
      | { condominio: string; profiles: { email: string } | { email: string }[] | null }
      | { condominio: string; profiles: { email: string } | { email: string }[] | null }[]
      | null;
  };
  const r = data as Row;
  const empresa = Array.isArray(r.companies) ? r.companies[0] : r.companies;
  const quote = Array.isArray(r.quotes) ? r.quotes[0] : r.quotes;
  const sindico = quote
    ? Array.isArray(quote.profiles)
      ? quote.profiles[0]
      : quote.profiles
    : null;
  if (!sindico?.email) return;

  const aceitou = resposta === "aceita";
  await sendEmail({
    to: sindico.email,
    subject: `Uma empresa ${aceitou ? "aceitou" : "recusou"} sua cotação`,
    html: emailLayout(
      aceitou ? "Empresa aceitou! ✅" : "Empresa recusou",
      `A empresa <b>${empresa?.nome ?? ""}</b> ${
        aceitou ? "aceitou" : "recusou"
      } a cotação do condomínio <b>${quote?.condominio ?? ""}</b>.${
        aceitou ? " Veja o horário agendado no app." : ""
      }`,
      { label: "Ver no app", url: `${APP_URL}/cotacao` }
    ),
  });
}

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
    await notificarSindico(supabase, quoteCompanyId, "recusada");
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
  await notificarSindico(supabase, quoteCompanyId, "aceita");

  revalidatePath("/empresa/cotacoes");
  return { ok: true };
}
