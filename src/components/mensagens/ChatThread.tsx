"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send, UserRound, Building2 } from "lucide-react";
import { enviarMensagem } from "@/lib/messages-actions";
import type { Mensagem } from "@/lib/messages";

/** Tela de conversa (chat) entre o usuário atual e outra pessoa */
export default function ChatThread({
  currentUserId,
  otherId,
  nome,
  ehEmpresa,
  mensagens,
  backHref,
  comNav = false,
}: {
  currentUserId: string;
  otherId: string;
  nome: string;
  ehEmpresa: boolean;
  mensagens: Mensagem[];
  backHref: string;
  comNav?: boolean;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msgs, setMsgs] = useState<Mensagem[]>(mensagens);
  const fimRef = useRef<HTMLDivElement>(null);

  // Sincroniza com o servidor quando novas mensagens chegam (mantém otimistas locais)
  useEffect(() => {
    setMsgs((locais) => {
      const otimistas = locais.filter((m) => m.id.startsWith("tmp-"));
      const idsServidor = new Set(mensagens.map((m) => m.content + m.sender_id));
      const pendentes = otimistas.filter(
        (m) => !idsServidor.has(m.content + m.sender_id)
      );
      return [...mensagens, ...pendentes];
    });
  }, [mensagens]);

  // Rola para a última mensagem
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  // Atualização automática (busca novas mensagens a cada 5s)
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [router]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo || enviando) return;
    setEnviando(true);
    setTexto("");

    // Mostra a mensagem imediatamente (otimista)
    const temp: Mensagem = {
      id: `tmp-${Date.now()}`,
      sender_id: currentUserId,
      content: conteudo,
      created_at: new Date().toISOString(),
    };
    setMsgs((m) => [...m, temp]);

    await enviarMensagem(otherId, conteudo);
    router.refresh();
    setEnviando(false);
  }

  return (
    <div
      className={`flex flex-col ${comNav ? "h-[calc(100dvh-5.5rem)]" : "h-dvh"}`}
    >
      {/* Cabeçalho */}
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-primary to-primary-light px-4 pb-4 pt-6 text-white">
        <Link href={backHref} aria-label="Voltar" className="p-1">
          <ChevronLeft size={22} />
        </Link>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          {ehEmpresa ? <Building2 size={20} /> : <UserRound size={20} />}
        </span>
        <span className="font-bold">{nome}</span>
      </header>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {msgs.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted">
            Nenhuma mensagem ainda. Diga olá! 👋
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {msgs.map((m) => {
              const minha = m.sender_id === currentUserId;
              return (
                <div
                  key={m.id}
                  className={`flex ${minha ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${
                      minha
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm bg-white text-dark shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <p
                      className={`mt-0.5 text-right text-[10px] ${
                        minha ? "text-white/70" : "text-muted"
                      }`}
                    >
                      {formatarHora(m.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={fimRef} />
          </div>
        )}
      </div>

      {/* Campo de envio */}
      <form
        onSubmit={enviar}
        className="flex items-center gap-2 border-t border-slate-100 bg-white px-3 py-3"
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm text-dark outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          aria-label="Enviar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary text-white disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

function formatarHora(iso: string): string {
  const t = iso.split("T")[1];
  return t ? t.slice(0, 5) : "";
}
