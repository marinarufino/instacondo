"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Heart,
  BookmarkPlus,
  BookmarkCheck,
  Info,
  MapPin,
  Wrench,
  X,
  Clapperboard,
  UserRound,
} from "lucide-react";
import { ConnexaMark } from "@/components/ConnexaLogo";
import { toggleLike, toggleWallet } from "./feed-actions";

/** Barra superior sobreposta ao feed — dá acesso ao perfil (e logout) */
function FeedTopBar({ light = false }: { light?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pb-6 pt-5">
      {/* Gradiente para leitura sobre o vídeo */}
      {light ? null : (
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-black/50 to-transparent" />
      )}
      <div
        className={`flex items-center gap-2 ${
          light ? "text-dark" : "text-white"
        }`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
          <ConnexaMark size={20} />
        </span>
        <span className="text-base font-bold">Connexa</span>
      </div>
      <Link
        href="/perfil"
        aria-label="Meu perfil"
        className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full backdrop-blur ${
          light ? "bg-primary/10 text-primary" : "bg-white/20 text-white"
        }`}
      >
        <UserRound size={20} />
      </Link>
    </div>
  );
}

export type FeedVideo = {
  id: string;
  url: string;
  empresaId: string;
  empresaNome: string;
  descricao: string;
  cidade: string;
  ondeAtende: string;
  servicos: string;
  segmento: string;
  liked: boolean;
  inWallet: boolean;
};

export type FeedSponsor = {
  id: string;
  nome: string;
  banner_url: string;
  link_url: string;
};

type FeedItem =
  | { tipo: "video"; video: FeedVideo }
  | { tipo: "banner"; sponsor: FeedSponsor };

/** Intercala banners de patrocínio a cada `freq` vídeos */
function montarFeed(
  videos: FeedVideo[],
  sponsors: FeedSponsor[],
  freq: number
): FeedItem[] {
  const items: FeedItem[] = [];
  let s = 0;
  videos.forEach((video, i) => {
    items.push({ tipo: "video", video });
    if (sponsors.length > 0 && (i + 1) % freq === 0) {
      items.push({ tipo: "banner", sponsor: sponsors[s % sponsors.length] });
      s++;
    }
  });
  return items;
}

export default function Feed({
  videos,
  sponsors,
  bannerFreq,
}: {
  videos: FeedVideo[];
  sponsors: FeedSponsor[];
  bannerFreq: number;
}) {
  if (videos.length === 0) {
    return (
      <div className="relative h-[calc(100dvh-5.5rem)]">
        <FeedTopBar light />
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Clapperboard size={30} />
          </span>
          <h1 className="text-lg font-bold text-dark">Nenhum vídeo por aqui</h1>
          <p className="text-sm text-muted">
            Ainda não há empresas com vídeos publicados na sua região. Volte em
            breve!
          </p>
        </div>
      </div>
    );
  }

  const itens = montarFeed(videos, sponsors, bannerFreq);

  return (
    <div className="relative h-[calc(100dvh-5.5rem)]">
      <FeedTopBar />
      <div className="h-full snap-y snap-mandatory overflow-y-scroll">
        {itens.map((item, i) =>
          item.tipo === "video" ? (
            <VideoSlide key={item.video.id} video={item.video} />
          ) : (
            <BannerSlide key={`banner-${i}`} sponsor={item.sponsor} />
          )
        )}
      </div>
    </div>
  );
}

function VideoSlide({ video }: { video: FeedVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(video.liked);
  const [inWallet, setInWallet] = useState(video.inWallet);
  const [info, setInfo] = useState(false);

  // Autoplay quando o slide entra na tela
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
          el.currentTime = 0;
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  async function onLike() {
    setLiked((v) => !v); // otimista
    const res = await toggleLike(video.id, liked);
    setLiked(res.liked);
  }

  async function onWallet() {
    setInWallet((v) => !v);
    const res = await toggleWallet(video.empresaId, inWallet);
    setInWallet(res.inWallet);
  }

  return (
    <section className="relative flex h-full w-full snap-start items-center justify-center bg-black">
      <video
        ref={ref}
        src={video.url}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
        onClick={(e) => {
          const el = e.currentTarget;
          el.paused ? el.play() : el.pause();
        }}
      />

      {/* Gradiente inferior para leitura */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Ações laterais */}
      <div className="absolute bottom-24 right-3 flex flex-col items-center gap-5 text-white">
        <ActionButton
          onClick={onLike}
          ativo={liked}
          icon={
            <Heart
              size={30}
              fill={liked ? "currentColor" : "none"}
              className={liked ? "text-red-500" : ""}
            />
          }
          label="Curtir"
        />
        <ActionButton
          onClick={onWallet}
          ativo={inWallet}
          icon={
            inWallet ? (
              <BookmarkCheck size={30} className="text-accent" />
            ) : (
              <BookmarkPlus size={30} />
            )
          }
          label={inWallet ? "Salvo" : "Carteira"}
        />
        <ActionButton
          onClick={() => setInfo(true)}
          ativo={false}
          icon={<Info size={30} />}
          label="Empresa"
        />
      </div>

      {/* Nome da empresa (rodapé) */}
      <div className="absolute inset-x-0 bottom-6 px-4 text-white">
        <button
          onClick={() => setInfo(true)}
          className="flex items-center gap-2 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <UserRound size={20} />
          </span>
          <span>
            <span className="block text-sm font-bold">{video.empresaNome}</span>
            {video.segmento && (
              <span className="block text-xs text-white/80">
                {video.segmento}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Painel "conhecer a empresa" */}
      {info && (
        <EmpresaPanel video={video} onClose={() => setInfo(false)} />
      )}
    </section>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  ativo,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  ativo: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 transition-transform active:scale-90"
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          ativo ? "bg-white/25" : "bg-black/30"
        } backdrop-blur`}
      >
        {icon}
      </span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

/** Painel deslizante com os dados da empresa (simples, limpo, pouca info) */
function EmpresaPanel({
  video,
  onClose,
}: {
  video: FeedVideo;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-end bg-black/50">
      <div className="w-full rounded-t-3xl bg-white p-6 text-dark">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-light to-primary text-white">
              <UserRound size={24} />
            </span>
            <div>
              <h2 className="text-lg font-bold">{video.empresaNome}</h2>
              <p className="text-xs text-primary">{video.segmento}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full bg-slate-100 p-1.5 text-muted"
          >
            <X size={18} />
          </button>
        </div>

        {video.descricao && (
          <p className="mb-4 text-sm text-muted">{video.descricao}</p>
        )}

        <div className="flex flex-col gap-3">
          <InfoLine icon={<MapPin size={16} />} label="Cidade" value={video.cidade} />
          <InfoLine
            icon={<MapPin size={16} />}
            label="Onde atende"
            value={video.ondeAtende}
          />
          <InfoLine
            icon={<Wrench size={16} />}
            label="Serviços"
            value={video.servicos}
          />
        </div>
      </div>
    </div>
  );
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-dark">{value}</p>
      </div>
    </div>
  );
}

/** Banner de patrocínio intercalado no feed */
function BannerSlide({ sponsor }: { sponsor: FeedSponsor }) {
  const conteudo = (
    <section className="relative flex h-full w-full snap-start flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-light p-8 text-center text-white">
      <span className="mb-3 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide">
        Patrocínio
      </span>
      {sponsor.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sponsor.banner_url}
          alt={sponsor.nome}
          className="max-h-[60%] w-full rounded-2xl object-contain"
        />
      ) : (
        <h2 className="text-2xl font-extrabold">{sponsor.nome}</h2>
      )}
      <p className="mt-4 text-sm text-white/85">{sponsor.nome}</p>
    </section>
  );

  return sponsor.link_url ? (
    <Link href={sponsor.link_url} target="_blank">
      {conteudo}
    </Link>
  ) : (
    conteudo
  );
}
