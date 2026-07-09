import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";
import { contarNaoLidas } from "@/lib/messages";

/**
 * Layout das telas do síndico — exige login e inclui a navegação inferior.
 * Empresa e admin são redirecionados para suas próprias áreas.
 */
export default async function SindicoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "empresa") redirect("/empresa");
  if (profile?.role === "admin") redirect("/admin");

  const naoLidas = await contarNaoLidas(supabase, user.id);

  return (
    <>
      <main className="flex-1">{children}</main>
      <BottomNav naoLidas={naoLidas} />
    </>
  );
}
