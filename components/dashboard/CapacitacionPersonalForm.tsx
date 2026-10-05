"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { Empleado } from "@/lib/personal";
import {
  programaVacio,
  parsePrograma,
  capacitacionVacia,
  TIPOS_CAPACITACION,
  MODALIDADES_CAPACITACION,
  ESTADOS_CAPACITACION,
  MESES,
  colorEstado,
  type CapacitacionItem,
  type ProgramaCapacitacion,
} from "@/lib/capacitacionPersonal";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

export default function CapacitacionPersonalForm({ userId, empleado }: { userId: string | null; empleado: Empleado }) {
  const itemKey = `capacitacion_${empleado.id}`;
  const { docs, loading, save } = useGestionDocumentos("talento_humano", userId);

  const [programa, setPrograma] = useState<ProgramaCapacitacion>(programaVacio());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formCap, setFormCap] = useState<CapacitacionItem | null>(null);
  const [anioVista, setAnioVista] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (!loading) setPrograma(parsePrograma(docs[itemKey] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function persistir(actualizado: ProgramaCapacitacion) {
    setSaving(true);
    await save(itemKey, JSON.stringify(actualizado));
    setPrograma(actualizado);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleGuardarGeneral() {
    await persistir(programa);
  }

  function abrirNuevaCapacitacion() {
    setFormCap(capacitacionVacia());
  }

  function abrirEditar(c: CapacitacionItem) {
    setFormCap({ ...c });
  }

  async function guardarCapacitacion() {
    if (!formCap || !formCap.tema.trim()) return;
    const existe = programa.capacitaciones.some((c) => c.id === formCap.id);
    const actualizadas = existe
      ? programa.capacitaciones.map((c) => (c.id === formCap.id ? formCap : c))
      : [...programa.capacitaciones, formCap];
    await persistir({ ...programa, capacitaciones: actualizadas });
    setFormCap(null);
  }

  async function eliminarCapacitacion(id: string) {
    await persistir({ ...programa, capacitaciones: programa.capacitaciones.filter((c) => c.id !== id) });
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-6 text-center">Cargando...</p>;
  }

  const aniosDisponibles = Array.from(
    new Set(
      programa.capacitaciones
        .map((c) => (c.fechaProgramada ? new Date(c.fechaProgramada + "T00:00:00").getFullYear() : null))
        .filter((a): a is number => a !== null)
    )
  );
  if (!aniosDisponibles.includes(anioVista)) aniosDisponibles.push(anioVista);
  aniosDisponibles.sort();

  const porMes = MESES.map((_, idx) =>
    programa.capacitaciones.filter((c) => {
      if (!c.fechaProgramada) return false;
      const d = new Date(c.fechaProgramada + "T00:00:00");
      return d.getFullYear() === anioVista && d.getMonth() === idx;
    })
  );

  return (
    <div className="space-y-4">
      {/* Objetivo del programa */}
      <Seccion icono="🎯" titulo="Objetivo del Programa de Capacitación">
        <textarea
          value={programa.objetivoPrograma}
          onChange={(e) => setPrograma((p) => ({ ...p, objetivoPrograma: e.target.value }))}
          rows={3}
          className={`${inputClass} resize-y`}
        />
        <p className="text-[11px] text-gray-400 mt-2">
          Alineado a ISO 9001:2015 — numerales 7.2 Competencia y 7.3 Toma de Conciencia.
        </p>
      </Seccion>

      {/* Detección de necesidades */}
      <Seccion icono="🔎" titulo="Detección de Necesidades de Capacitación (DNC)">
        <textarea
          value={programa.deteccionNecesidades}
          onChange={(e) => setPrograma((p) => ({ ...p, deteccionNecesidades: e.target.value }))}
          placeholder="Brechas entre las competencias requeridas para el cargo (ver Manual de Funciones) y las competencias actuales del colaborador."
          rows={3}
          className={`${inputClass} resize-y`}
        />
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleGuardarGeneral}
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          {saved && <span className="text-green-600 text-xs">✓ Guardado</span>}
        </div>
      </Seccion>

      {/* Calendario visual */}
      <Seccion icono="📅" titulo="Calendario de Capacitación">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAnioVista((a) => a - 1)}
              className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm"
            >
              ‹
            </button>
            <span className="text-sm font-bold text-[#1A1A1A] w-14 text-center">{anioVista}</span>
            <button
              onClick={() => setAnioVista((a) => a + 1)}
              className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm"
            >
              ›
            </button>
          </div>
          <button
            onClick={abrirNuevaCapacitacion}
            className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410]"
          >
            + Programar capacitación
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {MESES.map((mes, idx) => (
            <div key={mes} className="bg-[#FAFAFA] rounded-xl border border-gray-100 p-3 min-h-[92px]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{mes}</p>
              <div className="space-y-1.5">
                {porMes[idx].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => abrirEditar(c)}
                    className="w-full text-left text-[11px] font-semibold text-white rounded-md px-2 py-1 truncate"
                    style={{ backgroundColor: colorEstado(c.estado) }}
                    title={c.tema}
                  >
                    {c.tema}
                  </button>
                ))}
                {porMes[idx].length === 0 && <p className="text-[11px] text-gray-300">—</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 flex-wrap mt-4 text-[11px] text-gray-500">
          {ESTADOS_CAPACITACION.map((e) => (
            <span key={e} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorEstado(e) }} />
              {e}
            </span>
          ))}
        </div>
      </Seccion>

      {/* Registro y evaluación de eficacia */}
      <Seccion icono="📋" titulo="Registro y Evaluación de Eficacia">
        {programa.capacitaciones.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            Todavía no programaste ninguna capacitación para {empleado.nombre}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[720px] border-collapse">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="p-2 font-semibold border-b border-gray-100">Tema</th>
                  <th className="p-2 font-semibold border-b border-gray-100">Tipo</th>
                  <th className="p-2 font-semibold border-b border-gray-100">Fecha</th>
                  <th className="p-2 font-semibold border-b border-gray-100">Duración</th>
                  <th className="p-2 font-semibold border-b border-gray-100">Estado</th>
                  <th className="p-2 font-semibold border-b border-gray-100">Eficacia</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {[...programa.capacitaciones]
                  .sort((a, b) => (a.fechaProgramada || "").localeCompare(b.fechaProgramada || ""))
                  .map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 align-top">
                      <td className="p-2 font-semibold text-[#1A1A1A]">{c.tema}</td>
                      <td className="p-2 text-gray-600">{c.tipo || "—"}</td>
                      <td className="p-2 text-gray-600 whitespace-nowrap">
                        {c.fechaProgramada ? new Date(c.fechaProgramada + "T00:00:00").toLocaleDateString("es") : "—"}
                      </td>
                      <td className="p-2 text-gray-600 whitespace-nowrap">{c.duracionHoras ? `${c.duracionHoras} h` : "—"}</td>
                      <td className="p-2">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: colorEstado(c.estado) }}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="p-2 text-gray-600 max-w-[200px]">
                        {c.evaluacionEficacia || c.calificacion ? (
                          <>
                            {c.calificacion && <span className="font-semibold text-[#1A1A1A]">{c.calificacion}</span>}
                            {c.calificacion && c.evaluacionEficacia && " · "}
                            <span className="line-clamp-2">{c.evaluacionEficacia}</span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-2 text-right whitespace-nowrap">
                        <button onClick={() => abrirEditar(c)} className="text-[#F5A623] font-semibold hover:text-[#e09410] mr-2">
                          ✎
                        </button>
                        <button onClick={() => eliminarCapacitacion(c.id)} className="text-gray-300 hover:text-red-500">
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      {/* Modal de alta/edición */}
      {formCap && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setFormCap(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-8 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              {programa.capacitaciones.some((c) => c.id === formCap.id) ? "Editar capacitación" : "Programar capacitación"}
            </h2>

            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Tema</label>
              <input value={formCap.tema} onChange={(e) => setFormCap((f) => f && { ...f, tema: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Objetivo de la capacitación</label>
              <textarea value={formCap.objetivo} onChange={(e) => setFormCap((f) => f && { ...f, objetivo: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tipo</label>
                <select value={formCap.tipo} onChange={(e) => setFormCap((f) => f && { ...f, tipo: e.target.value })} className={inputClass}>
                  <option value="">Seleccioná</option>
                  {TIPOS_CAPACITACION.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Modalidad</label>
                <select value={formCap.modalidad} onChange={(e) => setFormCap((f) => f && { ...f, modalidad: e.target.value })} className={inputClass}>
                  <option value="">Seleccioná</option>
                  {MODALIDADES_CAPACITACION.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Responsable / Instructor</label>
                <input value={formCap.responsable} onChange={(e) => setFormCap((f) => f && { ...f, responsable: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Duración (horas)</label>
                <input value={formCap.duracionHoras} onChange={(e) => setFormCap((f) => f && { ...f, duracionHoras: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fecha programada</label>
                <input type="date" value={formCap.fechaProgramada} onChange={(e) => setFormCap((f) => f && { ...f, fechaProgramada: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <select value={formCap.estado} onChange={(e) => setFormCap((f) => f && { ...f, estado: e.target.value })} className={inputClass}>
                  {ESTADOS_CAPACITACION.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-gray-600 mb-2">Evaluación de eficacia (ISO 9001, 7.2 d)</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={labelClass}>Calificación / resultado</label>
                  <input
                    value={formCap.calificacion}
                    onChange={(e) => setFormCap((f) => f && { ...f, calificacion: e.target.value })}
                    placeholder="Ej: Apto / 9/10"
                    className={inputClass}
                  />
                </div>
              </div>
              <label className={labelClass}>¿Cómo se evaluó la eficacia?</label>
              <textarea
                value={formCap.evaluacionEficacia}
                onChange={(e) => setFormCap((f) => f && { ...f, evaluacionEficacia: e.target.value })}
                placeholder="Ej: Evaluación escrita, observación en el puesto, indicador de desempeño posterior a la capacitación."
                rows={2}
                className={`${inputClass} resize-y`}
              />
            </div>

            <div>
              <label className={labelClass}>Observaciones</label>
              <textarea value={formCap.observaciones} onChange={(e) => setFormCap((f) => f && { ...f, observaciones: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-3">
                <button
                  onClick={guardarCapacitacion}
                  disabled={saving}
                  className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button onClick={() => setFormCap(null)} className="text-sm text-gray-400 hover:text-gray-600">
                  Cancelar
                </button>
              </div>
              {programa.capacitaciones.some((c) => c.id === formCap.id) && (
                <button
                  onClick={() => {
                    eliminarCapacitacion(formCap.id);
                    setFormCap(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
