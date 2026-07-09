import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, LogOut } from "lucide-react";
import { logout } from "../(auth)/actions";
import { ConnexaMark } from "@/components/ConnexaLogo";

/**
 * Layout do painel administrativo — desktop, tela cheia.
 * Escapa da moldura de celular usando um contêiner fixo.
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nome")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-slate-100">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <ConnexaMark size={28} />
          <span className="text-lg font-bold text-dark">Connexa</span>
          <span className="ml-2 flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <LayoutDashboard size={13} /> Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:block">
            {profile?.nome || "Administrador"}
          </span>
          <form action={logout}>
            <button className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-slate-50">
              <LogOut size={15} /> Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}
