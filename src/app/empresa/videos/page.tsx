import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VideoManager from "./manager";

/** Server Component: carrega a empresa e seus vídeos */
export default async function EmpresaVideosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id, nome")
    .eq("profile_id", user.id)
    .single();
  if (!company) redirect("/empresa/cadastro");

  const { data: videos } = await supabase
    .from("videos")
    .select("id, url, duracao_seg, ordem")
    .eq("company_id", company.id)
    .order("ordem");

  return (
    <VideoManager
      companyId={company.id}
      videos={videos ?? []}
    />
  );
}
