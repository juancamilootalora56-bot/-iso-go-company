"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parseComunicaciones,
  comunicacionVacia,
  renumerar,
  resumenPorTipo,
  resumenPorMedio,
  resumenPorGrupo,
  proximasComunicaciones,
  colorEstadoComunicacion,
  iconoMedio,
  TIPOS_COMUNICACION,
  MEDIOS_COMUNICACION,
  FRECUENCIAS_COMUNICACION,
  ESTADOS_COMUNICACION,
  type ComunicacionItem,
} from "@/lib/comunicaciones";
import { GRUPOS_INTERESADOS } from "@/lib/partesInteresadasItems";
import { parseLista } from "@/lib/mapaProcesos";

const ITEM_KEY = "matriz_comunicaciones";
const NARANJA = "#F97316";

const celdaInput =
  "w-full bg-transparent border-0 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] rounded px-1.5 py-1 text-xs text-[#1A1A1A] placeholder-gray-300";
const celdaTextarea = celdaInput + " resize-none";
const th = "text-[10px] font-bold uppercase tracking-wide text-gray-500 px-2 py-2.5 text-left whitespace-nowrap border-b border-gray-200 bg-[#FAFAFA]";

type Vista = "tabla" | "flujo";

export default function MatrizComunicacionesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const { docs: docsGerencia, loading: loadingGerencia } = useGestionDocumentos("gerencia", user?.id ?? null);

  const guardados = useMemo(() => parseComunicaciones(docs[ITEM_KEY] ?? ""), [docs]);
  const procesosMapa = useMemo(() => parseLista(docsGerencia["mapa_procesos_seleccion"] ?? ""), [docsGerencia]);

  const [items, setItems] = useState<ComunicacionItem[] | null>(null);
  const [vista, setVista] = useState<Vista>("tabla");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const actuales = items ?? guardados;

  if (loading || loadingGerencia) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const filtrados = actuales.filter((c) => (!filtroTipo || c.tipo === filtroTipo) && (!filtroGrupo || c.grupoInteresado === filtroGrupo));

  const porTipo = resumenPorTipo(actuales);
  const porMedio = resumenPorMedio(actuales);
  const porGrupo = resumenPorGrupo(actuales);
  const proximas = proximasComunicaciones(actuales);

  function actualizarFila(id: string, cambios: Partial<ComunicacionItem>) {
    setItems(actuales.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
    setGuardado(false);
  }

  function agregarFila() {
    setItems([...actuales, comunicacionVacia(actuales.length + 1)]);
    setGuardado(false);
  }

  function eliminarFila(id: string) {
    if (!confirm("¿Eliminar esta comunicación de la matriz?")) return;
    setItems(renumerar(actuales.filter((c) => c.id !== id)));
    setGuardado(false);
  }

  async function guardarTodo() {
    setGuardando(true);
    await save(ITEM_KEY, JSON.stringify(actuales));
    setItems(null);
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  return (
    <div className="space-y-4 pb-16">
      <Link href={`${basePath}/matrices`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Matrices
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz de Comunicaciones</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Qué se comunica, por qué, quién lo emite, a quién, por qué canal y con qué frecuencia — comunicación interna
          y externa del sistema de gestión (ISO 9001, cl. 7.4).
        </p>
      </div>

      {actuales.length > 0 && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
              <span className="text-lg font-bold text-[#1A1A1A]">{actuales.length}</span>
              <span className="text-xs text-gray-500 ml-1.5">comunicaciones</span>
            </div>
            {porTipo.map((t) => (
              <div key={t.tipo} className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <span className="text-sm">{t.tipo === "Interna" ? "🏠" : "🌐"}</span>
                <span className="text-sm font-bold text-[#1A1A1A]">{t.cantidad}</span>
                <span className="text-xs text-gray-500">{t.tipo === "Interna" ? "Internas" : "Externas"}</span>
              </div>
            ))}
            {proximas.length > 0 && (
              <div className="bg-[#FFF6E5] border border-[#F5A623]/40 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: NARANJA }}>
                  ⏰ {proximas.length}
                </span>
                <span className="text-xs text-gray-600">en los próximos 7 días</span>
              </div>
            )}
          </div>

          {(porMedio.length > 0 || porGrupo.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {porMedio.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2.5">Canales más usados</p>
                  <div className="space-y-1.5">
                    {porMedio.slice(0, 5).map((m) => (
                      <div key={m.medio} className="flex items-center gap-2">
                        <span className="text-sm w-5">{m.icono}</span>
                        <span className="text-xs text-gray-600 flex-1 truncate">{m.medio}</span>
                        <span className="text-xs font-bold text-[#1A1A1A]">{m.cantidad}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {porGrupo.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2.5">Partes interesadas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {porGrupo.map((g) => (
                      <span
                        key={g.grupo}
                        className="text-[11px] font-semibold px-2 py-1 rounded-full text-white"
                        style={{ backgroundColor: g.color }}
                      >
                        {g.label} · {g.cantidad}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1.5 w-fit">
          <button
            onClick={() => setVista("tabla")}
            className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors ${vista === "tabla" ? "bg-[#1A1A1A] text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            📊 Tabla
          </button>
          <button
            onClick={() => setVista("flujo")}
            className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors ${vista === "flujo" ? "bg-[#1A1A1A] text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            🔀 Flujo visual
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]">
            <option value="">Todos los tipos</option>
            {TIPOS_COMUNICACION.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]">
            <option value="">Todas las partes interesadas</option>
            {GRUPOS_INTERESADOS.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </select>
          {(filtroTipo || filtroGrupo) && (
            <button
              onClick={() => {
                setFiltroTipo("");
                setFiltroGrupo("");
              }}
              className="text-xs text-gray-400 hover:text-[#1A1A1A]"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {vista === "tabla" ? (
        <VistaTabla
          filtrados={filtrados}
          actuales={actuales}
          procesosMapa={procesosMapa}
          onActualizar={actualizarFila}
          onEliminar={eliminarFila}
        />
      ) : (
        <VistaFlujo filtrados={filtrados} actuales={actuales} />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={agregarFila} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
          + Agregar comunicación
        </button>
        <div className="flex items-center gap-3">
          {guardado && <span className="text-xs text-green-600 font-semibold">Guardado ✓</span>}
          <button
            onClick={guardarTodo}
            disabled={guardando}
            className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar matriz"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VistaTabla({
  filtrados,
  actuales,
  procesosMapa,
  onActualizar,
  onEliminar,
}: {
  filtrados: ComunicacionItem[];
  actuales: ComunicacionItem[];
  procesosMapa: string[];
  onActualizar: (id: string, cambios: Partial<ComunicacionItem>) => void;
  onEliminar: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <th className={th + " sticky left-0 z-10 bg-[#FAFAFA]"} style={{ minWidth: 40 }}>N°</th>
            <th className={th} style={{ minWidth: 100 }}>Tipo</th>
            <th className={th} style={{ minWidth: 150 }}>Parte interesada</th>
            <th className={th} style={{ minWidth: 160 }}>Proceso</th>
            <th className={th} style={{ minWidth: 220 }}>Qué se comunica</th>
            <th className={th} style={{ minWidth: 200 }}>Objetivo</th>
            <th className={th} style={{ minWidth: 150 }}>Emisor / responsable</th>
            <th className={th} style={{ minWidth: 170 }}>Destinatario</th>
            <th className={th} style={{ minWidth: 220 }}>Medio / canal</th>
            <th className={th} style={{ minWidth: 150 }}>Frecuencia</th>
            <th className={th} style={{ minWidth: 200 }}>Evidencia / registro</th>
            <th className={th} style={{ minWidth: 130 }}>Próxima comunicación</th>
            <th className={th} style={{ minWidth: 130 }}>Estado</th>
            <th className={th} style={{ minWidth: 200 }}>Observaciones</th>
            <th className={th} style={{ minWidth: 40 }} />
          </tr>
        </thead>
        <tbody>
          {filtrados.length === 0 ? (
            <tr>
              <td colSpan={15} className="text-center text-sm text-gray-400 py-10">
                {actuales.length === 0 ? "Todavía no hay comunicaciones cargadas en la matriz." : "Ninguna comunicación coincide con los filtros."}
              </td>
            </tr>
          ) : (
            filtrados.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]/60 align-top">
                <td className="sticky left-0 bg-white text-center text-xs font-bold text-gray-400 py-1.5 border-r border-gray-50">{c.numero}</td>
                <td>
                  <select value={c.tipo} onChange={(e) => onActualizar(c.id, { tipo: e.target.value as ComunicacionItem["tipo"] })} className={celdaInput}>
                    {TIPOS_COMUNICACION.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select value={c.grupoInteresado} onChange={(e) => onActualizar(c.id, { grupoInteresado: e.target.value as ComunicacionItem["grupoInteresado"] })} className={celdaInput}>
                    <option value="">—</option>
                    {GRUPOS_INTERESADOS.map((g) => (
                      <option key={g.key} value={g.key}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {procesosMapa.length > 0 ? (
                    <select value={procesosMapa.includes(c.proceso) ? c.proceso : ""} onChange={(e) => onActualizar(c.id, { proceso: e.target.value })} className={celdaInput}>
                      <option value="">—</option>
                      {procesosMapa.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input value={c.proceso} onChange={(e) => onActualizar(c.id, { proceso: e.target.value })} placeholder="Proceso" className={celdaInput} />
                  )}
                </td>
                <td>
                  <textarea rows={2} value={c.contenido} onChange={(e) => onActualizar(c.id, { contenido: e.target.value })} placeholder="¿Qué se comunica?" className={celdaTextarea} />
                </td>
                <td>
                  <textarea rows={2} value={c.objetivo} onChange={(e) => onActualizar(c.id, { objetivo: e.target.value })} placeholder="¿Para qué?" className={celdaTextarea} />
                </td>
                <td>
                  <input value={c.emisor} onChange={(e) => onActualizar(c.id, { emisor: e.target.value })} placeholder="Cargo / área" className={celdaInput} />
                </td>
                <td>
                  <input value={c.destinatario} onChange={(e) => onActualizar(c.id, { destinatario: e.target.value })} placeholder="Cargo / área / público" className={celdaInput} />
                </td>
                <td>
                  <select value={c.medio} onChange={(e) => onActualizar(c.id, { medio: e.target.value })} className={celdaInput}>
                    <option value="">—</option>
                    {MEDIOS_COMUNICACION.map((m) => (
                      <option key={m.nombre} value={m.nombre}>
                        {m.icono} {m.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select value={c.frecuencia} onChange={(e) => onActualizar(c.id, { frecuencia: e.target.value })} className={celdaInput}>
                    {FRECUENCIAS_COMUNICACION.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <textarea rows={2} value={c.evidencia} onChange={(e) => onActualizar(c.id, { evidencia: e.target.value })} placeholder="Ej: acta, correo, pantallazo" className={celdaTextarea} />
                </td>
                <td>
                  <input type="date" value={c.fechaProximaComunicacion} onChange={(e) => onActualizar(c.id, { fechaProximaComunicacion: e.target.value })} className={celdaInput} />
                </td>
                <td>
                  <select
                    value={c.estado}
                    onChange={(e) => onActualizar(c.id, { estado: e.target.value as ComunicacionItem["estado"] })}
                    className={celdaInput + " font-semibold"}
                    style={{ color: colorEstadoComunicacion(c.estado) }}
                  >
                    {ESTADOS_COMUNICACION.map((e) => (
                      <option key={e} value={e} style={{ color: "#1A1A1A" }}>
                        {e}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <textarea rows={2} value={c.observaciones} onChange={(e) => onActualizar(c.id, { observaciones: e.target.value })} className={celdaTextarea} />
                </td>
                <td className="text-center">
                  <button onClick={() => onEliminar(c.id)} className="text-red-300 hover:text-red-600 text-sm px-1">
                    ✕
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function VistaFlujo({ filtrados, actuales }: { filtrados: ComunicacionItem[]; actuales: ComunicacionItem[] }) {
  const grupoColor: Record<string, string> = Object.fromEntries(GRUPOS_INTERESADOS.map((g) => [g.key, g.color]));
  const grupoLabel: Record<string, string> = Object.fromEntries(GRUPOS_INTERESADOS.map((g) => [g.key, g.label]));

  if (actuales.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
        <p className="text-gray-500 text-sm">Todavía no hay comunicaciones cargadas. Agregá la primera para ver el flujo.</p>
      </div>
    );
  }

  if (filtrados.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
        <p className="text-gray-500 text-sm">Ninguna comunicación coincide con los filtros.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {TIPOS_COMUNICACION.map((tipo) => {
        const items = filtrados.filter((c) => c.tipo === tipo);
        if (items.length === 0) return null;
        return (
          <div key={tipo}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                {tipo === "Interna" ? "🏠 Comunicación Interna" : "🌐 Comunicación Externa"}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {items.length}
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((c) => {
                const color = c.grupoInteresado ? grupoColor[c.grupoInteresado] : NARANJA;
                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                    <div className="h-1.5" style={{ backgroundColor: color }} />
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {c.grupoInteresado ? (
                          <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                            {grupoLabel[c.grupoInteresado]}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Sin clasificar</span>
                        )}
                        <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: colorEstadoComunicacion(c.estado) }}>
                          {c.estado}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-[#1A1A1A] leading-snug mb-3">{c.contenido || "Sin descripción"}</p>

                      {/* Flujo: Emisor -> Canal -> Destinatario */}
                      <div className="flex items-center gap-1.5 bg-[#FAFAFA] rounded-xl p-2.5 mb-3">
                        <div className="flex-1 min-w-0 text-center">
                          <p className="text-[8px] uppercase tracking-wide font-bold text-gray-400">Emisor</p>
                          <p className="text-[11px] font-semibold text-[#1A1A1A] truncate" title={c.emisor}>
                            {c.emisor || "—"}
                          </p>
                        </div>
                        <div className="flex flex-col items-center flex-shrink-0 px-1">
                          <span className="text-base leading-none">{c.medio ? iconoMedio(c.medio) : "➡️"}</span>
                          <span className="text-gray-300 text-xs leading-none">→</span>
                        </div>
                        <div className="flex-1 min-w-0 text-center">
                          <p className="text-[8px] uppercase tracking-wide font-bold text-gray-400">Destinatario</p>
                          <p className="text-[11px] font-semibold text-[#1A1A1A] truncate" title={c.destinatario}>
                            {c.destinatario || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto space-y-1 text-[11px] text-gray-500">
                        <p>
                          <span className="font-semibold text-gray-400">Canal:</span> {c.medio || "Sin definir"}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-400">Frecuencia:</span> {c.frecuencia}
                        </p>
                        {c.fechaProximaComunicacion && (
                          <p>
                            <span className="font-semibold text-gray-400">Próxima:</span>{" "}
                            {new Date(c.fechaProximaComunicacion + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
