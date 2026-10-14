"use client";

import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  ETAPAS_DISENO,
  estadosEtapasDiagrama,
  parseEtapasPlanificacion,
  parseEntradasDiseno,
  parseSalidasDiseno,
  parseControlDiseno,
  type ProyectoDiseno,
  type EstadoEtapaDiagrama,
} from "@/lib/disenoDesarrollo";

const TEAL = "#14B8A6";

function estiloEtapa(estado: EstadoEtapaDiagrama) {
  switch (estado) {
    case "completo":
      return { bg: "#22C55E", texto: "Completo" };
    case "en_curso":
      return { bg: TEAL, texto: "En curso" };
    default:
      return { bg: "#E5E7EB", texto: "Pendiente" };
  }
}

export default function DiagramaEtapasDiseno({ userId, proyecto }: { userId: string | null; proyecto: ProyectoDiseno }) {
  const { docs, loading } = useGestionDocumentos("diseno_desarrollo", userId);

  if (loading) {
    return <div className="bg-white rounded-2xl border border-gray-100 p-5 h-[120px] animate-pulse" />;
  }

  const etapas = parseEtapasPlanificacion(docs[`planificacion_diseno_${proyecto.id}`] ?? "");
  const entradas = parseEntradasDiseno(docs[`entradas_diseno_${proyecto.id}`] ?? "");
  const salidas = parseSalidasDiseno(docs[`salidas_diseno_${proyecto.id}`] ?? "");
  const control = parseControlDiseno(docs[`control_diseno_${proyecto.id}`] ?? "");

  const estados = estadosEtapasDiagrama(proyecto, etapas, entradas, salidas, control);
  const completas = Object.values(estados).filter((e) => e === "completo").length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 overflow-x-auto">
      <div className="flex items-center justify-between mb-4 min-w-max sm:min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Ciclo de Diseño y Desarrollo · ISO 9001 Cl. 8.3</p>
        <p className="text-xs font-semibold" style={{ color: TEAL }}>
          {completas}/{ETAPAS_DISENO.length} etapas completas
        </p>
      </div>
      <div className="flex items-start min-w-max sm:min-w-0">
        {ETAPAS_DISENO.map((etapa, i) => {
          const estado = estados[etapa.clave];
          const { bg, texto } = estiloEtapa(estado);
          const esUltimo = i === ETAPAS_DISENO.length - 1;
          return (
            <div key={etapa.clave} className="flex items-start flex-1 min-w-[90px]">
              <div className="flex flex-col items-center gap-1.5 w-full">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base shadow-sm flex-shrink-0 transition-colors"
                  style={{ backgroundColor: bg, color: estado === "pendiente" ? "#9CA3AF" : "white" }}
                >
                  {etapa.icono}
                </span>
                <p className="text-[11px] font-bold text-[#1A1A1A] text-center whitespace-nowrap">{etapa.nombre}</p>
                <span className="text-[9px] font-semibold uppercase tracking-wide text-center" style={{ color: bg }}>
                  {texto}
                </span>
              </div>
              {!esUltimo && (
                <div className="flex-1 h-10 flex items-center -mx-1">
                  <div
                    className="h-0.5 w-full rounded-full"
                    style={{ backgroundColor: estado === "completo" ? "#22C55E" : "#E5E7EB" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
