import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Region, Segment } from "@/lib/types";
import EmpresaCadastroForm from "./form";

/** Server Component: carrega regiões/segmentos e protege a rota */
export default async function EmpresaCadastroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: regioes }, { data: segmentos }] = await Promise.all([
    supabase.from("regions").select("id, nome, ativa").eq("ativa", true).order("nome"),
    supabase.from("segments").select("id, nome").order("nome"),
  ]);

  return (
    <EmpresaCadastroForm
      regioes={(regioes as Region[]) ?? []}
      segmentos={(segmentos as Segment[]) ?? []}
    />
  );
}
