"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { parseLista, parseClasificacion, type CategoriaProceso } from "@/lib/mapaProcesos";

const ITEM_KEY_SELECCION = "mapa_procesos_seleccion";
const ITEM_KEY_CLASIFICACION = "mapa_procesos_clasificacion";

// Mismos colores que la página real de Mapa de Procesos (gestion-gerencia/mapa_procesos/resultado)
const CATEGORIA_COLOR: Record<CategoriaProceso, string> = {
  estrategicos: "#6366F1",
  misionales: "#F5A623",
  apoyo: "#2DD4CF",
};

const CX = 260;
const CY = 230;
const R = 165;
const HUB_R = 46;

// Redondeamos a 2 decimales: Node y el navegador pueden serializar el mismo
// float con distinta cantidad de dígitos, lo que rompe la hidratación de React.
const round = (n: number) => Math.round(n * 100) / 100;

export default function MapaProcesosOrbitWidget({
  docs,
  loading,
  compact = false,
}: {
  docs: Record<string, string>;
  loading: boolean;
  compact?: boolean;
}) {
  const params = useParams();
  const locale = params.locale as string;
  const { profile } = useDashboardUser();
  const basePath = `/${locale}/dashboard/gestion-gerencia/mapa_procesos`;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <p className="text-gray-400 text-sm">Cargando mapa de procesos...</p>
      </div>
    );
  }

  const procesos = parseLista(docs[ITEM_KEY_SELECCION] ?? "");
  const clasificacion = parseClasificacion(docs[ITEM_KEY_CLASIFICACION] ?? "");
  const clasificados = procesos.filter((p) => clasificacion[p]);

  if (clasificados.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <h2 className="font-semibold text-[#1A1A1A] mb-1">Mapa de Procesos</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-3">
            Todavía no configuraste el mapa de procesos de tu organización. Una vez lo armes, se va a ver acá como un
            mapa interactivo con tu empresa en el centro.
          </p>
          <Link href={basePath} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">
            Configura tu mapa de procesos →
          </Link>
        </div>
      </div>
    );
  }

  const nodes = clasificados.map((proceso, i) => {
    const angle = (i * 360) / clasificados.length - 90;
    const rad = (angle * Math.PI) / 180;
    const categoria = clasificacion[proceso];
    return {
      proceso,
      categoria,
      color: CATEGORIA_COLOR[categoria],
      x: round(CX + R * Math.cos(rad)),
      y: round(CY + R * Math.sin(rad)),
      i,
    };
  });

  const iniciales = (profile?.company_name ?? profile?.full_name ?? "ISO")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`bg-gradient-to-br from-gray-800 to-[#1A1A1A] rounded-2xl shadow-2xl relative overflow-hidden ${
        compact ? "p-5" : "p-6 md:p-8"
      }`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at center, rgba(245,166,35,0.15) 0%, transparent 65%)" }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-white font-bold">Mapa de Procesos</h2>
        <Link
          href={`${basePath}/resultado`}
          className="text-sm text-[#F5A623] font-medium hover:text-[#e09410] whitespace-nowrap"
        >
          Ver mapa completo →
        </Link>
      </div>
      <p className="relative z-10 text-xs text-gray-400 mb-4">
        {clasificados.length} procesos conectados alrededor de tu organización
      </p>

      <svg
        viewBox="0 0 520 460"
        className={`relative z-10 w-full h-auto mx-auto ${compact ? "max-w-[300px]" : "max-w-[460px]"}`}
      >
        {/* Órbita */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F5A623" strokeOpacity={0.15} strokeWidth={1.5} strokeDasharray="4 6" />

        {/* Radios que conectan cada proceso con el centro */}
        {nodes.map((n) => (
          <line
            key={`line-${n.proceso}`}
            x1={CX}
            y1={CY}
            x2={n.x}
            y2={n.y}
            stroke={n.color}
            strokeOpacity={0.2}
            strokeWidth={1.5}
          />
        ))}

        {/* Núcleo: la empresa */}
        <circle cx={CX} cy={CY} r={HUB_R + 8} fill="none" stroke="#F5A623" strokeOpacity={0.3} strokeWidth={1.5} />
        <circle cx={CX} cy={CY} r={HUB_R} fill="#1F1F1F" stroke="#F5A623" strokeWidth={2} />
        {profile?.logo_url ? (
          <foreignObject x={CX - HUB_R + 8} y={CY - HUB_R + 8} width={(HUB_R - 8) * 2} height={(HUB_R - 8) * 2}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.logo_url} alt="" className="w-full h-full object-contain rounded-full" />
          </foreignObject>
        ) : (
          <text
            x={CX}
            y={CY + 7}
            textAnchor="middle"
            fill="#F5A623"
            fontSize={20}
            fontWeight={800}
            fontFamily="Poppins, Montserrat, Arial, sans-serif"
          >
            {iniciales}
          </text>
        )}

        {/* Nodos de procesos */}
        {nodes.map((n) => (
          <g key={n.proceso}>
            <circle
              cx={n.x}
              cy={n.y}
              r={16}
              fill="none"
              stroke={n.color}
              strokeOpacity={0.4}
              strokeWidth={1.5}
              className="iso-node-pulse"
              style={{ animationDelay: `${n.i * 0.3}s` }}
            />
            <circle cx={n.x} cy={n.y} r={7} fill={n.color} />
          </g>
        ))}
      </svg>

      {/* Leyenda: nombres de cada proceso (evita amontonar texto en el gráfico) */}
      <div
        className={`relative z-10 grid gap-x-4 gap-y-1.5 mt-5 pt-4 border-t border-white/10 ${
          compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
        }`}
      >
        {nodes.map((n) => (
          <Link
            key={n.proceso}
            href={`${basePath}/resultado`}
            className="flex items-center gap-1.5 min-w-0 group"
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.color }} />
            <span className="text-[11px] text-gray-300 group-hover:text-white truncate transition-colors">
              {n.proceso}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
