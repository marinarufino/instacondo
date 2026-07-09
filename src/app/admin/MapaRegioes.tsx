"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type RegiaoMapa = {
  nome: string;
  empresas: number;
  sindicos: number;
};

// Coordenadas aproximadas das regiões atendidas
const COORDS: Record<string, [number, number]> = {
  "Rio de Janeiro": [-22.9068, -43.1729],
  "São Paulo": [-23.5505, -46.6333],
};

/** Mapa com marcadores por região mostrando nº de empresas e síndicos */
export default function MapaRegioes({ regioes }: { regioes: RegiaoMapa[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancel || !ref.current || mapRef.current) return;

      const map = L.map(ref.current, {
        center: [-23.2, -44.9],
        zoom: 6,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      regioes.forEach((r) => {
        const coord = COORDS[r.nome];
        if (!coord) return;
        const total = r.empresas + r.sindicos;
        const raio = 12 + Math.min(28, total * 3);

        L.circleMarker(coord, {
          radius: raio,
          color: "#6d28d9",
          fillColor: "#8b5cf6",
          fillOpacity: 0.5,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(
            `<b>${r.nome}</b><br/>🏢 ${r.empresas} empresa(s)<br/>🧑‍💼 ${r.sindicos} síndico(s)`
          );
      });
    })();

    return () => {
      cancel = true;
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, [regioes]);

  return (
    <div
      ref={ref}
      className="h-72 w-full overflow-hidden rounded-2xl border border-slate-200"
      style={{ background: "#e2e8f0" }}
    />
  );
}
