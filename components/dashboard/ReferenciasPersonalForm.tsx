"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
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
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

export default function ReferenciasPersonalForm({ userId, empleado }: { userId: string | null; empleado: Empleado }) {
  const itemKey = `referencias_${empleado.id}`;
  const { docs, loading, save } = useGestionDocumentos("talento_humano", userId);

  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [formRef, setFormRef] = useState<Referencia | null>(null);
  const [saving, setSaving] = useState(false);

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
    setFormRef(referenciaVacia());
  }

  function abrirEditar(r: Referencia) {
    setFormRef({ ...r });
  }

  async function guardarReferencia() {
    if (!formRef || !formRef.nombreReferente.trim()) return;
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
                onClick={() => abrirEditar(r)}
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

      {formRef && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setFormRef(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl my-8 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              {referencias.some((r) => r.id === formRef.id) ? "Editar referencia" : "Nueva referencia laboral"}
            </h2>

            {/* Datos del referente */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Datos del referente</h3>
              <div className="grid grid-cols-2 gap-3">
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
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Datos laborales a confirmar</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
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
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Evaluación del referente</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
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
              <div className="space-y-3">
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
              <div className="grid grid-cols-2 gap-3 mt-3">
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

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
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
      )}
    </div>
  );
}
