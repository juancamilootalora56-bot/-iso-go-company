"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parsePersonal, personasVisiblesEquipo, type Empleado } from "@/lib/personal";
import {
  type EventoCalendario,
  TIPOS_EVENTO,
  colorTipoEvento,
  eventoVacio,
  parseEventos,
  itemKeyCalendario,
  mesActual,
  nombreMes,
  mesAnterior,
  mesSiguiente,
  diasGrilla,
  DIAS_SEMANA,
} from "@/lib/calendarioPersonal";

const ITEM_KEY_PERSONAL = "personal_lista";
const SIN_PROCESO = "Sin proceso asignado";

const PALETA_PERSONAS = ["#4F46E5", "#F5A623", "#0EA5A4", "#EC4899", "#3B82F6", "#8B5CF6", "#10B981", "#EF4444"];

function inicial(p: Empleado) {
  return (p.nombre?.[0] ?? "").toUpperCase() + (p.apellido?.[0] ?? "").toUpperCase();
}

export default function CalendarioPersonalPage() {
  const { user, colaborador } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading, save } = useGestionDocumentos("talento_humano", user?.id ?? null);

  const [mes, setMes] = useState(mesActual());
  const [seleccionados, setSeleccionados] = useState<Set<string> | null>(null);
  const [diaAbierto, setDiaAbierto] = useState<string | null>(null);
  const [modal, setModal] = useState<{ personaId: string; evento: EventoCalendario } | null>(null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const personal = parsePersonal(docs[ITEM_KEY_PERSONAL] ?? "");
  const esOwner = !colaborador;
  const empleadoPropioId = colaborador?.empleadoId ?? null;
  const propio = empleadoPropioId ? personal.find((p) => p.id === empleadoPropioId) ?? null : null;
  const esJefe = !esOwner && !!propio?.esJefeProceso && !!propio?.proceso;
  const personasVisibles = personasVisiblesEquipo(personal, empleadoPropioId, esOwner);

  const idsEditables = new Set(esOwner ? personasVisibles.map((p) => p.id) : propio ? [propio.id] : []);

  const seleccionActiva = seleccionados ?? new Set(personasVisibles.map((p) => p.id));
  const mostrarRoster = personasVisibles.length > 1;

  const colorPorPersona: Record<string, string> = {};
  personasVisibles.forEach((p, i) => {
    colorPorPersona[p.id] = PALETA_PERSONAS[i % PALETA_PERSONAS.length];
  });

  const grupos: Record<string, Empleado[]> = {};
  for (const p of personasVisibles) {
    const key = (p.proceso ?? "").trim() || SIN_PROCESO;
    (grupos[key] ??= []).push(p);
  }
  const nombresGrupos = Object.keys(grupos).sort((a, b) => (a === SIN_PROCESO ? 1 : b === SIN_PROCESO ? -1 : a.localeCompare(b)));

  // Eventos del mes visible, de las personas seleccionadas.
  const eventosPorFecha: Record<string, { personaId: string; evento: EventoCalendario }[]> = {};
  personasVisibles
    .filter((p) => seleccionActiva.has(p.id))
    .forEach((p) => {
      const eventos = parseEventos(docs[itemKeyCalendario(p.id, mes)] ?? "");
      eventos.forEach((evento) => {
        (eventosPorFecha[evento.fecha] ??= []).push({ personaId: p.id, evento });
      });
    });

  const dias = diasGrilla(mes);
  const hoy = new Date().toISOString().slice(0, 10);

  function toggleSeleccion(id: string) {
    const nuevo = new Set(seleccionActiva);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    setSeleccionados(nuevo);
  }

  function personaDefectoPara(fecha: string): string | null {
    if (propio && idsEditables.has(propio.id)) return propio.id;
    const primeraEditable = personasVisibles.find((p) => idsEditables.has(p.id));
    return primeraEditable?.id ?? null;
  }

  function abrirNuevo(fecha: string) {
    const personaId = personaDefectoPara(fecha);
    if (!personaId) return;
    setModal({ personaId, evento: eventoVacio(fecha) });
  }

  function abrirEvento(personaId: string, evento: EventoCalendario) {
    setModal({ personaId, evento });
  }

  async function guardarEvento() {
    if (!modal) return;
    const { personaId, evento } = modal;
    const mesEvento = evento.fecha.slice(0, 7);
    const itemKey = itemKeyCalendario(personaId, mesEvento);
    const actuales = parseEventos(docs[itemKey] ?? "");
    const actualizados = [...actuales.filter((e) => e.id !== evento.id), evento];
    await save(itemKey, JSON.stringify(actualizados));
    setModal(null);
  }

  async function eliminarEvento() {
    if (!modal) return;
    const { personaId, evento } = modal;
    const mesEvento = evento.fecha.slice(0, 7);
    const itemKey = itemKeyCalendario(personaId, mesEvento);
    const actuales = parseEventos(docs[itemKey] ?? "");
    await save(itemKey, JSON.stringify(actuales.filter((e) => e.id !== evento.id)));
    setModal(null);
  }

  const puedeEditarModal = !!modal && idsEditables.has(modal.personaId);
  const eventoExiste = !!modal && parseEventos(docs[itemKeyCalendario(modal.personaId, modal.evento.fecha.slice(0, 7))] ?? "").some((e) => e.id === modal.evento.id);

  const inputClass =
    "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión del Talento Humano
      </Link>

      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 overflow-hidden mb-6">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#F5A623" }}>
              {esOwner ? "Vista general" : esJefe ? `Jefe de ${propio!.proceso}` : "Mi calendario"}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Calendario de Colaboradores</h1>
            <p className="text-gray-400 text-sm mt-1">Planificación personal, organizada por proceso.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-1.5 py-1.5">
            <button onClick={() => setMes(mesAnterior(mes))} className="text-gray-300 hover:text-white px-2 py-1 text-sm">‹</button>
            <span className="text-white text-sm font-semibold capitalize min-w-[140px] text-center">{nombreMes(mes)}</span>
            <button onClick={() => setMes(mesSiguiente(mes))} className="text-gray-300 hover:text-white px-2 py-1 text-sm">›</button>
            <button onClick={() => setMes(mesActual())} className="text-[11px] font-bold text-[#F5A623] hover:text-[#e09410] px-2 ml-1">
              Hoy
            </button>
          </div>
        </div>
      </div>

      {personasVisibles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm">
            Tu cuenta todavía no está vinculada a una ficha de personal — pedile al administrador que te asigne una en Alta de Personal.
          </p>
        </div>
      ) : (
        <div className="flex gap-4 items-start">
          {/* Roster por proceso */}
          {mostrarRoster && (
            <div className="w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Calendarios</p>
              {nombresGrupos.map((grupo) => (
                <div key={grupo}>
                  <p className="text-[11px] font-semibold text-gray-500 mb-1.5">{grupo}</p>
                  <div className="space-y-1">
                    {grupos[grupo].map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer group py-0.5">
                        <input
                          type="checkbox"
                          checked={seleccionActiva.has(p.id)}
                          onChange={() => toggleSeleccion(p.id)}
                          className="w-3.5 h-3.5 rounded accent-current flex-shrink-0"
                          style={{ accentColor: colorPorPersona[p.id] }}
                        />
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: colorPorPersona[p.id] }}
                        >
                          {inicial(p)}
                        </span>
                        <span className="text-xs text-gray-600 truncate group-hover:text-[#1A1A1A]">
                          {p.nombre} {p.apellido}
                          {p.id === propio?.id && " (yo)"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grilla mensual */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden min-w-0">
            <div className="grid grid-cols-7 bg-[#FAFAFA] border-b border-gray-100">
              {DIAS_SEMANA.map((d) => (
                <div key={d} className="text-center text-[11px] font-bold text-gray-400 uppercase py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {dias.map(({ fecha, enMes }) => {
                const eventosDia = eventosPorFecha[fecha] ?? [];
                const esHoy = fecha === hoy;
                return (
                  <div
                    key={fecha}
                    onClick={() => setDiaAbierto(fecha)}
                    className={`min-h-[92px] border-b border-r border-gray-100 p-1.5 cursor-pointer hover:bg-[#FAFAFA] transition-colors ${
                      enMes ? "" : "bg-gray-50/50"
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold inline-flex items-center justify-center w-5 h-5 rounded-full ${
                        esHoy ? "bg-[#F5A623] text-white" : enMes ? "text-[#1A1A1A]" : "text-gray-300"
                      }`}
                    >
                      {Number(fecha.slice(8, 10))}
                    </span>
                    <div className="mt-1 space-y-1">
                      {eventosDia.slice(0, 3).map(({ personaId, evento }) => (
                        <button
                          key={evento.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirEvento(personaId, evento);
                          }}
                          className="w-full text-left text-[10px] font-semibold text-white rounded px-1 py-0.5 truncate block"
                          style={{ backgroundColor: mostrarRoster ? colorPorPersona[personaId] : colorTipoEvento(evento.tipo) }}
                          title={`${evento.horaInicio} ${evento.titulo}`}
                        >
                          {evento.horaInicio} {evento.titulo || evento.tipo}
                        </button>
                      ))}
                      {eventosDia.length > 3 && (
                        <p className="text-[10px] text-gray-400 font-semibold px-1">+{eventosDia.length - 3} más</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Panel del día seleccionado */}
      {diaAbierto && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-start justify-center p-4 pt-10 overflow-y-auto" onClick={() => setDiaAbierto(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-md my-8 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1A1A1A] capitalize">
                {new Date(diaAbierto + "T00:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
              </h2>
              <button onClick={() => setDiaAbierto(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(eventosPorFecha[diaAbierto] ?? []).length === 0 && (
                <p className="text-xs text-gray-400 py-2">Sin eventos este día.</p>
              )}
              {(eventosPorFecha[diaAbierto] ?? []).map(({ personaId, evento }) => {
                const persona = personasVisibles.find((p) => p.id === personaId);
                return (
                  <button
                    key={evento.id}
                    onClick={() => abrirEvento(personaId, evento)}
                    className="w-full text-left flex items-center gap-2 bg-[#FAFAFA] rounded-lg p-2.5 hover:bg-gray-100 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colorTipoEvento(evento.tipo) }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1A1A1A] truncate">
                        {evento.horaInicio}–{evento.horaFin} · {evento.titulo || "(sin título)"}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {evento.tipo}
                        {mostrarRoster && persona && ` · ${persona.nombre} ${persona.apellido}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {personaDefectoPara(diaAbierto) && (
              <button
                onClick={() => {
                  abrirNuevo(diaAbierto);
                  setDiaAbierto(null);
                }}
                className="w-full text-sm font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2 rounded-lg"
              >
                + Agregar evento
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de evento */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md my-8 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              {eventoExiste ? "Editar evento" : "Nuevo evento"}
              {!puedeEditarModal && <span className="ml-2 text-[11px] font-semibold text-gray-400">(solo lectura)</span>}
            </h2>

            <fieldset disabled={!puedeEditarModal} className="space-y-3 border-0 p-0 m-0">
              {esOwner && personasVisibles.length > 1 && (
                <div>
                  <label className={labelClass}>Colaborador</label>
                  <select
                    value={modal.personaId}
                    onChange={(e) => setModal((m) => m && { ...m, personaId: e.target.value })}
                    className={inputClass}
                  >
                    {personasVisibles.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={labelClass}>Título</label>
                <input
                  value={modal.evento.titulo}
                  onChange={(e) => setModal((m) => m && { ...m, evento: { ...m.evento, titulo: e.target.value } })}
                  className={inputClass}
                  placeholder="Ej: Reunión con proveedor"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Fecha</label>
                  <input
                    type="date"
                    value={modal.evento.fecha}
                    onChange={(e) => setModal((m) => m && { ...m, evento: { ...m.evento, fecha: e.target.value } })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tipo</label>
                  <select
                    value={modal.evento.tipo}
                    onChange={(e) => setModal((m) => m && { ...m, evento: { ...m.evento, tipo: e.target.value } })}
                    className={inputClass}
                  >
                    {TIPOS_EVENTO.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Hora inicio</label>
                  <input
                    type="time"
                    value={modal.evento.horaInicio}
                    onChange={(e) => setModal((m) => m && { ...m, evento: { ...m.evento, horaInicio: e.target.value } })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Hora fin</label>
                  <input
                    type="time"
                    value={modal.evento.horaFin}
                    onChange={(e) => setModal((m) => m && { ...m, evento: { ...m.evento, horaFin: e.target.value } })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Descripción</label>
                <textarea
                  value={modal.evento.descripcion}
                  onChange={(e) => setModal((m) => m && { ...m, evento: { ...m.evento, descripcion: e.target.value } })}
                  rows={2}
                  className={`${inputClass} resize-y`}
                />
              </div>
            </fieldset>

            <div className="flex items-center gap-2 pt-1">
              {puedeEditarModal && (
                <button
                  onClick={guardarEvento}
                  className="flex-1 text-sm font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
              )}
              {puedeEditarModal && eventoExiste && (
                <button onClick={eliminarEvento} className="text-sm text-gray-400 hover:text-red-500 px-3 py-2">
                  Eliminar
                </button>
              )}
              <button onClick={() => setModal(null)} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100 ml-auto">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
