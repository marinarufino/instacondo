"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ImagePlus,
  X,
  Check,
  Loader2,
  Briefcase,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { criarCotacao } from "../actions";

export type CarteiraEmpresa = {
  id: string;
  nome: string;
  segmento: string;
};

export default function NovaCotacaoForm({
  carteira,
  emailPadrao,
  telefonePadrao,
}: {
  carteira: CarteiraEmpresa[];
  emailPadrao: string;
  telefonePadrao: string;
}) {
  const router = useRouter();
  const fotoInput = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const [fotos, setFotos] = useState<{ url: string; path: string }[]>([]);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [selecao, setSelecao] = useState<Set<string>>(new Set());
  const [modalEmpresas, setModalEmpresas] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Agrupa a carteira por segmento para a seleção
  const grupos = carteira.reduce<Record<string, CarteiraEmpresa[]>>((acc, e) => {
    (acc[e.segmento] ??= []).push(e);
    return acc;
  }, {});

  async function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (fotoInput.current) fotoInput.current.value = "";
    if (files.length === 0) return;

    setEnviandoFoto(true);
    const supabase = createClient();
    for (const file of files) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("quote-photos")
        .upload(path, file, { contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from("quote-photos").getPublicUrl(path);
        setFotos((f) => [...f, { url: data.publicUrl, path }]);
      }
    }
    setEnviandoFoto(false);
  }

  async function removerFoto(path: string) {
    const supabase = createClient();
    await supabase.storage.from("quote-photos").remove([path]);
    setFotos((f) => f.filter((x) => x.path !== path));
  }

  function toggleEmpresa(id: string) {
    setSelecao((s) => {
      const nova = new Set(s);
      nova.has(id) ? nova.delete(id) : nova.add(id);
      return nova;
    });
  }

  function toggleGrupo(lista: CarteiraEmpresa[]) {
    const ids = lista.map((e) => e.id);
    const todosMarcados = ids.every((id) => selecao.has(id));
    setSelecao((s) => {
      const nova = new Set(s);
      ids.forEach((id) => (todosMarcados ? nova.delete(id) : nova.add(id)));
      return nova;
    });
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await criarCotacao({
        condominio: String(fd.get("condominio") ?? ""),
        endereco: String(fd.get("endereco") ?? ""),
        telefone: String(fd.get("telefone") ?? ""),
        email: String(fd.get("email") ?? ""),
        servico: String(fd.get("servico") ?? ""),
        urgencia: String(fd.get("urgencia") ?? "media") as
          | "baixa"
          | "media"
          | "alta",
        fotos: fotos.map((f) => f.url),
        empresaIds: [...selecao],
      });
      if (res.erro) setErro(res.erro);
      else router.push("/cotacao");
    });
  }

  const nomesSelecionados = carteira
    .filter((e) => selecao.has(e.id))
    .map((e) => e.nome);

  return (
    <div className="flex-1">
      <header className="rounded-b-3xl bg-gradient-to-br from-primary to-primary-light px-6 pb-6 pt-8 text-white">
        <Link
          href="/cotacao"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/85"
        >
          <ChevronLeft size={18} /> Voltar
        </Link>
        <h1 className="text-2xl font-bold">Nova cotação</h1>
        <p className="mt-1 text-sm text-white/85">
          Preencha os dados e escolha as empresas.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-col gap-4 px-6 pb-28 pt-6">
        <Field label="Condomínio">
          <Input name="condominio" required placeholder="Nome do condomínio" />
        </Field>
        <Field label="Endereço">
          <Input name="endereco" placeholder="Rua, número, bairro" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telefone">
            <Input name="telefone" defaultValue={telefonePadrao} placeholder="(21) 90000-0000" />
          </Field>
          <Field label="E-mail">
            <Input name="email" type="email" defaultValue={emailPadrao} />
          </Field>
        </div>
        <Field label="Serviço desejado">
          <Input name="servico" required placeholder="Ex.: Limpeza de caixa d'água" />
        </Field>
        <Field label="Urgência">
          <Select name="urgencia" defaultValue="media">
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </Select>
        </Field>

        {/* Fotos */}
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-dark">
            Fotos (opcional)
          </span>
          <input
            ref={fotoInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFotos}
          />
          <div className="flex flex-wrap gap-2">
            {fotos.map((f) => (
              <div key={f.path} className="relative h-20 w-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.url}
                  alt="Foto da cotação"
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => removerFoto(f.path)}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-1 text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fotoInput.current?.click()}
              disabled={enviandoFoto}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary"
            >
              {enviandoFoto ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <ImagePlus size={20} />
              )}
              <span className="text-[10px]">Adicionar</span>
            </button>
          </div>
        </div>

        {/* Seleção de empresas */}
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-dark">
            Empresas
          </span>
          <button
            type="button"
            onClick={() => setModalEmpresas(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Briefcase size={18} />
            </span>
            <span className="flex-1 text-sm">
              {selecao.size === 0 ? (
                <span className="text-muted">Selecionar empresas da carteira</span>
              ) : (
                <span className="font-medium text-dark">
                  {selecao.size} selecionada{selecao.size > 1 ? "s" : ""}
                </span>
              )}
            </span>
            <ChevronLeft size={18} className="rotate-180 text-muted" />
          </button>
          {nomesSelecionados.length > 0 && (
            <p className="mt-2 text-xs text-muted">
              {nomesSelecionados.join(", ")}
            </p>
          )}
        </div>

        {erro && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {erro}
          </p>
        )}

        <Button type="submit" loading={pending} className="mt-2">
          Enviar cotação
        </Button>
      </form>

      {/* Modal de seleção de empresas (carteira agrupada por tema) */}
      {modalEmpresas && (
        <div className="absolute inset-0 z-30 flex items-end bg-black/50">
          <div className="max-h-[80%] w-full overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-dark">Escolher empresas</h2>
              <button
                onClick={() => setModalEmpresas(false)}
                className="rounded-full bg-slate-100 p-1.5 text-muted"
              >
                <X size={18} />
              </button>
            </div>

            {carteira.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted">
                Sua carteira está vazia. Adicione empresas no feed ou no filtro
                antes de cotar.
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {Object.entries(grupos).map(([segmento, lista]) => {
                  const todosMarcados = lista.every((e) => selecao.has(e.id));
                  return (
                    <div key={segmento}>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-dark">{segmento}</h3>
                        <button
                          type="button"
                          onClick={() => toggleGrupo(lista)}
                          className="text-xs font-semibold text-primary"
                        >
                          {todosMarcados ? "Desmarcar todas" : "Marcar todas"}
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {lista.map((e) => {
                          const marcada = selecao.has(e.id);
                          return (
                            <button
                              key={e.id}
                              type="button"
                              onClick={() => toggleEmpresa(e.id)}
                              className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-colors ${
                                marcada
                                  ? "border-primary bg-primary/5"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-md ${
                                  marcada
                                    ? "bg-primary text-white"
                                    : "border border-slate-300"
                                }`}
                              >
                                {marcada && <Check size={14} />}
                              </span>
                              <span className="text-sm font-medium text-dark">
                                {e.nome}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Button
              type="button"
              onClick={() => setModalEmpresas(false)}
              className="mt-6"
            >
              Confirmar ({selecao.size})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
