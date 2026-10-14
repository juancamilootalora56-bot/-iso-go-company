"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import { parseProyectosDiseno, type ProyectoDiseno } from "@/lib/disenoDesarrollo";
import {
  parseCambiosDiseno,
  cambioDisenoVacio,
  eventoCDVacio,
  siguienteRadicadoCD,
  numeroDeRadicadoCD,
  colorEstadoCambioDiseno,
  cambioDisenoAbierto,
  MOTIVOS_CAMBIO_DISENO,
  ESTADOS_CAMBIO_DISENO,
  type CambioDiseno,
  type EventoCD,
} from "@/lib/cambiosDiseno";

const ITEM_KEY_PROYECTOS = "proyectos_diseno_lista";
const ITEM_KEY_CAMBIOS = "cambios_diseno_lista";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function fechaCorta(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function fechaHoraLegible(iso: string) {
  try {
    return new Date(iso).toLocaleString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function CambiosDisenoForm({ userId, proyectoFijo }: { userId: string | null; proyectoFijo?: ProyectoDiseno }) {
  const { docs, loading, save } = useGestionDocumentos("diseno_desarrollo", userId);

  const [cambios, setCambios] = useState<CambioDiseno[]>([]);
  const [cambio, setCambio] = useState<CambioDiseno>(cambioDisenoVacio("CD-0001", proyectoFijo?.id ?? "", proyectoFijo?.nombre ?? ""));
  const [notaNueva, setNotaNueva] = useState("");
  const [autorNota, setAutorNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");

  useEffect(() => {
    if (!loading) {
      const cargados = parseCambiosDiseno(docs[ITEM_KEY_CAMBIOS] ?? "");
      setCambios(cargados);
      setCambio(
        cambioDisenoVacio(
          siguienteRadicadoCD(cargados.map((c) => numeroDeRadicadoCD(c.radicado))),
          proyectoFijo?.id ?? "",
          proyectoFijo?.nombre ?? ""
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const proyectos = parseProyectosDiseno(docs[ITEM_KEY_PROYECTOS] ?? "");
  const cambiosDelProyecto = proyectoFijo ? cambios.filter((c) => c.proyectoId === proyectoFijo.id) : cambios;
  const listados = filtroEstado ? cambiosDelProyecto.filter((c) => c.estado === filtroEstado) : cambiosDelProyecto;
  const editando = cambios.some((c) => c.id === cambio.id);
  const abiertos = cambiosDelProyecto.filter((c) => cambioDisenoAbierto(c.estado)).length;

  function campo<K extends keyof CambioDiseno>(key: K, value: CambioDiseno[K]) {
    setCambio((c) => ({ ...c, [key]: value }));
  }

  function limpiar() {
    setCambio(cambioDisenoVacio(siguienteRadicadoCD(cambios.map((c) => numeroDeRadicadoCD(c.radicado))), proyectoFijo?.id ?? "", proyectoFijo?.nombre ?? ""));
    setError(null);
  }

  function editar(c: CambioDiseno) {
    setCambio({ ...c, bitacora: c.bitacora.map((b) => ({ ...b })) });
    setError(null);
  }

  function agregarNota() {
    if (!notaNueva.trim()) return;
    setCambio((c) => ({ ...c, bitacora: [...c.bitacora, eventoCDVacio(notaNueva.trim(), autorNota.trim() || "Sin especificar")] }));
    setNotaNueva("");
  }

  function quitarNota(id: string) {
    setCambio((c) => ({ ...c, bitacora: c.bitacora.filter((b) => b.id !== id) }));
  }

  async function guardar() {
    if (!cambio.descripcionCambio.trim()) {
      setError("Describí el cambio solicitado.");
      return;
    }
    if (!proyectoFijo && !cambio.proyectoId) {
      setError("Seleccioná el proyecto de diseño afectado.");
      return;
    }
    setError(null);
    setSaving(true);
    const actualizados = [...cambios.filter((c) => c.id !== cambio.id), cambio];
    await save(ITEM_KEY_CAMBIOS, JSON.stringify(actualizados));
    setCambios(actualizados);
    limpiar();
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    setSaving(true);
    const restantes = cambios.filter((c) => c.id !== id);
    await save(ITEM_KEY_CAMBIOS, JSON.stringify(restantes));
    setCambios(restantes);
    if (cambio.id === id) limpiar();
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🔧</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{cambiosDelProyecto.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Cambios registrados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🟡</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{abiertos}</p>
          <p className="text-xs text-gray-500 mt-0.5">En curso</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">✅</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{cambiosDelProyecto.filter((c) => c.estado === "Implementado").length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Implementados</p>
        </div>
      </div>

      <Seccion icono="🔧" titulo={editando ? `Editando ${cambio.radicado}` : `Nueva solicitud de cambio · ${cambio.radicado}`}>
        <div className="space-y-4">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Cambio guardado</div>}

          {!proyectoFijo && (
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Proyecto de diseño afectado</label>
              <select
                value={cambio.proyectoId}
                onChange={(e) => {
                  const p = proyectos.find((x) => x.id === e.target.value);
                  setCambio((c) => ({ ...c, proyectoId: e.target.value, proyectoNombre: p?.nombre ?? "" }));
                }}
                className={inputClass}
              >
                <option value="">Seleccioná un proyecto</option>
                {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Fecha de solicitud</label>
              <input type="date" value={cambio.fechaSolicitud} onChange={(e) => campo("fechaSolicitud", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Solicitado por</label>
              <input value={cambio.solicitadoPor} onChange={(e) => campo("solicitadoPor", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}><span className="text-red-500">*</span> Descripción del cambio</label>
            <textarea value={cambio.descripcionCambio} onChange={(e) => campo("descripcionCambio", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div>
            <label className={labelClass}>Motivo del cambio</label>
            <select value={cambio.motivoCambio} onChange={(e) => campo("motivoCambio", e.target.value)} className={inputClass}>
              {MOTIVOS_CAMBIO_DISENO.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Evaluación del impacto en las salidas ya entregadas</label>
            <textarea value={cambio.evaluacionImpacto} onChange={(e) => campo("evaluacionImpacto", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" checked={cambio.impactoEnEntregasCliente} onChange={(e) => campo("impactoEnEntregasCliente", e.target.checked)} className="accent-[#F5A623]" />
              Impacta entregas ya realizadas al cliente
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" checked={cambio.impactoEnPartesInteresadas} onChange={(e) => campo("impactoEnPartesInteresadas", e.target.checked)} className="accent-[#F5A623]" />
              Impacta a otras partes interesadas
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Responsable de aprobación</label>
              <input value={cambio.responsableAprobacion} onChange={(e) => campo("responsableAprobacion", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha de aprobación</label>
              <input type="date" value={cambio.fechaAprobacion} onChange={(e) => campo("fechaAprobacion", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Estado</label>
              <select value={cambio.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                {ESTADOS_CAMBIO_DISENO.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fecha de cierre</label>
              <input type="date" value={cambio.fechaCierre} onChange={(e) => campo("fechaCierre", e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Bitácora */}
          <div>
            <div className="flex items-center gap-2 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-wide px-3 py-2 rounded-lg mb-3">
              <span>🧭</span> Bitácora de Seguimiento
            </div>
            {cambio.bitacora.length > 0 ? (
              <div className="space-y-0 mb-3 border-l-2 border-gray-100 ml-1.5 pl-4">
                {[...cambio.bitacora].reverse().map((b: EventoCD) => (
                  <div key={b.id} className="relative pb-4 last:pb-0">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
                    <p className="text-sm text-[#1A1A1A]">{b.nota}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                      {fechaHoraLegible(b.fecha)} · {b.autor}
                      <button type="button" onClick={() => quitarNota(b.id)} className="text-gray-300 hover:text-red-500">✕</button>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-3">Todavía no hay entradas en la bitácora.</p>
            )}
            <div className="grid sm:grid-cols-[1fr_auto] gap-2">
              <input value={notaNueva} onChange={(e) => setNotaNueva(e.target.value)} placeholder="Nueva entrada de seguimiento..." className={inputClass} />
              <div className="flex gap-2">
                <input value={autorNota} onChange={(e) => setAutorNota(e.target.value)} placeholder="Autor" className={`${inputClass} sm:w-32`} />
                <button type="button" onClick={agregarNota} className="flex-shrink-0 bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#e09410] whitespace-nowrap">
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea value={cambio.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button onClick={guardar} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
              {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar solicitud"}
            </button>
            <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
              {editando ? "Nueva solicitud en blanco" : "Limpiar"}
            </button>
          </div>
        </div>
      </Seccion>

      <Seccion icono="🗂️" titulo="Registro de Cambios">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFiltroEstado("")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroEstado === "" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-gray-200 text-gray-500"}`}
          >
            Todos los estados
          </button>
          {ESTADOS_CAMBIO_DISENO.map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(filtroEstado === e ? "" : e)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroEstado === e ? "text-white border-transparent" : "border-gray-200 text-gray-500"}`}
              style={filtroEstado === e ? { backgroundColor: colorEstadoCambioDiseno(e) } : {}}
            >
              {e}
            </button>
          ))}
        </div>

        {listados.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No hay cambios que coincidan con el filtro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2.5 font-semibold border-b border-gray-100">Radicado</th>
                  {!proyectoFijo && <th className="p-2.5 font-semibold border-b border-gray-100">Proyecto</th>}
                  <th className="p-2.5 font-semibold border-b border-gray-100">Motivo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Estado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Solicitud</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody>
                {listados.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                    <td className="p-2.5 font-mono font-semibold text-[#1A1A1A] whitespace-nowrap">{c.radicado}</td>
                    {!proyectoFijo && <td className="p-2.5 text-gray-600 max-w-[180px] truncate">{c.proyectoNombre}</td>}
                    <td className="p-2.5 text-gray-600 max-w-[180px] truncate">{c.motivoCambio}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoCambioDiseno(c.estado) }}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(c.fechaSolicitud)}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <button onClick={() => editar(c)} className="text-[#F5A623] font-semibold hover:text-[#e09410] mr-2">Editar</button>
                      <button onClick={() => eliminar(c.id)} className="text-gray-300 hover:text-red-500">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>
    </div>
  );
}
