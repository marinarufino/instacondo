"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, SlidersHorizontal, Plus, Briefcase } from "lucide-react";

/**
 * Navegação inferior do app do Síndico — os 4 botões do escopo:
 * Empresas (feed) · Filtro · Cotação (botão central "+") · Banco de Empresas
 */
export default function BottomNav() {
  const pathname = usePathname();

  const tabClass = (active: boolean) =>
    `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
      active ? "text-primary" : "text-muted"
    }`;

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-slate-100 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-4 items-end px-2 pb-3 pt-2">
        {/* 1 — Empresas (feed de vídeos) */}
        <Link href="/" className={tabClass(pathname === "/")}>
          <Clapperboard size={24} strokeWidth={pathname === "/" ? 2.4 : 2} />
          Empresas
        </Link>

        {/* 2 — Filtro */}
        <Link href="/filtro" className={tabClass(pathname === "/filtro")}>
          <SlidersHorizontal
            size={24}
            strokeWidth={pathname === "/filtro" ? 2.4 : 2}
          />
          Filtro
        </Link>

        {/* 3 — Cotação (botão central destacado, como na identidade visual) */}
        <Link
          href="/cotacao"
          className="flex flex-col items-center gap-1 text-[11px] font-medium"
        >
          <span
            className={`-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary text-white shadow-lg shadow-primary/40 ring-4 ring-ice transition-transform active:scale-95 ${
              pathname === "/cotacao" ? "scale-105" : ""
            }`}
          >
            <Plus size={28} strokeWidth={2.6} />
          </span>
          <span className={pathname === "/cotacao" ? "text-primary" : "text-muted"}>
            Cotação
          </span>
        </Link>

        {/* 4 — Banco de Empresas */}
        <Link href="/banco" className={tabClass(pathname === "/banco")}>
          <Briefcase size={24} strokeWidth={pathname === "/banco" ? 2.4 : 2} />
          Banco
        </Link>
      </div>
    </nav>
  );
}
