import { createClient } from "@/lib/supabase/server";
import Feed, { type FeedVideo, type FeedSponsor } from "./feed";

/** Botão 1 — Empresas: feed de vídeos em scroll vertical (coração do app) */
export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: videosRaw },
    { data: likesRaw },
    { data: walletRaw },
    { data: sponsorsRaw },
    { data: settings },
  ] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "id, url, duracao_seg, company_id, companies!inner(id, nome, descricao, cidade, onde_atende, servicos, assinatura_ativa, segments(nome))"
      )
      .eq("companies.assinatura_ativa", true)
      .order("created_at", { ascending: false }),
    user
      ? supabase.from("likes").select("video_id").eq("sindico_id", user.id)
      : Promise.resolve({ data: [] as { video_id: string }[] }),
    user
      ? supabase.from("wallet").select("company_id").eq("sindico_id", user.id)
      : Promise.resolve({ data: [] as { company_id: string }[] }),
    supabase.from("sponsors").select("id, nome, banner_url, link_url").eq("ativo", true),
    supabase.from("settings").select("banner_frequency").single(),
  ]);

  const likedIds = new Set((likesRaw ?? []).map((l) => l.video_id));
  const walletIds = new Set((walletRaw ?? []).map((w) => w.company_id));

  // Normaliza os vídeos (o join de companies/segments pode vir como array)
  type Row = {
    id: string;
    url: string;
    duracao_seg: number;
    company_id: string;
    companies:
      | {
          id: string;
          nome: string;
          descricao: string;
          cidade: string;
          onde_atende: string;
          servicos: string;
          segments: { nome: string } | { nome: string }[] | null;
        }
      | {
          id: string;
          nome: string;
          descricao: string;
          cidade: string;
          onde_atende: string;
          servicos: string;
          segments: { nome: string } | { nome: string }[] | null;
        }[];
  };

  const videos: FeedVideo[] = ((videosRaw as Row[]) ?? []).map((v) => {
    const c = Array.isArray(v.companies) ? v.companies[0] : v.companies;
    const seg = Array.isArray(c.segments) ? c.segments[0] : c.segments;
    return {
      id: v.id,
      url: v.url,
      empresaId: c.id,
      empresaNome: c.nome,
      descricao: c.descricao,
      cidade: c.cidade,
      ondeAtende: c.onde_atende,
      servicos: c.servicos,
      segmento: seg?.nome ?? "",
      liked: likedIds.has(v.id),
      inWallet: walletIds.has(c.id),
    };
  });

  const sponsors = (sponsorsRaw as FeedSponsor[]) ?? [];
  const bannerFreq = settings?.banner_frequency ?? 5;

  return <Feed videos={videos} sponsors={sponsors} bannerFreq={bannerFreq} />;
}
