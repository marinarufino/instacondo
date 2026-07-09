import type { MetadataRoute } from "next";

/** Manifest do PWA — permite instalar o Connexa como app no celular */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Connexa",
    short_name: "Connexa",
    description:
      "Conecta. Facilita. Transforma. — Conectando síndicos a empresas confiáveis.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#6d28d9",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
