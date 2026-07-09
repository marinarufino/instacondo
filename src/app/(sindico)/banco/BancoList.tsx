"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRound, MapPin, Briefcase, MessageCircle } from "lucide-react";
import WalletButton from "@/components/WalletButton";

export type WalletCompany = {
  id: string;
  profileId: string;
  nome: string;
  cidade: string;
  onde_atende: string;
  segmento: string;
};

/** Lista da carteira agrupada por segmento, com remoção em tempo real */
export default function BancoList({
  inicial,
}: {
  inicial: WalletCompany[];
}) {
  const [empresas, setEmpresas] = useState(inicial);

  function remover(id: string) {
    setEmpresas((atual) => atual.filter((e) => e.id !== id));
  }

  if (empresas.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center gap-3 px-8 text-center text-muted">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Briefcase size={28} />
        </span>
        <p className="text-sm font-semibold text-dark">Sua carteira está vazia</p>
        <p className="text-sm">
          Curta empresas no feed ou use o filtro para adicioná-las aqui.
        </p>
        <Link
          href="/"
          className="mt-1 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white"
        >
          Explorar empresas
        </Link>
      </div>
    );
  }

  // Agrupa por segmento
  const grupos = empresas.reduce<Record<string, WalletCompany[]>>((acc, e) => {
    const chave = e.segmento || "Outros";
    (acc[chave] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grupos).map(([segmento, lista]) => (
        <div key={segmento}>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-dark">
            {segmento}
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {lista.length}
            </span>
          </h2>
          <div className="flex flex-col gap-3">
            {lista.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light to-primary text-white">
                  <UserRound size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-dark">
                    {e.nome}
                  </p>
                  {(e.cidade || e.onde_atende) && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <MapPin size={11} />
                      {e.cidade || e.onde_atende}
                    </p>
                  )}
                </div>
                <Link
                  href={`/mensagens/${e.profileId}`}
                  aria-label="Conversar"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
                >
                  <MessageCircle size={16} />
                </Link>
                <WalletButton
                  companyId={e.id}
                  inicial={true}
                  variant="remove"
                  onChange={(inWallet) => {
                    if (!inWallet) remover(e.id);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
