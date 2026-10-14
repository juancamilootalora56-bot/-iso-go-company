"use client";

import { Fragment } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parseOportunidadesMejora,
  prioridadOM,
  colorEstadoOM,
  estaAbiertaOM,
  resumenPorEstadoOM,
  resumenPorOrigenOM,
  type OportunidadMejora,
} from "@/lib/oportunidadesMejora";

const ITEM_KEY = "oportunidades_mejora_lista";
const NARANJA = "#F97316";

// Orden visual: fila = impacto (Alto arriba → Bajo abajo), columna = esfuerzo (Bajo izq → Alto der)
const FILAS_IMPACTO = ["Alto", "Medio", "Bajo"];
const COLUMNAS_ESFUERZO = ["Bajo", "Medio", "Alto"];

function BarraHorizontal({ datos }: { datos: { etiqueta: string; valor: number; color: string }[] }) {
  const max = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <div className="space-y-2.5">
      {datos.map((d) => (
        <div key={d.etiqueta} className="flex items-center gap-3">
          <p className="text-xs text-gray-500 w-40 flex-shrink-0 truncate" title={d.etiqueta}>{d.etiqueta}</p>
          <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
              style={{ width: `${(d.valor / max) * 100}%`, backgroundColor: d.color, minWidth: d.valor > 0 ? "28px" : "0px" }}
            >
              <span className="text-[10px] font-bold text-white whitespace-nowrap">{d.valor}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MatrizOportunidadesMejoraPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading } = useGestionDocumentos("calidad", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const casos = parseOportunidadesMejora(docs[ITEM_KEY] ?? "");
  const abiertas = casos.filter((c) => estaAbiertaOM(c.estado));
  const porEstado = resumenPorEstadoOM(casos);
  const porOrigen = resumenPorOrigenOM(casos);

  function celda(impacto: string, esfuerzo: string): OportunidadMejora[] {
    return abiertas.filter((c) => c.impacto === impacto && c.esfuerzo === esfuerzo);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={`${basePath}/oportunidades_mejora`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Oportunidades de Mejora
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz de Priorización</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ubicación de las oportunidades <strong>en curso</strong> según su impacto y el esfuerzo que requieren — para decidir qué atacar primero.
        </p>
      </div>

      {casos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-2">Todavía no hay oportunidades de mejora registradas.</p>
          <Link href={`${basePath}/oportunidades_mejora`} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
            Registrar la primera →
          </Link>
        </div>
      ) : (
        <>
          <Seccion icono="🧭" titulo="Matriz Impacto × Esfuerzo">
            <div className="flex">
              {/* Eje Y */}
              <div className="flex flex-col justify-between mr-2 py-1" style={{ minHeight: 420 }}>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide [writing-mode:vertical-rl] rotate-180">Impacto</span>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-1.5">
                  <div />
                  {COLUMNAS_ESFUERZO.map((esf) => (
                    <div key={esf} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide pb-1">
                      Esfuerzo {esf}
                    </div>
                  ))}
                  {FILAS_IMPACTO.map((imp) => (
                    <Fragment key={imp}>
                      <div className="flex items-center justify-end pr-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                        {imp}
                      </div>
                      {COLUMNAS_ESFUERZO.map((esf) => {
                        const items = celda(imp, esf);
                        const prioridad = prioridadOM(imp, esf);
                        return (
                          <div
                            key={`${imp}-${esf}`}
                            className="rounded-xl border p-2 min-h-[110px]"
                            style={{ backgroundColor: `${prioridad.color}14`, borderColor: `${prioridad.color}40` }}
                          >
                            <p className="text-[9px] font-bold uppercase tracking-wide mb-1.5" style={{ color: prioridad.color }}>
                              {prioridad.etiqueta}
                            </p>
                            <div className="space-y-1">
                              {items.length === 0 ? (
                                <p className="text-[10px] text-gray-300">—</p>
                              ) : (
                                items.map((it) => (
                                  <div
                                    key={it.id}
                                    title={it.titulo}
                                    className="bg-white rounded-md px-1.5 py-1 text-[10px] text-[#1A1A1A] font-semibold truncate shadow-sm border border-gray-100 flex items-center gap-1"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorEstadoOM(it.estado) }} />
                                    <span className="truncate">{it.radicado} — {it.titulo}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </Seccion>

          <Seccion icono="📌" titulo="Leyenda de Cuadrantes">
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <p><span className="font-bold" style={{ color: "#22C55E" }}>● Victoria rápida</span> — alto impacto, bajo esfuerzo. Atacar primero.</p>
              <p><span className="font-bold" style={{ color: "#14B8A6" }}>● Alta prioridad</span> — alto impacto, esfuerzo medio. Priorizar.</p>
              <p><span className="font-bold" style={{ color: "#3B82F6" }}>● Proyecto estratégico</span> — alto impacto, alto esfuerzo. Planificar con recursos.</p>
              <p><span className="font-bold" style={{ color: "#F5A623" }}>● Oportunista / A evaluar</span> — impacto medio. Evaluar caso a caso.</p>
              <p><span className="font-bold" style={{ color: "#9CA3AF" }}>● Relleno</span> — bajo impacto, bajo esfuerzo. Hacer si sobra tiempo.</p>
              <p><span className="font-bold" style={{ color: "#EF4444" }}>● Bajo valor</span> — bajo impacto, alto esfuerzo. Evitar / posponer.</p>
            </div>
          </Seccion>

          <div className="grid sm:grid-cols-2 gap-4">
            <Seccion icono="📌" titulo="Por Estado">
              <BarraHorizontal datos={porEstado.map((r) => ({ etiqueta: r.estado, valor: r.cantidad, color: r.color }))} />
            </Seccion>
            <Seccion icono="🔍" titulo="Por Origen">
              {porOrigen.length > 0 ? (
                <BarraHorizontal datos={porOrigen.map((r) => ({ etiqueta: r.origen, valor: r.cantidad, color: NARANJA }))} />
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">Sin datos de origen cargados.</p>
              )}
            </Seccion>
          </div>
        </>
      )}
    </div>
  );
}
