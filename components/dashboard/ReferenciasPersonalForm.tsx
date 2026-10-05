"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion, Dato } from "@/components/dashboard/SeccionDocumento";
import type { Empleado } from "@/lib/personal";
import {
  parseReferencias,
  referenciaVacia,
  RELACIONES_REFERENTE,
  NIVELES_DESEMPENO,
  OPCIONES_SI_NO,
  CALIFICACIONES_GENERALES,
  colorCalificacion,
  type Referencia,
} from "@/lib/referenciasPersonal";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function fechaLegible(iso?: string) {
  if (!iso) return undefined;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function SubHeader({ icono, titulo }: { icono: string; titulo: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-wide px-3 py-2 rounded-lg mb-3">
      <span>{icono}</span>
      {titulo}
    </div>
  );
}

export default function ReferenciasPersonalForm({ userId, empleado }: { userId: string | null; empleado: Empleado }) {
  const itemKey = `referencias_${empleado.id}`;
  const { docs, loading, save } = useGestionDocumentos("talento_humano", userId);

  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [formRef, setFormRef] = useState<Referencia | null>(null);
  const [viendoRef, setViendoRef] = useState<Referencia | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) setReferencias(parseReferencias(docs[itemKey] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function persistir(actualizadas: Referencia[]) {
    setSaving(true);
    await save(itemKey, JSON.stringify(actualizadas));
    setReferencias(actualizadas);
    setSaving(false);
  }

  function abrirNueva() {
    setError(null);
    setFormRef(referenciaVacia());
  }

  function abrirEditar(r: Referencia) {
    setError(null);
    setViendoRef(null);
    setFormRef({ ...r });
  }

  function abrirInforme(r: Referencia) {
    setViendoRef(r);
  }

  async function guardarReferencia() {
    if (!formRef) return;
    if (!formRef.nombreReferente.trim()) {
      setError("El nombre del referente es obligatorio.");
      return;
    }
    setError(null);
    const existe = referencias.some((r) => r.id === formRef.id);
    const actualizadas = existe
      ? referencias.map((r) => (r.id === formRef.id ? formRef : r))
      : [...referencias, formRef];
    await persistir(actualizadas);
    setFormRef(null);
  }

  async function eliminarReferencia(id: string) {
    await persistir(referencias.filter((r) => r.id !== id));
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-6 text-center">Cargando...</p>;
  }

  return (
    <div className="space-y-4">
      <Seccion icono="📇" titulo="Verificación de Referencias Laborales">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            Registro de contacto con referentes laborales de {empleado.nombre} para confirmar su desempeño anterior.
          </p>
          <button
            onClick={abrirNueva}
            className="flex-shrink-0 text-xs font-semibold text-[#F5A623] hover:text-[#e09410] whitespace-nowrap ml-4"
          >
            + Agregar referencia
          </button>
        </div>

        {referencias.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no se registró ninguna referencia.</p>
        ) : (
          <div className="space-y-2.5">
            {referencias.map((r) => (
              <button
                key={r.id}
                onClick={() => abrirInforme(r)}
                className="w-full text-left bg-[#FAFAFA] rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{r.nombreReferente || "Sin nombre"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.cargoReferente && <>{r.cargoReferente} · </>}
                      {r.empresaReferente || "—"}
                      {r.relacion && <> · {r.relacion}</>}
                    </p>
                  </div>
                  {r.calificacionGeneral && (
                    <span
                      className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                      style={{ backgroundColor: colorCalificacion(r.calificacionGeneral) }}
                    >
                      {r.calificacionGeneral}
                    </span>
                  )}
                </div>
                {r.comentariosAdicionales && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{r.comentariosAdicionales}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </Seccion>

      {viendoRef && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" onClick={() => setViendoRef(null)}>
          <div className="bg-white rounded-2xl w-full max-w-xl my-8 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Encabezado del informe */}
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
                    Informe de Referencia Laboral
                  </span>
                  <h2 className="text-white text-xl font-extrabold">{viendoRef.nombreReferente || "Sin nombre"}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {viendoRef.cargoReferente && <>{viendoRef.cargoReferente} · </>}
                    {viendoRef.empresaReferente || "—"}
                    {viendoRef.relacion && <> · {viendoRef.relacion}</>}
                  </p>
                </div>
                {viendoRef.calificacionGeneral && (
                  <span
                    className="flex-shrink-0 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full text-white whitespace-nowrap"
                    style={{ backgroundColor: colorCalificacion(viendoRef.calificacionGeneral) }}
                  >
                    {viendoRef.calificacionGeneral}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Datos del referente</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Dato label="Teléfono" valor={viendoRef.telefono} />
                  <Dato label="Email" valor={viendoRef.email} />
                  <Dato label="Fecha de verificación" valor={fechaLegible(viendoRef.fechaVerificacion)} />
                  <Dato label="Verificado por" valor={viendoRef.verificadoPor} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Datos laborales confirmados</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Dato label="Cargo confirmado" valor={viendoRef.cargoConfirmado} />
                  <Dato label="Motivo de salida" valor={viendoRef.motivoSalidaSegunReferente} />
                  <Dato label="Fecha de ingreso" valor={fechaLegible(viendoRef.fechaIngresoConfirmada)} />
                  <Dato label="Fecha de egreso" valor={fechaLegible(viendoRef.fechaEgresoConfirmada)} />
                </div>
                {viendoRef.funcionesConfirmadas && (
                  <div className="mt-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Funciones confirmadas</p>
                    <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendoRef.funcionesConfirmadas}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Evaluación</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Dato label="Desempeño" valor={viendoRef.desempeno} />
                  <Dato label="Problemas de asistencia" valor={viendoRef.problemasAsistencia} />
                  <Dato label="¿Volvería a contratarlo/a?" valor={viendoRef.volveriaContratar} />
                </div>
                {viendoRef.fortalezas && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Fortalezas</p>
                    <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendoRef.fortalezas}</p>
                  </div>
                )}
                {viendoRef.areasMejora && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Áreas de mejora</p>
                    <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendoRef.areasMejora}</p>
                  </div>
                )}
                {viendoRef.relacionCompaneros && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Relación con compañeros</p>
                    <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendoRef.relacionCompaneros}</p>
                  </div>
                )}
                {viendoRef.comentariosAdicionales && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Comentarios adicionales</p>
                    <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendoRef.comentariosAdicionales}</p>
                  </div>
                )}
                {!viendoRef.desempeno &&
                  !viendoRef.fortalezas &&
                  !viendoRef.areasMejora &&
                  !viendoRef.relacionCompaneros &&
                  !viendoRef.comentariosAdicionales && (
                    <p className="text-sm text-gray-400">Todavía no se cargó la evaluación.</p>
                  )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => abrirEditar(viendoRef)}
                className="text-sm font-semibold text-[#F5A623] hover:text-[#e09410]"
              >
                ✎ Editar referencia
              </button>
              <button onClick={() => setViendoRef(null)} className="text-sm text-gray-400 hover:text-gray-600">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {formRef && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" onClick={() => setFormRef(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl my-8 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              {referencias.some((r) => r.id === formRef.id) ? "Editar referencia" : "Nueva referencia laboral"}
            </h2>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>
            )}

            {/* Datos del referente */}
            <div>
              <SubHeader icono="👤" titulo="Datos del referente" />
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}><span className="text-red-500">*</span> Nombre</label>
                  <input value={formRef.nombreReferente} onChange={(e) => setFormRef((f) => f && { ...f, nombreReferente: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Relación con el colaborador</label>
                  <select value={formRef.relacion} onChange={(e) => setFormRef((f) => f && { ...f, relacion: e.target.value })} className={inputClass}>
                    <option value="">Seleccioná</option>
                    {RELACIONES_REFERENTE.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Empresa</label>
                  <input value={formRef.empresaReferente} onChange={(e) => setFormRef((f) => f && { ...f, empresaReferente: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cargo del referente</label>
                  <input value={formRef.cargoReferente} onChange={(e) => setFormRef((f) => f && { ...f, cargoReferente: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input value={formRef.telefono} onChange={(e) => setFormRef((f) => f && { ...f, telefono: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input value={formRef.email} onChange={(e) => setFormRef((f) => f && { ...f, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha de verificación</label>
                  <input type="date" value={formRef.fechaVerificacion} onChange={(e) => setFormRef((f) => f && { ...f, fechaVerificacion: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Verificado por</label>
                  <input value={formRef.verificadoPor} onChange={(e) => setFormRef((f) => f && { ...f, verificadoPor: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Datos laborales a confirmar */}
            <div>
              <SubHeader icono="💼" titulo="Datos laborales a confirmar" />
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div>
                  <label className={labelClass}>Cargo confirmado</label>
                  <input value={formRef.cargoConfirmado} onChange={(e) => setFormRef((f) => f && { ...f, cargoConfirmado: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Motivo de salida (según referente)</label>
                  <input value={formRef.motivoSalidaSegunReferente} onChange={(e) => setFormRef((f) => f && { ...f, motivoSalidaSegunReferente: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha de ingreso confirmada</label>
                  <input type="date" value={formRef.fechaIngresoConfirmada} onChange={(e) => setFormRef((f) => f && { ...f, fechaIngresoConfirmada: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha de egreso confirmada</label>
                  <input type="date" value={formRef.fechaEgresoConfirmada} onChange={(e) => setFormRef((f) => f && { ...f, fechaEgresoConfirmada: e.target.value })} className={inputClass} />
                </div>
              </div>
              <label className={labelClass}>Funciones confirmadas</label>
              <textarea value={formRef.funcionesConfirmadas} onChange={(e) => setFormRef((f) => f && { ...f, funcionesConfirmadas: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
            </div>

            {/* Evaluación */}
            <div>
              <SubHeader icono="⭐" titulo="Evaluación del referente" />
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div>
                  <label className={labelClass}>¿Cómo calificaría su desempeño?</label>
                  <select value={formRef.desempeno} onChange={(e) => setFormRef((f) => f && { ...f, desempeno: e.target.value })} className={inputClass}>
                    <option value="">Seleccioná</option>
                    {NIVELES_DESEMPENO.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>¿Tuvo problemas de puntualidad/asistencia?</label>
                  <select value={formRef.problemasAsistencia} onChange={(e) => setFormRef((f) => f && { ...f, problemasAsistencia: e.target.value })} className={inputClass}>
                    <option value="">Seleccioná</option>
                    {OPCIONES_SI_NO.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className={labelClass}>Principales fortalezas</label>
                  <textarea value={formRef.fortalezas} onChange={(e) => setFormRef((f) => f && { ...f, fortalezas: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
                </div>
                <div>
                  <label className={labelClass}>Áreas de mejora</label>
                  <textarea value={formRef.areasMejora} onChange={(e) => setFormRef((f) => f && { ...f, areasMejora: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
                </div>
                <div>
                  <label className={labelClass}>Relación con compañeros de trabajo</label>
                  <textarea value={formRef.relacionCompaneros} onChange={(e) => setFormRef((f) => f && { ...f, relacionCompaneros: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                <div>
                  <label className={labelClass}>¿Volvería a contratarlo/a?</label>
                  <select value={formRef.volveriaContratar} onChange={(e) => setFormRef((f) => f && { ...f, volveriaContratar: e.target.value })} className={inputClass}>
                    <option value="">Seleccioná</option>
                    {OPCIONES_SI_NO.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Calificación general</label>
                  <select value={formRef.calificacionGeneral} onChange={(e) => setFormRef((f) => f && { ...f, calificacionGeneral: e.target.value })} className={inputClass}>
                    <option value="">Seleccioná</option>
                    {CALIFICACIONES_GENERALES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className={labelClass}>Comentarios adicionales</label>
                <textarea value={formRef.comentariosAdicionales} onChange={(e) => setFormRef((f) => f && { ...f, comentariosAdicionales: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={guardarReferencia}
                    disabled={saving}
                    className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm"
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button onClick={() => setFormRef(null)} className="text-sm text-gray-400 hover:text-gray-600">
                    Cancelar
                  </button>
                </div>
                {referencias.some((r) => r.id === formRef.id) && (
                  <button
                    onClick={() => {
                      eliminarReferencia(formRef.id);
                      setFormRef(null);
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
