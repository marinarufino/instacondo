"use client";

import { useState, useTransition } from "react";
import { MapPin, Check, Loader2 } from "lucide-react";
import { atualizarRegiao } from "./actions";
import type { Region } from "@/lib/types";

/** Seletor de região editável no perfil do síndico */
export default function RegiaoEditor({
  regioes,
  atual,
}: {
  regioes: Region[];
  atual: string | null;
}) {
  const [valor, setValor] = useState(atual ?? "");
  const [pending, start] = useTransition();
  const [salvo, setSalvo] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <MapPin size={18} />
      </span>
      <div className="flex-1">
        <p className="text-xs text-muted">Região</p>
        <select
          value={valor}
          onChange={(e) => {
            const nova = e.target.value;
            setValor(nova);
            setSalvo(false);
            start(async () => {
              await atualizarRegiao(nova);
              setSalvo(true);
            });
          }}
          className="mt-0.5 w-full bg-transparent text-sm font-medium text-dark outline-none"
        >
          <option value="">Não informada</option>
          {regioes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nome}
            </option>
          ))}
        </select>
      </div>
      {pending ? (
        <Loader2 size={16} className="animate-spin text-primary" />
      ) : salvo ? (
        <Check size={16} className="text-green-600" />
      ) : null}
    </div>
  );
}
