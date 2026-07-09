"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Atualiza a região do síndico logado */
export async function atualizarRegiao(regionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ region_id: regionId || null })
    .eq("id", user.id);

  revalidatePath("/perfil");
}
