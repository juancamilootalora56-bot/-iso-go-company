"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import EncabezadoDocumento from "@/components/dashboard/EncabezadoDocumento";
import {
  parseLeccionesAprendidas,
  colorTipoLA,
  iconoTipoLA,
  colorEstadoDifusionLA,
  CATEGORIAS_LA,
  type LeccionAprendida,
} from "@/lib/leccionesAprendidas";

const ITEM_KEY = "lecciones_aprendidas_lista";
const NARANJA = "#F97316";

function fechaLegible(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function Apartado({ titulo, texto, destacado }: { titulo: string; texto: string; destacado?: boolean }) {
  if (!texto) return null;
  return (
    <div className={destacado ? "bg-[#FFF3E8] border-l-4 rounded-r-lg px-4 py-3 mb-3" : "mb-3"} style={destacado ? { borderColor: NARANJA } : {}}>
      <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${destacado ? "" : "text-gray-400"}`} style={destacado ? { color: NARANJA } : {}}>
        {titulo}
      </p>
      <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap leading-relaxed">{texto}</p>
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor?: string }) {
  if (!valor) return null;
  return (
    <div className="bg-[#FAFAFA] rounded-lg px-3 py-2 border border-gray-100">
      <p className="text-[9px] uppercase tracking-wide font-bold text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-[#1A1A1A] mt-0.5">{valor}</p>
    </div>
  );
}

export default function BibliotecaLeccionesPage() {
  const { user, profile } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading } = useGestionDocumentos("calidad", user?.id ?? null);
  const [busqueda, setBusqueda] = useState("");

  const lecciones = parseLeccionesAprendidas(docs[ITEM_KEY] ?? "");

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return lecciones;
    return lecciones.filter((l) =>
      [l.titulo, l.leccion, l.contexto, l.causaRaiz, l.recomendaciones, l.aplicabilidad, l.procesoArea, l.radicado]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [lecciones, busqueda]);

  const porCategoria = CATEGORIAS_LA.map((categoria) => ({
    categoria,
    items: filtradas.filter((l) => l.categoria === categoria),
  })).filter((g) => g.items.length > 0);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10">
      <Link href={`${basePath}/lecciones_aprendidas`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Lecciones Aprendidas
      </Link>

      {/* Portada del informe */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <EncabezadoDocumento />
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: NARANJA }}>
          Sistema de Gestión de Calidad · ISO 9001, cláusula 7.1.6
        </p>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mt-1">Biblioteca de Conocimiento Organizacional</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl">
          Registro consolidado de las lecciones aprendidas por {profile?.company_name || "la organización"}: aciertos a
          replicar, errores a no repetir, riesgos materializados y hallazgos técnicos, documentados para prevenir
          la pérdida de conocimiento y mejorar la toma de decisiones en futuros proyectos y procesos.
        </p>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex-wrap">
          <span>📅 Generado el {fechaLegible(new Date().toISOString().slice(0, 10))}</span>
          <span>📖 {lecciones.length} lección{lecciones.length !== 1 ? "es" : ""} documentada{lecciones.length !== 1 ? "s" : ""}</span>
          <span>🗂️ {porCategoria.length} categoría{porCategoria.length !== 1 ? "s" : ""} con contenido</span>
        </div>
      </div>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por palabra clave, radicado, proceso, recomendación..."
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F97316] shadow-sm"
      />

      {lecciones.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-2">Todavía no hay lecciones registradas.</p>
          <Link href={`${basePath}/lecciones_aprendidas`} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
            Registrar la primera →
          </Link>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm">Ninguna lección coincide con &quot;{busqueda}&quot;.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {porCategoria.map((grupo) => (
            <div key={grupo.categoria}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-bold text-[#1A1A1A]">{grupo.categoria}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {grupo.items.length} lección{grupo.items.length !== 1 ? "es" : ""}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="space-y-4">
                {grupo.items.map((l: LeccionAprendida) => (
                  <article key={l.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-start justify-between flex-wrap gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-mono text-[11px] text-gray-400">{l.radicado}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorTipoLA(l.tipo) }}>
                            {iconoTipoLA(l.tipo)} {l.tipo}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoDifusionLA(l.estadoDifusion) }}>
                            {l.estadoDifusion}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[#1A1A1A] leading-snug">{l.titulo}</h3>
                      </div>
                      <div className="text-right text-xs text-gray-400 flex-shrink-0">
                        <p>{fechaLegible(l.fecha)}</p>
                        {l.registradoPor && <p className="mt-0.5">Por {l.registradoPor}</p>}
                      </div>
                    </div>

                    <div className="px-6 pt-4 pb-5">
                      <div className="grid sm:grid-cols-3 gap-2 mb-4">
                        <Dato label="Categoría" valor={l.categoria} />
                        <Dato label="Fuente" valor={l.fuente} />
                        <Dato label="Proceso / área" valor={l.procesoArea} />
                      </div>

                      <Apartado titulo="Contexto — qué pasó" texto={l.contexto} />
                      <Apartado titulo="Causa raíz" texto={l.causaRaiz} />
                      <Apartado titulo="📖 Lección aprendida" texto={l.leccion} destacado />
                      <Apartado titulo="Recomendaciones" texto={l.recomendaciones} />
                      <Apartado titulo="Aplicabilidad — a qué procesos o proyectos aplica" texto={l.aplicabilidad} />
                      <Apartado titulo="Observaciones" texto={l.observaciones} />

                      {l.evidenciaNombre && (
                        <a
                          href={l.evidencia ?? "#"}
                          download={l.evidenciaNombre}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold mt-1 hover:opacity-80"
                          style={{ color: NARANJA }}
                        >
                          📎 {l.evidenciaNombre}
                        </a>
                      )}

                      {l.bitacora.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">Seguimiento</p>
                          <div className="space-y-1.5">
                            {[...l.bitacora].reverse().map((b) => (
                              <p key={b.id} className="text-xs text-gray-500">
                                <span className="text-gray-300">•</span> {b.nota}{" "}
                                <span className="text-gray-300">— {b.autor}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
