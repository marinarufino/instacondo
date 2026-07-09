"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Field";
import type { Region, Segment } from "@/lib/types";

/** Barra de filtros — atualiza a URL (segmento/região) e recarrega a lista */
export default function FilterBar({
  regioes,
  segmentos,
}: {
  regioes: Region[];
  segmentos: Segment[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function setParam(chave: string, valor: string) {
    const p = new URLSearchParams(params.toString());
    if (valor) p.set(chave, valor);
    else p.delete(chave);
    router.replace(`/filtro?${p.toString()}`);
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Select
        defaultValue={params.get("segmento") ?? ""}
        onChange={(e) => setParam("segmento", e.target.value)}
      >
        <option value="">Todos os segmentos</option>
        {segmentos.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nome}
          </option>
        ))}
      </Select>
      <Select
        defaultValue={params.get("regiao") ?? ""}
        onChange={(e) => setParam("regiao", e.target.value)}
      >
        <option value="">Todas as regiões</option>
        {regioes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.nome}
          </option>
        ))}
      </Select>
    </div>
  );
}
