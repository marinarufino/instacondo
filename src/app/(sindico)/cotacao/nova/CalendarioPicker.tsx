"use client";

import { useState } from "react";
import { CalendarPlus, Clock, X, AlertTriangle } from "lucide-react";
import type { Slot } from "../actions";

/**
 * Define janelas de atendimento (dia + hora inicial/final) e gera
 * horários de 1 em 1 hora. Regra do escopo: horários ≥ empresas.
 */
export default function CalendarioPicker({
  totalEmpresas,
  onChange,
}: {
  totalEmpresas: number;
  onChange: (slots: Slot[]) => void;
}) {
  const [data, setData] = useState("");
  const [inicio, setInicio] = useState("08");
  const [fim, setFim] = useState("12");
  const [slots, setSlots] = useState<Slot[]>([]);

  function atualizar(novos: Slot[]) {
    // ordena por início e remove duplicados
    const unicos = Array.from(
      new Map(novos.map((s) => [s.inicio, s])).values()
    ).sort((a, b) => a.inicio.localeCompare(b.inicio));
    setSlots(unicos);
    onChange(unicos);
  }

  function adicionarJanela() {
    if (!data) return;
    const hi = parseInt(inicio, 10);
    const hf = parseInt(fim, 10);
    if (hf <= hi) return;

    const novos: Slot[] = [];
    for (let h = hi; h < hf; h++) {
      const ini = `${data}T${String(h).padStart(2, "0")}:00:00`;
      const f = `${data}T${String(h + 1).padStart(2, "0")}:00:00`;
      novos.push({ inicio: ini, fim: f });
    }
    atualizar([...slots, ...novos]);
  }

  function remover(inicioSlot: string) {
    atualizar(slots.filter((s) => s.inicio !== inicioSlot));
  }

  const insuficiente = slots.length > 0 && slots.length < totalEmpresas;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CalendarPlus size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-dark">
            Calendário de visitas
          </p>
          <p className="text-xs text-muted">
            1 empresa por horário · opcional
          </p>
        </div>
      </div>

      {/* Adicionar janela */}
      <div className="flex flex-col gap-2">
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-dark outline-none focus:border-primary"
        />
        <div className="flex items-center gap-2">
          <select
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            {horas.map((h) => (
              <option key={h} value={h}>
                {h}:00
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">até</span>
          <select
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            {horas.map((h) => (
              <option key={h} value={h}>
                {h}:00
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={adicionarJanela}
          disabled={!data}
          className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary disabled:opacity-50"
        >
          Adicionar horários
        </button>
      </div>

      {/* Lista de horários gerados */}
      {slots.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted">
            {slots.length} horário{slots.length > 1 ? "s" : ""} · {totalEmpresas}{" "}
            empresa{totalEmpresas !== 1 ? "s" : ""} selecionada
            {totalEmpresas !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <span
                key={s.inicio}
                className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-dark"
              >
                <Clock size={12} />
                {formatarSlot(s.inicio)}
                <button
                  type="button"
                  onClick={() => remover(s.inicio)}
                  className="text-muted"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {insuficiente && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          Escolha menos empresas ou aumente seu calendário — os horários precisam
          ser ao menos {totalEmpresas}.
        </p>
      )}
    </div>
  );
}

const horas = Array.from({ length: 16 }, (_, i) =>
  String(i + 6).padStart(2, "0")
); // 06 às 21

function formatarSlot(iso: string): string {
  const [dataP, horaP] = iso.split("T");
  const [ano, mes, dia] = dataP.split("-");
  return `${dia}/${mes} ${horaP.slice(0, 5)}`;
}
