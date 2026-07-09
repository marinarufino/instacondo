"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clapperboard,
  SlidersHorizontal,
  Plus,
  Briefcase,
  MessageCircle,
} from "lucide-react";

/**
 * Navegação inferior do app do Síndico.
 * 5 itens com a Cotação (botão "+") ao centro:
 * Empresas · Filtro · Cotação · Banco · Mensagens
 */
export default function BottomNav({ naoLidas = 0 }: { naoLidas?: number }) {
  const pathname = usePathname();

  const tabClass = (active: boolean) =>
    `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
      active ? "text-primary" : "text-muted"
    }`;

  const ativo = (rota: string) =>
    rota === "/" ? pathname === "/" : pathname.startsWith(rota);

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-slate-100 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-5 items-end px-2 pb-3 pt-2">
        {/* 1 — Empresas (feed de vídeos) */}
        <Link href="/" className={tabClass(ativo("/"))}>
          <Clapperboard size={23} strokeWidth={ativo("/") ? 2.4 : 2} />
          Empresas
        </Link>

        {/* 2 — Filtro */}
        <Link href="/filtro" className={tabClass(ativo("/filtro"))}>
          <SlidersHorizontal size={23} strokeWidth={ativo("/filtro") ? 2.4 : 2} />
          Filtro
        </Link>

        {/* 3 — Cotação (botão central destacado) */}
        <Link
          href="/cotacao"
          className="flex flex-col items-center gap-1 text-[11px] font-medium"
        >
          <span
            className={`-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary text-white shadow-lg shadow-primary/40 ring-4 ring-ice transition-transform active:scale-95 ${
              ativo("/cotacao") ? "scale-105" : ""
            }`}
          >
            <Plus size={28} strokeWidth={2.6} />
          </span>
          <span className={ativo("/cotacao") ? "text-primary" : "text-muted"}>
            Cotação
          </span>
        </Link>

        {/* 4 — Banco de Empresas */}
        <Link href="/banco" className={tabClass(ativo("/banco"))}>
          <Briefcase size={23} strokeWidth={ativo("/banco") ? 2.4 : 2} />
          Banco
        </Link>

        {/* 5 — Mensagens */}
        <Link href="/mensagens" className={tabClass(ativo("/mensagens"))}>
          <span className="relative">
            <MessageCircle size={23} strokeWidth={ativo("/mensagens") ? 2.4 : 2} />
            {naoLidas > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {naoLidas > 9 ? "9+" : naoLidas}
              </span>
            )}
          </span>
          Mensagens
        </Link>
      </div>
    </nav>
  );
}
