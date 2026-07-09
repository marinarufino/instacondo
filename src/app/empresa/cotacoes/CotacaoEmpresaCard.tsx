"use client";

import { useState, useTransition } from "react";
import {
  Building2,
  MapPin,
  Clock,
  Check,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { responderConvite } from "./actions";

export type ConviteEmpresa = {
  quoteCompanyId: string;
  status: "pendente" | "aceita" | "recusada";
  condominio: string;
  endereco: string;
  servico: string;
  urgencia: "baixa" | "media" | "alta";
  cotacaoCancelada: boolean;
  slots: { id: string; inicio: string; ocupado: boolean }[];
};

const urgenciaLabel = { baixa: "Baixa", media: "Média", alta: "Alta" };

function formatarSlot(iso: string): string {
  const [dataP, horaP] = iso.split("T");
  const [, mes, dia] = dataP.split("-");
  return `${dia}/${mes} · ${horaP.slice(0, 5)}`;
}

export default function CotacaoEmpresaCard({
  convite,
}: {
  convite: ConviteEmpresa;
}) {
  const [pending, startTransition] = useTransition();
  const [escolhendo, setEscolhendo] = useState(false);
  const [slotSel, setSlotSel] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const temHorarios = convite.slots.length > 0;
  const disponiveis = convite.slots.filter((s) => !s.ocupado);

  function aceitar() {
    setErro(null);
    // Se tem horários, precisa escolher um
    if (temHorarios && !slotSel) {
      setEscolhendo(true);
      return;
    }
    startTransition(async () => {
      const res = await responderConvite(
        convite.quoteCompanyId,
        "aceita",
        slotSel ?? undefined
      );
      if (res.erro) setErro(res.erro);
    });
  }

  function recusar() {
    setErro(null);
    startTransition(async () => {
      await responderConvite(convite.quoteCompanyId, "recusada");
    });
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Building2 size={20} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-dark">{convite.condominio}</p>
          <p className="text-xs text-muted">{convite.servico}</p>
          {convite.endereco && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <MapPin size={11} /> {convite.endereco}
            </p>
          )}
        </div>
        <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
          {urgenciaLabel[convite.urgencia]}
        </span>
      </div>

      {/* Estados finais */}
      {convite.cotacaoCancelada ? (
        <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
          Esta cotação foi cancelada pelo síndico.
        </p>
      ) : convite.status === "aceita" ? (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
          <CheckCircle2 size={14} /> Você aceitou esta cotação.
        </p>
      ) : convite.status === "recusada" ? (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
          <XCircle size={14} /> Você recusou esta cotação.
        </p>
      ) : (
        <>
          {/* Escolha de horário */}
          {escolhendo && temHorarios && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-semibold text-dark">
                Escolha um horário:
              </p>
              {disponiveis.length === 0 ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Todos os horários já foram preenchidos por outras empresas.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {disponiveis.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSlotSel(s.id)}
                      className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                        slotSel === s.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-200 text-dark"
                      }`}
                    >
                      <Clock size={12} />
                      {formatarSlot(s.inicio)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {erro && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {erro}
            </p>
          )}

          {/* Ações aceitar/recusar */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={aceitar}
              disabled={pending || (escolhendo && temHorarios && !slotSel)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-br from-primary-light to-primary px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              {pending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {temHorarios && !escolhendo
                ? "Aceitar e agendar"
                : escolhendo
                  ? "Confirmar horário"
                  : "Aceitar"}
            </button>
            <button
              onClick={recusar}
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-600 disabled:opacity-50"
            >
              <X size={14} /> Recusar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
