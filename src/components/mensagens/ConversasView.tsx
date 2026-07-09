import Link from "next/link";
import { MessageCircle, UserRound, Building2 } from "lucide-react";
import type { Conversa } from "@/lib/messages";

/** Lista de conversas (usada por síndico e empresa) */
export default function ConversasView({
  conversas,
  basePath,
}: {
  conversas: Conversa[];
  basePath: string;
}) {
  if (conversas.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center gap-2 px-8 text-center text-muted">
        <MessageCircle size={32} />
        <p className="text-sm">
          Nenhuma conversa ainda. Inicie uma mensagem a partir de uma empresa da
          sua carteira ou responda uma cotação recebida.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {conversas.map((c) => (
        <Link
          key={c.otherId}
          href={`${basePath}/${c.otherId}`}
          className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition-transform active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary text-white">
            {c.ehEmpresa ? <Building2 size={22} /> : <UserRound size={22} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-dark">{c.nome}</p>
            <p className="truncate text-xs text-muted">{c.ultima}</p>
          </div>
          {c.naoLidas > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
              {c.naoLidas}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
