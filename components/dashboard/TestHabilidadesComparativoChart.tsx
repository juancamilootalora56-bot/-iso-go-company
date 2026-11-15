"use client";

import { useMemo, useState } from "react";
import { colorNivel, type ResultadoCompetencia } from "@/lib/testHabilidades";

const WIDTH = 980;
const HEIGHT = 360;
const PAD_LEFT = 36;
const PAD_RIGHT = 36;
const PAD_TOP = 24;
const PAD_BOTTOM = 64;

const ACENTO = "#D97706";
const REQUERIDO_COLOR = "#9CA3AF";

function pathSuave(puntos: { x: number; y: number }[]) {
  if (puntos.length < 2) return "";
  let d = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i];
    const p1 = puntos[i + 1];
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function TestHabilidadesComparativoChart({
  resultados,
  puntajeRequerido,
}: {
  resultados: ResultadoCompetencia[];
  puntajeRequerido: number;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const usableW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const usableH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const yMax = 5;

  const x = (i: number) => PAD_LEFT + (usableW * i) / Math.max(1, resultados.length - 1);
  const y = (v: number) => PAD_TOP + usableH - (v / yMax) * usableH;

  const coords = useMemo(
    () =>
      resultados.map((r, i) => ({
        x: x(i),
        y: y(r.puntaje),
        resultado: r,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resultados]
  );

  const lineaObtenido = pathSuave(coords);
  const areaObtenido = `${lineaObtenido} L ${coords[coords.length - 1].x} ${y(0)} L ${coords[0].x} ${y(0)} Z`;
  const yRequerido = y(puntajeRequerido);

  const guias = [0, 1, 2, 3, 4, 5];

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraccion = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(fraccion * (resultados.length - 1));
    setHover(idx);
  }

  const hovered = hover !== null ? coords[hover] : null;
  const tooltipLeftPct = hovered ? (hovered.x / WIDTH) * 100 : 0;
  const tooltipFlip = hovered ? hovered.x > WIDTH * 0.72 : false;

  return (
    <div className="relative max-w-full">
      {/* Leyenda de series */}
      <div className="flex items-center gap-5 mb-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg width="18" height="8" className="flex-shrink-0">
            <line x1="0" y1="4" x2="18" y2="4" stroke={ACENTO} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Puntaje obtenido
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg width="18" height="8" className="flex-shrink-0">
            <line x1="0" y1="4" x2="18" y2="4" stroke={REQUERIDO_COLOR} strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
          </svg>
          Puntaje requerido ({puntajeRequerido.toFixed(1)})
        </span>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto select-none">
        <defs>
          <linearGradient id="testHabilidadesArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACENTO} stopOpacity="0.14" />
            <stop offset="100%" stopColor={ACENTO} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {guias.map((v) => (
          <g key={v}>
            <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y(v)} y2={y(v)} stroke="#F0F0F0" strokeWidth={1} />
            <text x={PAD_LEFT - 10} y={y(v) + 4} fontSize={12} fill="#C4C4C4" textAnchor="end">
              {v}
            </text>
          </g>
        ))}

        {/* Línea de puntaje requerido */}
        <line
          x1={PAD_LEFT}
          x2={WIDTH - PAD_RIGHT}
          y1={yRequerido}
          y2={yRequerido}
          stroke={REQUERIDO_COLOR}
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeLinecap="round"
        />

        {/* Área + línea de puntaje obtenido */}
        <path d={areaObtenido} fill="url(#testHabilidadesArea)" />
        <path d={lineaObtenido} fill="none" stroke={ACENTO} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Crosshair */}
        {hovered && (
          <line x1={hovered.x} x2={hovered.x} y1={PAD_TOP} y2={HEIGHT - PAD_BOTTOM} stroke="#1A1A1A" strokeOpacity={0.12} strokeWidth={1.5} />
        )}

        {/* Marcadores + eje X escalonado */}
        {coords.map((c, i) => {
          const color = colorNivel(c.resultado.nivel);
          const activo = hover === i;
          const arriba = i % 2 === 0;
          const labelY = arriba ? HEIGHT - PAD_BOTTOM + 18 : HEIGHT - PAD_BOTTOM + 36;
          return (
            <g key={c.resultado.competencia.id}>
              <line x1={c.x} x2={c.x} y1={HEIGHT - PAD_BOTTOM} y2={labelY - 8} stroke="#E5E5E5" strokeWidth={1} />
              <text
                x={c.x}
                y={labelY}
                fontSize={10.5}
                fill={activo ? "#1A1A1A" : "#9CA3AF"}
                fontWeight={activo ? 700 : 400}
                textAnchor="middle"
              >
                {c.resultado.competencia.nombreCorto}
              </text>
              <circle cx={c.x} cy={c.y} r={activo ? 7 : 5} fill={color} stroke="#fff" strokeWidth={2.5} />
            </g>
          );
        })}

        {/* Capa invisible para detectar hover */}
        <rect
          x={PAD_LEFT}
          y={0}
          width={usableW}
          height={HEIGHT}
          fill="transparent"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute top-1 bg-[#1A1A1A] text-white rounded-lg px-3 py-2 shadow-lg pointer-events-none z-10 text-xs whitespace-nowrap"
          style={{
            left: `${tooltipLeftPct}%`,
            transform: `translateX(${tooltipFlip ? "-100%" : "0%"})`,
          }}
        >
          <p className="font-semibold">{hovered.resultado.competencia.nombre}</p>
          <p className="mt-0.5">
            <span className="font-bold" style={{ color: colorNivel(hovered.resultado.nivel) }}>
              {hovered.resultado.puntaje.toFixed(1)}/5
            </span>
            <span className="text-gray-400"> · {hovered.resultado.nivel}</span>
          </p>
        </div>
      )}

      {/* Leyenda de niveles */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50 flex-wrap">
        {(["Inadecuada", "Deficiente", "Aceptable", "Adecuada"] as const).map((nivel) => (
          <span key={nivel} className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorNivel(nivel) }} />
            {nivel}
          </span>
        ))}
      </div>
    </div>
  );
}
