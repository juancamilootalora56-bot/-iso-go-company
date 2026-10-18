"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import EncabezadoDocumento from "@/components/dashboard/EncabezadoDocumento";
import { parsePersonal } from "@/lib/personal";
import { parseLista } from "@/lib/mapaProcesos";
import {
  parseActividades,
  itemKeyMes,
  mesActual,
  nombreMes,
  mesAnterior,
  mesSiguiente,
  generarJornada,
  formatoDuracion,
  resumenPorEstado,
  colorEstadoActividad,
  PRIORIDADES_ACTIVIDAD,
  FRECUENCIAS_ACTIVIDAD,
  ESTADOS_ACTIVIDAD,
  type ActividadRelacion,
} from "@/lib/relacionActividades";

const NARANJA = "#F5A623";

const PALETA_DIAS = ["#F5A623", "#3B82F6", "#22C55E", "#7C4DFF", "#E8366B", "#06B6D4", "#F97316"];

function colorDelDia(fecha: string, diasAscendente: string[]): string {
  const idx = diasAscendente.indexOf(fecha);
  return PALETA_DIAS[idx % PALETA_DIAS.length];
}

function fechaLegibleLarga(fecha: string): string {
  const d = new Date(fecha + "T00:00:00");
  const texto = d.toLocaleDateString("es", { weekday: "long", day: "2-digit", month: "long" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const celdaInput =
  "w-full bg-transparent border-0 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] rounded px-1.5 py-1 text-xs text-[#1A1A1A] placeholder-gray-300";
const celdaTextarea = celdaInput + " resize-y min-h-[30px]";
const th = "text-[10px] font-bold uppercase tracking-wide text-gray-500 px-2 py-2.5 text-left whitespace-nowrap border-b border-gray-200 bg-[#FAFAFA]";
const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

export default function RelacionActividadesColaboradorPage() {
  const { user, colaborador: colaboradorSesion } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const colaboradorId = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs: docsTH, loading: loadingTH } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const { docs: docsGerencia, loading: loadingGerencia } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [mes, setMes] = useState(mesActual());
  const ITEM_KEY = itemKeyMes(colaboradorId, mes);
  const { docs, loading, save } = useGestionDocumentos("operativa", user?.id ?? null);

  const guardadas = useMemo(() => parseActividades(docs[ITEM_KEY] ?? ""), [docs, ITEM_KEY]);
  const procesosMapa = useMemo(() => parseLista(docsGerencia["mapa_procesos_seleccion"] ?? ""), [docsGerencia]);

  const [actividades, setActividades] = useState<ActividadRelacion[] | null>(null);
  const [mostrarGenerar, setMostrarGenerar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState(new Date().toISOString().slice(0, 10));
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("17:00");
  const [intervalo, setIntervalo] = useState(15);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [diasAbiertos, setDiasAbiertos] = useState<Record<string, boolean>>({});

  const actuales = actividades ?? guardadas;

  if (loadingTH || loadingGerencia || loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const personal = parsePersonal(docsTH["personal_lista"] ?? "");
  const colaborador = personal.find((p) => p.id === colaboradorId);

  if (!colaborador) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={`${basePath}/relacion_actividades`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Relación de Actividades
        </Link>
        <p className="text-gray-500 text-sm">No se encontró este colaborador.</p>
      </div>
    );
  }

  // Un colaborador solo puede ver/registrar su propia planilla, nunca la de otro.
  if (colaboradorSesion && colaboradorSesion.empleadoId !== colaboradorId) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={`${basePath}/relacion_actividades`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Relación de Actividades
        </Link>
        <p className="text-gray-500 text-sm">No tenés acceso a la planilla de otro colaborador.</p>
      </div>
    );
  }

  const ordenadas = [...actuales].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  const resumen = resumenPorEstado(actuales);

  const diasAscendente = Array.from(new Set(ordenadas.map((a) => a.fecha))).sort();
  const diaMasReciente = diasAscendente[diasAscendente.length - 1];

  const gruposPorDia = diasAscendente
    .map((fecha) => ({
      fecha,
      franjas: ordenadas.filter((a) => a.fecha === fecha),
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha)); // más reciente primero

  function estaAbierto(fecha: string): boolean {
    if (fecha in diasAbiertos) return diasAbiertos[fecha];
    return fecha === diaMasReciente;
  }

  function toggleDia(fecha: string) {
    setDiasAbiertos((prev) => ({ ...prev, [fecha]: !estaAbierto(fecha) }));
  }

  function actualizarFila(id: string, cambios: Partial<ActividadRelacion>) {
    setActividades(actuales.map((a) => (a.id === id ? { ...a, ...cambios } : a)));
    setMensaje("");
  }

  function eliminarFila(id: string) {
    if (!confirm("¿Eliminar esta franja horaria?")) return;
    setActividades(actuales.filter((a) => a.id !== id));
  }

  function generar() {
    if (!nuevaFecha.startsWith(mes)) {
      alert(`La fecha elegida no pertenece a ${nombreMes(mes)}. Cambiá el mes o la fecha.`);
      return;
    }
    const franjas = generarJornada(nuevaFecha, horaInicio, horaFin, intervalo);
    setActividades([...actuales, ...franjas]);
    setDiasAbiertos({ [nuevaFecha]: true });
    setMostrarGenerar(false);
  }

  async function guardar() {
    setGuardando(true);
    await save(ITEM_KEY, JSON.stringify(actuales));
    setActividades(null);
    setGuardando(false);
    setMensaje("Guardado ✓");
    setTimeout(() => setMensaje(""), 2500);
  }

  async function vaciarMes() {
    if (!confirm(`¿Vaciar todas las franjas de ${nombreMes(mes)}? Esta acción no se puede deshacer.`)) return;
    setGuardando(true);
    await save(ITEM_KEY, JSON.stringify([]));
    setActividades(null);
    setDiasAbiertos({});
    setGuardando(false);
    setMensaje("Mes vaciado ✓");
    setTimeout(() => setMensaje(""), 2500);
  }

  function cambiarMes(nuevoMes: string) {
    if (actividades !== null) {
      if (!confirm("Tenés cambios sin guardar en este mes. ¿Cambiar de mes de todas formas?")) return;
    }
    setMes(nuevoMes);
    setActividades(null);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-16">
      <Link href={`${basePath}/relacion_actividades`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Relación de Actividades
      </Link>

      {/* Encabezado */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <EncabezadoDocumento />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {colaborador.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={colaborador.foto} alt={`${colaborador.nombre} ${colaborador.apellido}`} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">👤</span>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: NARANJA }}>
              Relación de Actividades
            </p>
            <h1 className="text-xl font-bold text-[#1A1A1A]">
              {colaborador.nombre} {colaborador.apellido}
            </h1>
            <p className="text-xs text-gray-500">{colaborador.cargo || "Sin cargo"}</p>
          </div>
        </div>
      </div>

      {/* Navegador de mes */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-2 py-1.5">
          <button onClick={() => cambiarMes(mesAnterior(mes))} className="text-gray-400 hover:text-[#1A1A1A] px-2 py-1">
            ‹
          </button>
          <span className="text-sm font-bold text-[#1A1A1A] capitalize px-2">{nombreMes(mes)}</span>
          <button onClick={() => cambiarMes(mesSiguiente(mes))} className="text-gray-400 hover:text-[#1A1A1A] px-2 py-1">
            ›
          </button>
        </div>

        {actuales.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-white rounded-full border border-gray-100 px-3 py-1.5 font-semibold text-[#1A1A1A]">
              {actuales.length} franjas
            </span>
            {resumen.map((r) => (
              <span key={r.estado} className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: r.color }}>
                {r.cantidad} {r.estado}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Generar jornada */}
      {!mostrarGenerar ? (
        <button onClick={() => setMostrarGenerar(true)} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
          + Generar jornada nueva
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Generar franjas horarias de un día</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora inicio</label>
              <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora fin</label>
              <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Intervalo</label>
              <select value={intervalo} onChange={(e) => setIntervalo(Number(e.target.value))} className={inputClass}>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end mt-4">
            <button onClick={() => setMostrarGenerar(false)} className="text-xs text-gray-400 hover:text-[#1A1A1A]">
              Cancelar
            </button>
            <button onClick={generar} className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm">
              Generar franjas
            </button>
          </div>
        </div>
      )}

      {/* Días, cada uno en su propia sección plegable */}
      {gruposPorDia.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">
            Todavía no hay franjas cargadas para {nombreMes(mes)}. Generá la jornada de un día para empezar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {gruposPorDia.map((grupo) => {
            const color = colorDelDia(grupo.fecha, diasAscendente);
            const abierto = estaAbierto(grupo.fecha);
            const resumenDia = resumenPorEstado(grupo.franjas);
            return (
              <div key={grupo.fecha} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleDia(grupo.fecha)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left"
                  style={{ backgroundColor: `${color}14`, borderLeft: `4px solid ${color}` }}
                >
                  <span className="text-sm font-bold text-[#1A1A1A] flex-1 min-w-0 truncate">{fechaLegibleLarga(grupo.fecha)}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: color }}>
                    {grupo.franjas.length} franjas
                  </span>
                  <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                    {resumenDia.map((r) => (
                      <span key={r.estado} title={r.estado} className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                    ))}
                  </div>
                  <span className="text-gray-400 flex-shrink-0 text-xs">{abierto ? "▲" : "▼"}</span>
                </button>

                {abierto && (
                  <div className="overflow-x-auto border-t border-gray-100">
                    <table className="border-collapse w-full">
                      <thead>
                        <tr>
                          <th className={th} style={{ minWidth: 150 }}>Proceso</th>
                          <th className={th} style={{ minWidth: 100 }}>Prioridad</th>
                          <th className={th} style={{ minWidth: 110 }}>Frecuencia</th>
                          <th className={th} style={{ minWidth: 80 }}>Hora</th>
                          <th className={th} style={{ minWidth: 380 }}>Descripción de la actividad</th>
                          <th className={th} style={{ minWidth: 90 }}>Cantidad</th>
                          <th className={th} style={{ minWidth: 140 }}>Estado</th>
                          <th className={th} style={{ minWidth: 110 }}>Duración</th>
                          <th className={th} style={{ minWidth: 300 }}>Observaciones</th>
                          <th className={th} style={{ minWidth: 40 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {grupo.franjas.map((a) => (
                          <tr key={a.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]/60 align-top">
                            <td>
                              {procesosMapa.length > 0 ? (
                                <select value={procesosMapa.includes(a.proceso) ? a.proceso : ""} onChange={(e) => actualizarFila(a.id, { proceso: e.target.value })} className={celdaInput}>
                                  <option value="">—</option>
                                  {procesosMapa.map((p) => (
                                    <option key={p} value={p}>
                                      {p}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input value={a.proceso} onChange={(e) => actualizarFila(a.id, { proceso: e.target.value })} placeholder="Proceso" className={celdaInput} />
                              )}
                            </td>
                            <td>
                              <select value={a.prioridad} onChange={(e) => actualizarFila(a.id, { prioridad: e.target.value })} className={celdaInput}>
                                {PRIORIDADES_ACTIVIDAD.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select value={a.frecuencia} onChange={(e) => actualizarFila(a.id, { frecuencia: e.target.value })} className={celdaInput}>
                                {FRECUENCIAS_ACTIVIDAD.map((f) => (
                                  <option key={f} value={f}>
                                    {f}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input type="time" value={a.hora} onChange={(e) => actualizarFila(a.id, { hora: e.target.value })} className={celdaInput} />
                            </td>
                            <td>
                              <textarea
                                value={a.descripcion}
                                onChange={(e) => actualizarFila(a.id, { descripcion: e.target.value })}
                                placeholder="¿Qué se hizo en esta franja?"
                                rows={1}
                                className={celdaTextarea}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min={0}
                                value={a.cantidad}
                                onChange={(e) => actualizarFila(a.id, { cantidad: Math.max(0, Number(e.target.value) || 0) })}
                                onWheel={(e) => e.currentTarget.blur()}
                                className={celdaInput}
                              />
                            </td>
                            <td>
                              <select
                                value={a.estado}
                                onChange={(e) => actualizarFila(a.id, { estado: e.target.value })}
                                className={celdaInput + " font-bold text-white rounded-md"}
                                style={{ backgroundColor: colorEstadoActividad(a.estado) }}
                              >
                                {ESTADOS_ACTIVIDAD.map((e) => (
                                  <option key={e} value={e} style={{ color: "#1A1A1A", backgroundColor: "#fff" }}>
                                    {e}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  value={a.duracionMinutos}
                                  onChange={(e) => actualizarFila(a.id, { duracionMinutos: Math.max(0, Number(e.target.value) || 0) })}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  className={celdaInput + " flex-1"}
                                  title="Minutos"
                                />
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatoDuracion(a.duracionMinutos)}</span>
                              </div>
                            </td>
                            <td>
                              <textarea
                                value={a.observaciones}
                                onChange={(e) => actualizarFila(a.id, { observaciones: e.target.value })}
                                rows={1}
                                className={celdaTextarea}
                              />
                            </td>
                            <td className="text-center">
                              <button onClick={() => eliminarFila(a.id)} className="text-red-300 hover:text-red-600 text-sm px-1">
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {mensaje && <span className="text-xs text-green-600 font-semibold">{mensaje}</span>}
        {actuales.length > 0 && (
          <button onClick={vaciarMes} disabled={guardando} className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50">
            Vaciar este mes
          </button>
        )}
        <button onClick={guardar} disabled={guardando} className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50">
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
