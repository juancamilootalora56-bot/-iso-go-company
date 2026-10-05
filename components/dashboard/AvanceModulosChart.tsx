"use client";

import { ITEMS_GERENCIA } from "@/lib/gestionGerenciaItems";
import { estaCompletoActividad } from "@/lib/gestionGerenciaCompletitud";

const MODULOS = [
  { label: "Gerencia", corto: "GER" },
  { label: "Talento Humano", corto: "RRHH" },
  { label: "Compras", corto: "COM" },
  { label: "Comercial", corto: "VTA" },
  { label: "Operativa", corto: "OPER" },
  { label: "Diseño y Desarrollo", corto: "D&D" },
];

const WIDTH = 460;
const HEIGHT = 190;
const PAD_X = 28;
const PAD_TOP = 24;
const PAD_BOTTOM = 34;

function y(pct: number) {
  const usable = HEIGHT - PAD_TOP - PAD_BOTTOM;
  return PAD_TOP + usable - (pct / 100) * usable;
}

function x(i: number, n: number) {
  const usable = WIDTH - PAD_X * 2;
  return PAD_X + (usable * i) / (n - 1);
}

// Curva suave tipo "cardinal spline" usando puntos de control intermedios.
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

export default function AvanceModulosChart({
  docsGerencia,
  loading,
}: {
  docsGerencia: Record<string, string>;
  loading: boolean;
}) {
  const pctGerencia = Math.round(
    (ITEMS_GERENCIA.filter((i) => estaCompletoActividad(i.key, docsGerencia)).length / ITEMS_GERENCIA.length) * 100
  );

  // Los demás módulos todavía no tienen actividades cargadas en el sistema.
  const porcentajes = [pctGerencia, 0, 0, 0, 0, 0];

  const puntos = porcentajes.map((pct, i) => ({ x: x(i, porcentajes.length), y: y(pct), pct }));
  const linea = pathSuave(puntos);
  const area = `${linea} L ${puntos[puntos.length - 1].x} ${y(0)} L ${puntos[0].x} ${y(0)} Z`;

  const promedio = Math.round(porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-[#1A1A1A]">Avance por módulo</h2>
        <span className="text-xs font-bold text-[#F5A623] bg-[#F5A623]/10 px-2 py-1 rounded-full">
          {promedio}% promedio
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-3">% de actividades completadas en cada módulo de gestión.</p>

      {loading ? (
        <p className="text-gray-400 text-sm py-10 text-center">Cargando...</p>
      ) : (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto">
          <defs>
            <linearGradient id="avanceGradiente" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5A623" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Líneas guía horizontales (0 / 50 / 100%) */}
          {[0, 50, 100].map((v) => (
            <g key={v}>
              <line x1={PAD_X} x2={WIDTH - PAD_X} y1={y(v)} y2={y(v)} stroke="#F1F1F1" strokeWidth={1} />
              <text x={2} y={y(v) + 3} fontSize={9} fill="#B0B0B0">
                {v}%
              </text>
            </g>
          ))}

          {/* Área bajo la curva */}
          <path d={area} fill="url(#avanceGradiente)" />

          {/* Línea suave */}
          <path d={linea} fill="none" stroke="#F5A623" strokeWidth={2.5} strokeLinecap="round" />

          {/* Puntos + etiquetas */}
          {puntos.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="#fff" stroke="#F5A623" strokeWidth={2.5} />
              <text x={p.x} y={p.y - 10} fontSize={10} fontWeight={700} fill="#1A1A1A" textAnchor="middle">
                {p.pct}%
              </text>
              <text x={p.x} y={HEIGHT - 10} fontSize={9} fill="#9CA3AF" textAnchor="middle">
                {MODULOS[i].corto}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
