"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Upload,
  Trash2,
  Loader2,
  Video as VideoIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registrarVideo, apagarVideo } from "./actions";

type Video = { id: string; url: string; duracao_seg: number; ordem: number };

const MAX_VIDEOS = 5;
const MAX_DURACAO = 120; // segundos

/** Extrai o caminho no Storage a partir da URL pública */
function pathFromUrl(url: string): string {
  const marker = "/videos/";
  const i = url.indexOf(marker);
  return i >= 0 ? url.slice(i + marker.length) : "";
}

export default function VideoManager({
  companyId,
  videos,
}: {
  companyId: string;
  videos: Video[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pending, startTransition] = useTransition();

  const cheio = videos.length >= MAX_VIDEOS;

  /** Lê a duração do vídeo no navegador antes de enviar */
  function lerDuracao(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const el = document.createElement("video");
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        URL.revokeObjectURL(el.src);
        resolve(el.duration);
      };
      el.onerror = () => reject(new Error("Arquivo de vídeo inválido."));
      el.src = URL.createObjectURL(file);
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setErro(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (inputRef.current) inputRef.current.value = "";

    if (cheio) {
      setErro("Você já tem 5 vídeos. Apague um para adicionar outro.");
      return;
    }

    setEnviando(true);
    try {
      const duracao = await lerDuracao(file);
      if (duracao > MAX_DURACAO) {
        setErro(
          `Este vídeo tem ${Math.round(
            duracao
          )}s. O limite é 2 minutos (120s).`
        );
        setEnviando(false);
        return;
      }

      const supabase = createClient();
      const ext = file.name.split(".").pop() || "mp4";
      const nome = `${companyId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErro } = await supabase.storage
        .from("videos")
        .upload(nome, file, { contentType: file.type });

      if (upErro) {
        setErro("Falha ao enviar o vídeo. Tente novamente.");
        setEnviando(false);
        return;
      }

      const res = await registrarVideo(nome, duracao);
      if (res.erro) {
        // desfaz o upload se o registro falhar
        await supabase.storage.from("videos").remove([nome]);
        setErro(res.erro);
      }
    } catch {
      setErro("Não foi possível processar o vídeo.");
    } finally {
      setEnviando(false);
    }
  }

  function handleDelete(v: Video) {
    setErro(null);
    startTransition(async () => {
      const res = await apagarVideo(v.id, pathFromUrl(v.url));
      if (res.erro) setErro(res.erro);
    });
  }

  return (
    <div className="flex-1">
      <header className="rounded-b-3xl bg-gradient-to-br from-primary to-primary-light px-6 pb-6 pt-8 text-white">
        <Link
          href="/empresa"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/85"
        >
          <ChevronLeft size={18} /> Voltar
        </Link>
        <h1 className="text-2xl font-bold">Meus vídeos</h1>
        <p className="mt-1 text-sm text-white/85">
          {videos.length}/{MAX_VIDEOS} vídeos · até 2 min cada
        </p>
      </header>

      <div className="px-6 py-6">
        {/* Botão de upload */}
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={cheio || enviando}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-8 text-primary transition-colors disabled:opacity-50"
        >
          {enviando ? (
            <>
              <Loader2 size={28} className="animate-spin" />
              <span className="text-sm font-semibold">Enviando vídeo...</span>
            </>
          ) : (
            <>
              <Upload size={28} />
              <span className="text-sm font-semibold">
                {cheio ? "Limite de 5 vídeos atingido" : "Enviar novo vídeo"}
              </span>
              {!cheio && (
                <span className="text-xs text-primary/70">
                  MP4 ou MOV · máximo 2 minutos
                </span>
              )}
            </>
          )}
        </button>

        {erro && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {erro}
          </p>
        )}

        {cheio && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            Para adicionar um novo vídeo, apague um dos 5 abaixo.
          </p>
        )}

        {/* Lista de vídeos */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {videos.map((v) => (
            <div
              key={v.id}
              className="relative overflow-hidden rounded-2xl bg-black shadow-sm"
            >
              <video
                src={v.url}
                className="aspect-[9/16] w-full object-cover"
                controls
                preload="metadata"
              />
              <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                {v.duracao_seg}s
              </span>
              <button
                onClick={() => handleDelete(v)}
                disabled={pending}
                aria-label="Apagar vídeo"
                className="absolute right-2 top-2 rounded-full bg-red-500/90 p-1.5 text-white disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {videos.length === 0 && !enviando && (
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-muted">
            <VideoIcon size={32} />
            <p className="text-sm">
              Nenhum vídeo ainda. Envie o primeiro para aparecer no feed dos
              síndicos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
