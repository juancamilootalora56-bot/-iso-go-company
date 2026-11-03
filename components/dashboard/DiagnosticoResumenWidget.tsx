"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  TOTAL_ITEMS_DIAGNOSTICO,
  calcularResultados,
  cantidadRespondidas,
  colorAccion,
  colorCalificacionGlobal,
  parseRespuestasDiagnostico,
} from "@/lib/diagnosticoISO9001";

const ITEM_KEY_RESPUESTAS = "respuestas_iso9001";

// Nombres cortos para que entren debajo de cada anillo sin romper el layout.
const TITULOS_CORTOS: Record<string, string> = {
  "4": "Contexto",
  "5": "Liderazgo",
  "6": "Planificación",
  "7": "Apoyo",
  "8": "Operación",
  "9": "Evaluación",
  "10": "Mejora",
};

function Anillo({ pct, color, size = 76, grosor = 7 }: { pct: number; color: string; size?: number; grosor?: number }) {
  const r = (size - grosor) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, pct)) / 100) * c;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={grosor} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={grosor}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-extrabold text-[#1A1A1A]">{pct}%</span>
      </div>
    </div>
  );
}

export default function DiagnosticoResumenWidget() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/diagnostico`;

  const { docs, loading } = useGestionDocumentos("diagnostico", user?.id ?? null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <p className="text-gray-400 text-sm">Cargando diagnóstico...</p>
      </div>
    );
  }

  const respuestas = parseRespuestasDiagnostico(docs[ITEM_KEY_RESPUESTAS] ?? "");
  const respondidas = cantidadRespondidas(respuestas);
  const completo = respondidas === TOTAL_ITEMS_DIAGNOSTICO;

  if (!completo) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
            <span>🔍</span> Diagnóstico ISO 9001:2015
          </h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">Evaluación de tu Sistema de Gestión de Calidad contra la norma.</p>
        <div className="flex flex-col items-center justify-center py-6 text-center bg-[#FAFAFA] rounded-xl">
          {respondidas > 0 ? (
            <>
              <p className="text-sm text-gray-500">
                Tenés un diagnóstico en progreso — {respondidas} de {TOTAL_ITEMS_DIAGNOSTICO} criterios respondidos.
              </p>
              <Link href={basePath} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410] mt-2">
                Continuar diagnóstico →
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">Todavía no hiciste tu diagnóstico.</p>
              <Link href={basePath} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410] mt-2">
                + Empezar diagnóstico
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const resultado = calcularResultados(respuestas);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
          <span>🔍</span> Diagnóstico ISO 9001:2015
        </h2>
        <Link href={basePath} className="text-sm text-[#F5A623] font-medium hover:text-[#e09410] whitespace-nowrap">
          Ver completo →
        </Link>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        Resultado por cláusula —{" "}
        <span className="font-bold" style={{ color: colorCalificacionGlobal(resultado.calificacion) }}>
          {resultado.porcentajeGlobal}% global · {resultado.calificacion}
        </span>
      </p>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {resultado.clausulas.map((c) => (
          <div key={c.numero} className="flex flex-col items-center gap-2 text-center">
            <Anillo pct={c.porcentaje} color={colorAccion(c.accion)} />
            <div>
              <p className="text-[11px] font-bold text-[#1A1A1A] leading-tight">{c.numero}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{TITULOS_CORTOS[c.numero] ?? c.titulo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
