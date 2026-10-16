"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parsePasos,
  tiempoEnMinutos,
  formatoTiempo,
  colorTipoPaso,
  simboloTipoPaso,
  type PasoProceso,
} from "@/lib/procesoOperativo";

function itemKeyProceso(productoId: string) {
  return `proceso_operativo_${productoId}`;
}

export default function DiagramaFlujoView({ userId, entidadId }: { userId: string | null; entidadId: string }) {
  const { docs, loading } = useGestionDocumentos("operativa", userId);
  const [pasos, setPasos] = useState<PasoProceso[]>([]);

  useEffect(() => {
    if (!loading) setPasos(parsePasos(docs[itemKeyProceso(entidadId)] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const pasosOrdenados = [...pasos].sort((a, b) => a.orden - b.orden);

  if (pasosOrdenados.length === 0) {
    return (
      <Seccion icono="🗺️" titulo="Diagrama de Flujo">
        <p className="text-gray-400 text-sm text-center py-6">
          Todavía no cargaste pasos del proceso. Agregalos desde la pestaña &ldquo;Proceso Operativo&rdquo;.
        </p>
      </Seccion>
    );
  }

  return (
    <Seccion icono="🗺️" titulo="Diagrama de Flujo">
      <div className="flex flex-col items-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-white bg-[#1A1A1A] px-3 py-1 rounded-full">Inicio</span>
        <div className="w-0.5 h-4 bg-gray-200" />
      </div>
      <div>
        {pasosOrdenados.map((p, i) => {
          const esUltimo = i === pasosOrdenados.length - 1;
          const forma =
            p.tipo === "Operación" ? "rounded-full" : p.tipo === "Combinado" ? "rotate-45 rounded-md" : "rounded-lg";
          const recursos = [
            ...p.materiasPrimas.map((r) => ({ icono: "🌾", nombre: r.nombre })),
            ...p.maquinarias.map((r) => ({ icono: "⚙️", nombre: r.nombre })),
            ...p.materiales.map((r) => ({ icono: "🧱", nombre: r.nombre })),
            ...p.insumos.map((r) => ({ icono: "🧪", nombre: r.nombre })),
          ].filter((r) => r.nombre);
          return (
            <div key={p.id} className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0 w-16">
                <span
                  className={`w-16 h-16 flex items-center justify-center text-white text-xl font-bold shadow-md ring-4 ring-white flex-shrink-0 ${forma}`}
                  style={{
                    backgroundColor: colorTipoPaso(p.tipo),
                    clipPath: p.tipo === "Almacenaje" ? "polygon(50% 8%, 8% 92%, 92% 92%)" : undefined,
                  }}
                >
                  <span className={p.tipo === "Combinado" ? "-rotate-45" : ""}>
                    {p.tipo !== "Almacenaje" ? simboloTipoPaso(p.tipo) : ""}
                  </span>
                </span>
                {!esUltimo && <div className="w-0.5 flex-1 min-h-[24px] bg-gray-200 my-1" />}
              </div>

              <div className="flex-1 min-w-0 bg-white border border-gray-100 rounded-2xl p-4 mb-5">
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Paso {p.orden}</span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                      style={{ backgroundColor: colorTipoPaso(p.tipo) }}
                    >
                      {simboloTipoPaso(p.tipo)} {p.tipo}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap ${
                        p.valorAgregado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                      }`}
                    >
                      {p.valorAgregado ? "Agrega valor" : "Sin valor agregado"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#1A1A1A] whitespace-nowrap">⏱️ {formatoTiempo(tiempoEnMinutos(p))}</span>
                </div>

                <p className="font-bold text-[#1A1A1A] text-base leading-snug">{p.nombre}</p>

                {p.responsable && <p className="text-xs text-gray-500 mt-1">👤 {p.responsable}</p>}

                {recursos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {recursos.map((r, idx) => (
                      <span key={idx} className="text-[10px] text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-2 py-0.5 whitespace-nowrap">
                        {r.icono} {r.nombre}
                      </span>
                    ))}
                  </div>
                )}

                {p.observaciones && <p className="text-xs text-gray-400 italic mt-2 line-clamp-2">{p.observaciones}</p>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col items-center -mt-3">
        <div className="w-0.5 h-4 bg-gray-200" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-white bg-[#22C55E] px-3 py-1 rounded-full">Fin</span>
      </div>
    </Seccion>
  );
}
