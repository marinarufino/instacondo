"use client";

import { useState, useTransition } from "react";
import { BookmarkPlus, BookmarkCheck, Trash2, Loader2 } from "lucide-react";
import { toggleWallet } from "@/app/(sindico)/feed-actions";

/** Botão de adicionar/remover empresa da carteira (Banco de Empresas) */
export default function WalletButton({
  companyId,
  inicial,
  variant = "add",
  onChange,
}: {
  companyId: string;
  inicial: boolean;
  variant?: "add" | "remove";
  onChange?: (inWallet: boolean) => void;
}) {
  const [inWallet, setInWallet] = useState(inicial);
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const res = await toggleWallet(companyId, inWallet);
      setInWallet(res.inWallet);
      onChange?.(res.inWallet);
    });
  }

  // Variante "remove" — usada no Banco de Empresas
  if (variant === "remove") {
    return (
      <button
        onClick={handle}
        disabled={pending}
        aria-label="Remover da carteira"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </button>
    );
  }

  // Variante "add" — usada no Filtro
  return (
    <button
      onClick={handle}
      disabled={pending}
      className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
        inWallet
          ? "bg-accent/10 text-accent"
          : "bg-primary text-white"
      }`}
    >
      {pending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : inWallet ? (
        <BookmarkCheck size={14} />
      ) : (
        <BookmarkPlus size={14} />
      )}
      {inWallet ? "Na carteira" : "Adicionar"}
    </button>
  );
}
