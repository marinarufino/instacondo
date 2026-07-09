import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Check, Video, Bell, Calendar, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ConnexaMark } from "@/components/ConnexaLogo";

const beneficios = [
  { icon: Video, texto: "Publique até 5 vídeos da sua empresa" },
  { icon: Bell, texto: "Receba cotações direto dos síndicos" },
  { icon: Calendar, texto: "Agende visitas pelo calendário" },
  { icon: ShieldCheck, texto: "Selo de empresa verificada" },
];

/** Tela de assinatura — no MVP a cobrança é simulada; o admin ativa manualmente */
export default async function AssinaturaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("assinatura_ativa")
    .eq("profile_id", user.id)
    .single();

  const ativa = company?.assinatura_ativa ?? false;

  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <ConnexaMark size={56} />
        <h1 className="mt-3 text-2xl font-extrabold text-dark">
          Plano Empresa
        </h1>
        <p className="mt-1 text-sm text-muted">
          Seja vista e lembrada pelos síndicos.
        </p>
      </div>

      {/* Card do plano */}
      <div className="rounded-3xl bg-gradient-to-br from-primary to-primary-light p-6 text-white shadow-lg shadow-primary/30">
        <p className="text-sm font-medium text-white/80">Assinatura mensal</p>
        <p className="mt-1 text-4xl font-extrabold">
          R$ 39,90
          <span className="text-base font-medium text-white/80">/mês</span>
        </p>
        <ul className="mt-5 flex flex-col gap-3">
          {beneficios.map(({ icon: Icon, texto }) => (
            <li key={texto} className="flex items-center gap-3 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <Icon size={15} />
              </span>
              {texto}
            </li>
          ))}
        </ul>
      </div>

      {ativa ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-4 text-green-700">
          <Check size={20} />
          <p className="text-sm font-semibold">
            Assinatura ativa! Sua empresa já aparece no feed.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-4 text-amber-800">
          <p className="text-sm font-semibold">Assinatura pendente de ativação</p>
          <p className="mt-1 text-xs">
            No MVP a cobrança é simulada. Sua conta será ativada pela nossa
            equipe em breve — depois disso seus vídeos aparecem para os síndicos.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/empresa"
          className="flex w-full items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30"
        >
          Ir para minha empresa
        </Link>
      </div>
    </div>
  );
}
