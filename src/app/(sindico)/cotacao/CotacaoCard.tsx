"use client";

import { useTransition } from "react";
import {
  Building2,
  Clock,
  RotateCw,
  XCircle,
  Loader2,
  Check,
  X as XIcon,
} from "lucide-react";
import { cancelarCotacao, repetirCotacao } from "./actions";

export type CotacaoResumo = {
  id: string;
  condominio: string;
  servico: string;
  urgencia: "baixa" | "media" | "alta";
  status: "ativa" | "cancelada" | "concluida";
  criadaEm: string;
  totalEmpresas: number;
  aceitas: number;
  recusadas: number;
};

const urgenciaLabel: Record<CotacaoResumo["urgencia"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const statusStyle: Record<
  CotacaoResumo["status"],
  { label: string; classe: string }
> = {
  ativa: { label: "Ativa", classe: "bg-green-100 text-green-700" },
  cancelada: { label: "Cancelada", classe: "bg-slate-100 text-slate-500" },
  concluida: { label: "Concluída", classe: "bg-primary/10 text-primary" },
};

export default function CotacaoCard({ cotacao }: { cotacao: CotacaoResumo }) {
  const [pending, startTransition] = useTransition();
  const st = statusStyle[cotacao.status];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-dark">{cotacao.condominio}</p>
            <p className="text-xs text-muted">{cotacao.servico}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${st.classe}`}
        >
          {st.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
          <Building2 size={12} /> {cotacao.totalEmpresas} empresa
          {cotacao.totalEmpresas !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-green-700">
          <Check size={12} /> {cotacao.aceitas} aceitou
        </span>
        <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-red-600">
          <XIcon size={12} /> {cotacao.recusadas} recusou
        </span>
        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700">
          <Clock size={12} /> Urgência {urgenciaLabel[cotacao.urgencia]}
        </span>
      </div>

      {/* Ações */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() =>
            startTransition(async () => {
              await repetirCotacao(cotacao.id);
            })
          }
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-primary/30 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RotateCw size={14} />
          )}
          Repetir
        </button>
        {cotacao.status === "ativa" && (
          <button
            onClick={() =>
              startTransition(async () => {
                await cancelarCotacao(cotacao.id);
              })
            }
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
          >
            <XCircle size={14} />
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
