import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Mail, Phone, MapPin, ChevronLeft, UserRound } from "lucide-react";
import { logout } from "@/app/(auth)/actions";

/** Tela de Perfil do síndico — dados da conta e botão de sair */
export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email, telefone, region_id, regions(nome)")
    .eq("id", user.id)
    .single();

  const nome = profile?.nome || "Síndico";
  // O join pode vir como objeto ou array dependendo da inferência do Supabase
  const regioes = profile?.regions as
    | { nome: string }
    | { nome: string }[]
    | null;
  const regiao =
    (Array.isArray(regioes) ? regioes[0]?.nome : regioes?.nome) ??
    "Não informada";

  return (
    <div className="flex-1">
      <header className="rounded-b-3xl bg-gradient-to-br from-primary to-primary-light px-6 pb-8 pt-8 text-white">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/85"
        >
          <ChevronLeft size={18} /> Voltar
        </Link>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-white">
            <UserRound size={40} />
          </span>
          <h1 className="mt-3 text-xl font-bold">{nome}</h1>
          <p className="text-sm text-white/80">Síndico</p>
        </div>
      </header>

      <section className="px-6 pb-28 pt-6">
        <h2 className="mb-3 text-sm font-bold text-dark">Meus dados</h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <InfoRow icon={<Mail size={18} />} label="E-mail" value={profile?.email || "—"} />
          <InfoRow icon={<Phone size={18} />} label="Telefone" value={profile?.telefone || "Não informado"} />
          <InfoRow icon={<MapPin size={18} />} label="Região" value={regiao} />
        </div>

        <form action={logout} className="mt-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-red-200 bg-red-50 px-5 py-3.5 text-sm font-semibold text-red-600 transition-transform active:scale-[0.98]">
            <LogOut size={18} />
            Sair da conta
          </button>
        </form>
      </section>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-dark">{value}</p>
      </div>
    </div>
  );
}
