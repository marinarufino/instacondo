import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Connexa",
  description:
    "Conecta. Facilita. Transforma. — Conectando síndicos a empresas confiáveis.",
};

export const viewport: Viewport = {
  themeColor: "#6d28d9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full antialiased`}>
      {/* Fora do "celular": fundo neutro no desktop */}
      <body className="min-h-dvh bg-slate-200">
        {/* Shell mobile-first: no desktop vira uma moldura de celular centralizada */}
        <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-ice shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
