"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { Proveedor } from "@/lib/proveedores";
import {
  parseEvaluacionesProveedor,
  evaluacionProveedorVacia,
  criterioProveedorVacio,
  promedioEvaluacionProveedor,
  resultadoEvaluacionProveedor,
  colorResultadoProveedor,
  TIPOS_EVALUACION_PROVEEDOR,
  type EvaluacionProveedor,
} from "@/lib/evaluacionProveedor";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function SubHeader({ icono, titulo }: { icono: string; titulo: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-wide px-3 py-2 rounded-lg mb-3">
      <span>{icono}</span>
      {titulo}
    </div>
  );
}

function fechaLegible(iso?: string) {
  if (!iso) return undefined;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function EstrellasCalificacion({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-lg leading-none ${n <= valor ? "text-[#F5A623]" : "text-gray-200"}`}
        >
          ★
        </button>
      ))}
      {valor > 0 && <span className="text-xs text-gray-400 ml-1">{valor}/5</span>}
    </div>
  );
}

export default function EvaluacionProveedorForm({ userId, proveedor }: { userId: string | null; proveedor: Proveedor }) {
  const itemKey = `evaluacion_proveedor_${proveedor.id}`;
  const { docs, loading, save } = useGestionDocumentos("compras", userId);

  const [evaluaciones, setEvaluaciones] = useState<EvaluacionProveedor[]>([]);
  const [formEval, setFormEval] = useState<EvaluacionProveedor | null>(null);
  const [viendoEval, setViendoEval] = useState<EvaluacionProveedor | null>(null);
  const [nombreCriterioNuevo, setNombreCriterioNuevo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) setEvaluaciones(parseEvaluacionesProveedor(docs[itemKey] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function persistir(actualizadas: EvaluacionProveedor[]) {
    setSaving(true);
    await save(itemKey, JSON.stringify(actualizadas));
    setEvaluaciones(actualizadas);
    setSaving(false);
  }

  function abrirNueva() {
    setError(null);
    setViendoEval(null);
    setFormEval(evaluacionProveedorVacia());
  }

  function abrirEditar(e: EvaluacionProveedor) {
    setError(null);
    setViendoEval(null);
    setFormEval({ ...e, criterios: e.criterios.map((c) => ({ ...c })) });
  }

  function abrirInforme(e: EvaluacionProveedor) {
    setFormEval(null);
    setViendoEval(e);
  }

  function setCriterio(id: string, campo: "calificacion" | "comentario", valor: number | string) {
    setFormEval((f) => (f ? { ...f, criterios: f.criterios.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)) } : f));
  }

  function agregarCriterioLibre() {
    if (!nombreCriterioNuevo.trim()) return;
    setFormEval((f) => (f ? { ...f, criterios: [...f.criterios, criterioProveedorVacio(nombreCriterioNuevo.trim(), true)] } : f));
    setNombreCriterioNuevo("");
  }

  function quitarCriterio(id: string) {
    setFormEval((f) => (f ? { ...f, criterios: f.criterios.filter((c) => c.id !== id) } : f));
  }

  async function guardarEvaluacion() {
    if (!formEval) return;
    if (!formEval.periodoInicio || !formEval.periodoFin) {
      setError("El período evaluado (inicio y fin) es obligatorio.");
      return;
    }
    setError(null);
    const existe = evaluaciones.some((e) => e.id === formEval.id);
    const actualizadas = existe
      ? evaluaciones.map((e) => (e.id === formEval.id ? formEval : e))
      : [...evaluaciones, formEval];
    await persistir(actualizadas);
    setFormEval(null);
  }

  async function eliminarEvaluacion(id: string) {
    await persistir(evaluaciones.filter((e) => e.id !== id));
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-6 text-center">Cargando...</p>;
  }

  const evaluacionesOrdenadas = [...evaluaciones].sort((a, b) => (b.periodoFin || "").localeCompare(a.periodoFin || ""));

  return (
    <div className="space-y-4">
      <Seccion icono="📊" titulo="Evaluación de Proveedor">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            Historial de evaluaciones de {proveedor.razonSocial}, por período.
          </p>
          <button onClick={abrirNueva} className="flex-shrink-0 text-xs font-semibold text-[#F5A623] hover:text-[#e09410] whitespace-nowrap ml-4">
            + Nueva evaluación
          </button>
        </div>

        {evaluacionesOrdenadas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no se registró ninguna evaluación.</p>
        ) : (
          <div className="space-y-2.5">
            {evaluacionesOrdenadas.map((e) => {
              const promedio = promedioEvaluacionProveedor(e);
              const resultado = resultadoEvaluacionProveedor(promedio);
              return (
                <button
                  key={e.id}
                  onClick={() => abrirInforme(e)}
                  className="w-full text-left bg-[#FAFAFA] rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {fechaLegible(e.periodoInicio)} — {fechaLegible(e.periodoFin)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {e.tipoEvaluacion}
                        {e.evaluador && <> · {e.evaluador}</>}
                      </p>
                    </div>
                    <span
                      className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                      style={{ backgroundColor: colorResultadoProveedor(resultado) }}
                    >
                      {resultado} {promedio > 0 && `· ${promedio.toFixed(1)}/5`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Seccion>

      {/* Informe de lectura */}
      {viendoEval && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-[#1A1A1A] p-6 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <span className="inline-block bg-[#F5A623] text-[#1A1A1A] text-[10px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
                  Informe de Evaluación de Proveedor
                </span>
                <h2 className="text-white text-xl font-extrabold">
                  {fechaLegible(viendoEval.periodoInicio)} — {fechaLegible(viendoEval.periodoFin)}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {viendoEval.tipoEvaluacion}
                  {viendoEval.evaluador && <> · Evaluado por {viendoEval.evaluador}</>}
                </p>
              </div>
              <span
                className="flex-shrink-0 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full text-white whitespace-nowrap"
                style={{ backgroundColor: colorResultadoProveedor(resultadoEvaluacionProveedor(promedioEvaluacionProveedor(viendoEval))) }}
              >
                {resultadoEvaluacionProveedor(promedioEvaluacionProveedor(viendoEval))} · {promedioEvaluacionProveedor(viendoEval).toFixed(1)}/5
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Criterios evaluados</h3>
              <div className="space-y-2">
                {viendoEval.criterios.map((c) => (
                  <div key={c.id} className="bg-[#FAFAFA] rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {c.nombre}
                        {c.personalizado && <span className="text-[10px] text-[#F5A623] font-bold ml-1.5">· personalizado</span>}
                      </p>
                      <span className="text-sm font-bold text-[#F5A623] flex-shrink-0">
                        {"★".repeat(c.calificacion)}
                        {"☆".repeat(5 - c.calificacion)}
                      </span>
                    </div>
                    {c.comentario && <p className="text-xs text-gray-500 mt-1">{c.comentario}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-1 gap-3">
              {viendoEval.fortalezas && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Fortalezas</p>
                  <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendoEval.fortalezas}</p>
                </div>
              )}
              {viendoEval.areasMejora && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Áreas de mejora</p>
                  <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendoEval.areasMejora}</p>
                </div>
              )}
              {viendoEval.planAccion && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Plan de acción</p>
                  <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendoEval.planAccion}</p>
                </div>
              )}
              {viendoEval.observaciones && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Observaciones</p>
                  <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendoEval.observaciones}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <button onClick={() => abrirEditar(viendoEval)} className="text-sm font-semibold text-[#F5A623] hover:text-[#e09410]">
              ✎ Editar evaluación
            </button>
            <button onClick={() => setViendoEval(null)} className="text-sm text-gray-400 hover:text-gray-600">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Formulario de alta/edición */}
      {formEval && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" onClick={() => setFormEval(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl my-8 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              {evaluaciones.some((e) => e.id === formEval.id) ? "Editar evaluación" : "Nueva evaluación de proveedor"}
            </h2>

            {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}

            <div>
              <SubHeader icono="🗓️" titulo="Datos de la evaluación" />
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}><span className="text-red-500">*</span> Período desde</label>
                  <input type="date" value={formEval.periodoInicio} onChange={(e) => setFormEval((f) => f && { ...f, periodoInicio: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><span className="text-red-500">*</span> Período hasta</label>
                  <input type="date" value={formEval.periodoFin} onChange={(e) => setFormEval((f) => f && { ...f, periodoFin: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha de evaluación</label>
                  <input type="date" value={formEval.fechaEvaluacion} onChange={(e) => setFormEval((f) => f && { ...f, fechaEvaluacion: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tipo de evaluación</label>
                  <select value={formEval.tipoEvaluacion} onChange={(e) => setFormEval((f) => f && { ...f, tipoEvaluacion: e.target.value })} className={inputClass}>
                    {TIPOS_EVALUACION_PROVEEDOR.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Evaluador</label>
                  <input value={formEval.evaluador} onChange={(e) => setFormEval((f) => f && { ...f, evaluador: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <SubHeader icono="⭐" titulo="Criterios universales" />
              <div className="space-y-3">
                {formEval.criterios.filter((c) => !c.personalizado).map((c) => (
                  <div key={c.id} className="bg-[#FAFAFA] rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{c.nombre}</p>
                      <EstrellasCalificacion valor={c.calificacion} onChange={(v) => setCriterio(c.id, "calificacion", v)} />
                    </div>
                    <input
                      value={c.comentario}
                      onChange={(e) => setCriterio(c.id, "comentario", e.target.value)}
                      placeholder="Comentario (opcional)"
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SubHeader icono="➕" titulo="Criterios adicionales (sección libre)" />
              <p className="text-[11px] text-gray-500 mb-3">
                Agregá los criterios propios de tu empresa o del rubro (ej: &quot;Capacidad de producción&quot;, &quot;Soporte técnico&quot;).
              </p>
              {formEval.criterios.filter((c) => c.personalizado).length > 0 && (
                <div className="space-y-3 mb-3">
                  {formEval.criterios.filter((c) => c.personalizado).map((c) => (
                    <div key={c.id} className="bg-[#F5A623]/5 border border-[#F5A623]/20 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <p className="text-sm font-semibold text-[#1A1A1A]">{c.nombre}</p>
                        <div className="flex items-center gap-2">
                          <EstrellasCalificacion valor={c.calificacion} onChange={(v) => setCriterio(c.id, "calificacion", v)} />
                          <button onClick={() => quitarCriterio(c.id)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
                        </div>
                      </div>
                      <input
                        value={c.comentario}
                        onChange={(e) => setCriterio(c.id, "comentario", e.target.value)}
                        placeholder="Comentario (opcional)"
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  value={nombreCriterioNuevo}
                  onChange={(e) => setNombreCriterioNuevo(e.target.value)}
                  placeholder="Nombre del criterio nuevo"
                  className={inputClass}
                />
                <button onClick={agregarCriterioLibre} className="flex-shrink-0 bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#e09410]">
                  + Agregar
                </button>
              </div>
            </div>

            <div>
              <SubHeader icono="📝" titulo="Observaciones generales" />
              <div className="space-y-2.5">
                <div>
                  <label className={labelClass}>Fortalezas</label>
                  <textarea value={formEval.fortalezas} onChange={(e) => setFormEval((f) => f && { ...f, fortalezas: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
                </div>
                <div>
                  <label className={labelClass}>Áreas de mejora</label>
                  <textarea value={formEval.areasMejora} onChange={(e) => setFormEval((f) => f && { ...f, areasMejora: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
                </div>
                <div>
                  <label className={labelClass}>Plan de acción</label>
                  <textarea value={formEval.planAccion} onChange={(e) => setFormEval((f) => f && { ...f, planAccion: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
                </div>
                <div>
                  <label className={labelClass}>Observaciones</label>
                  <textarea value={formEval.observaciones} onChange={(e) => setFormEval((f) => f && { ...f, observaciones: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button onClick={guardarEvaluacion} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button onClick={() => setFormEval(null)} className="text-sm text-gray-400 hover:text-gray-600">
                    Cancelar
                  </button>
                </div>
                {evaluaciones.some((e) => e.id === formEval.id) && (
                  <button
                    onClick={() => {
                      eliminarEvaluacion(formEval.id);
                      setFormEval(null);
                    }}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
