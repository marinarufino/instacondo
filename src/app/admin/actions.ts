"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return null;
  return supabase;
}

/** Ativa/desativa a assinatura de uma empresa (substitui o SQL manual) */
export async function toggleAssinatura(companyId: string, ativar: boolean) {
  const supabase = await assertAdmin();
  if (!supabase) return;
  await supabase
    .from("companies")
    .update({ assinatura_ativa: ativar })
    .eq("id", companyId);
  revalidatePath("/admin");
}

/** Adiciona uma nova região */
export async function adicionarRegiao(nome: string) {
  const supabase = await assertAdmin();
  if (!supabase || !nome.trim()) return;
  await supabase.from("regions").insert({ nome: nome.trim() });
  revalidatePath("/admin");
}

/** Ativa/desativa uma região */
export async function toggleRegiao(regionId: string, ativa: boolean) {
  const supabase = await assertAdmin();
  if (!supabase) return;
  await supabase.from("regions").update({ ativa }).eq("id", regionId);
  revalidatePath("/admin");
}

/** Adiciona um patrocinador */
export async function adicionarPatrocinador(nome: string, bannerUrl: string, linkUrl: string) {
  const supabase = await assertAdmin();
  if (!supabase || !nome.trim()) return;
  await supabase.from("sponsors").insert({
    nome: nome.trim(),
    banner_url: bannerUrl.trim(),
    link_url: linkUrl.trim(),
  });
  revalidatePath("/admin");
}

/** Ativa/desativa um patrocinador */
export async function togglePatrocinador(sponsorId: string, ativo: boolean) {
  const supabase = await assertAdmin();
  if (!supabase) return;
  await supabase.from("sponsors").update({ ativo }).eq("id", sponsorId);
  revalidatePath("/admin");
}

/** Remove um patrocinador */
export async function removerPatrocinador(sponsorId: string) {
  const supabase = await assertAdmin();
  if (!supabase) return;
  await supabase.from("sponsors").delete().eq("id", sponsorId);
  revalidatePath("/admin");
}

/** Atualiza a frequência dos banners (a cada X vídeos) */
export async function atualizarFrequenciaBanner(freq: number) {
  const supabase = await assertAdmin();
  if (!supabase) return;
  const valor = Math.max(1, Math.min(20, Math.round(freq)));
  await supabase.from("settings").update({ banner_frequency: valor }).eq("id", 1);
  revalidatePath("/admin");
}
