"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, Check, X } from "lucide-react";
import {
  toggleAssinatura,
  adicionarRegiao,
  toggleRegiao,
  adicionarPatrocinador,
  togglePatrocinador,
  removerPatrocinador,
  atualizarFrequenciaBanner,
} from "./actions";

/** Interruptor de assinatura da empresa */
export function ToggleAssinatura({
  companyId,
  ativa,
}: {
  companyId: string;
  ativa: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(async () => toggleAssinatura(companyId, !ativa))}
      disabled={pending}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        ativa
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {pending ? (
        <Loader2 size={13} className="animate-spin" />
      ) : ativa ? (
        <Check size={13} />
      ) : (
        <X size={13} />
      )}
      {ativa ? "Ativa" : "Inativa"}
    </button>
  );
}

/** Gestão de regiões */
export function RegioesManager({
  regioes,
}: {
  regioes: { id: string; nome: string; ativa: boolean }[];
}) {
  const [nome, setNome] = useState("");
  const [pending, start] = useTransition();

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nova região"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() =>
            start(async () => {
              await adicionarRegiao(nome);
              setNome("");
            })
          }
          disabled={pending || !nome.trim()}
          className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Plus size={16} /> Add
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {regioes.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
          >
            <span className="text-sm font-medium text-dark">{r.nome}</span>
            <button
              onClick={() => start(async () => toggleRegiao(r.id, !r.ativa))}
              disabled={pending}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                r.ativa ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"
              }`}
            >
              {r.ativa ? "Ativa" : "Inativa"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Gestão de patrocinadores/banners */
export function PatrocinadoresManager({
  patrocinadores,
}: {
  patrocinadores: {
    id: string;
    nome: string;
    banner_url: string;
    link_url: string;
    ativo: boolean;
  }[];
}) {
  const [nome, setNome] = useState("");
  const [banner, setBanner] = useState("");
  const [link, setLink] = useState("");
  const [pending, start] = useTransition();

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do patrocinador"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          placeholder="URL da imagem do banner (opcional)"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Link ao clicar (opcional)"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() =>
            start(async () => {
              await adicionarPatrocinador(nome, banner, link);
              setNome("");
              setBanner("");
              setLink("");
            })
          }
          disabled={pending || !nome.trim()}
          className="flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Plus size={16} /> Adicionar patrocinador
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {patrocinadores.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
          >
            <span className="text-sm font-medium text-dark">{p.nome}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => start(async () => togglePatrocinador(p.id, !p.ativo))}
                disabled={pending}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  p.ativo ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"
                }`}
              >
                {p.ativo ? "Ativo" : "Inativo"}
              </button>
              <button
                onClick={() => start(async () => removerPatrocinador(p.id))}
                disabled={pending}
                className="rounded-full bg-red-50 p-1.5 text-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {patrocinadores.length === 0 && (
          <p className="text-xs text-muted">Nenhum patrocinador cadastrado.</p>
        )}
      </div>
    </div>
  );
}

/** Frequência dos banners no feed */
export function FrequenciaBanner({ atual }: { atual: number }) {
  const [freq, setFreq] = useState(atual);
  const [pending, start] = useTransition();
  const [salvo, setSalvo] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">Banner a cada</span>
      <input
        type="number"
        min={1}
        max={20}
        value={freq}
        onChange={(e) => {
          setFreq(Number(e.target.value));
          setSalvo(false);
        }}
        className="w-16 rounded-xl border border-slate-200 px-2 py-1.5 text-center text-sm outline-none focus:border-primary"
      />
      <span className="text-sm text-muted">vídeos</span>
      <button
        onClick={() =>
          start(async () => {
            await atualizarFrequenciaBanner(freq);
            setSalvo(true);
          })
        }
        disabled={pending}
        className="rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : salvo ? "Salvo ✓" : "Salvar"}
      </button>
    </div>
  );
}
