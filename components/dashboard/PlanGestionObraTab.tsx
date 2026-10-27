"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parsePlanGestionObra, type PlanGestionObra, type ActividadObra } from "@/lib/planGestionObra";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";
const cellInput =
  "w-full bg-transparent border-0 focus:outline-none focus:ring-0 focus:bg-[#FFF6E5] px-2 py-1.5 text-xs text-[#1A1A1A] placeholder-gray-300 rounded transition-colors";

const COLUMNAS: { key: keyof ActividadObra; label: string; minWidth: number }[] = [
  { key: "documentoAplicable", label: "Documento aplicable", minWidth: 140 },
  { key: "responsableActividad", label: "Responsable de la actividad", minWidth: 160 },
  { key: "caracteristicaCalidad", label: "Característica de calidad a controlar", minWidth: 200 },
  { key: "documentoControlAplicable", label: "Documento de control aplicable", minWidth: 180 },
  { key: "registroFichaControl", label: "Registro o ficha de control", minWidth: 180 },
  { key: "responsableControl", label: "Responsable del control", minWidth: 160 },
  { key: "metodoEquipoInspeccion", label: "Método y/o equipo de inspección", minWidth: 180 },
  { key: "observaciones", label: "Observaciones", minWidth: 180 },
  { key: "documentosSeguridad", label: "Documentos aplicables de seguridad (SySO)", minWidth: 220 },
];

// Anexo del Plan de Calidad para proyectos de obra civil — mismo esquema que
// la plantilla PG-[obra]-[año] de referencia. Las 23 actividades son fijas
// (no se agregan ni se eliminan), solo se completan sus columnas de control.
export default function PlanGestionObraTab({ userId, planId }: { userId: string | null; planId: string }) {
  const itemKey = `plan_gestion_obra_${planId}`;
  const { docs, loading, save } = useGestionDocumentos("diseno_desarrollo", userId);

  const [plan, setPlan] = useState<PlanGestionObra | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) {
      setPlan(parsePlanGestionObra(docs[itemKey] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading || !plan) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  function campo<K extends keyof PlanGestionObra>(key: K, value: PlanGestionObra[K]) {
    setPlan((p) => (p ? { ...p, [key]: value } : p));
  }

  function actualizarActividad(nombre: string, key: keyof ActividadObra, value: string) {
    setPlan((p) =>
      p ? { ...p, actividades: p.actividades.map((a) => (a.nombre === nombre ? { ...a, [key]: value } : a)) } : p
    );
  }

  async function guardar() {
    if (!plan) return;
    setSaving(true);
    await save(itemKey, JSON.stringify(plan));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Proyecto</label>
          <input value={plan.proyecto} onChange={(e) => campo("proyecto", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cliente</label>
          <input value={plan.cliente} onChange={(e) => campo("cliente", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Subrubro</label>
          <input value={plan.subrubro} onChange={(e) => campo("subrubro", e.target.value)} placeholder="Ej: Hormigón, Albañilería, Instalaciones" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Código</label>
          <input value={plan.codigo} onChange={(e) => campo("codigo", e.target.value)} placeholder="PG-[obra]-[año]" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Revisión</label>
          <input value={plan.revision} onChange={(e) => campo("revision", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Fecha</label>
          <input type="date" value={plan.fecha} onChange={(e) => campo("fecha", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="w-full text-xs border-collapse" style={{ minWidth: 1500 }}>
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="p-2 font-semibold border-b border-r border-gray-100 sticky left-0 bg-gray-50" style={{ minWidth: 180 }}>
                Nombre de la actividad
              </th>
              {COLUMNAS.map((c) => (
                <th key={c.key} className="p-2 font-semibold border-b border-r border-gray-100" style={{ minWidth: c.minWidth }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plan.actividades.map((a) => (
              <tr key={a.nombre} className="group hover:bg-[#FAFAFA]">
                <td className="p-2 border-b border-r border-gray-100 font-semibold text-[#1A1A1A] sticky left-0 bg-white group-hover:bg-[#FAFAFA]">
                  {a.nombre}
                </td>
                {COLUMNAS.map((c) => (
                  <td key={c.key} className="border-b border-r border-gray-100">
                    <input value={a[c.key]} onChange={(e) => actualizarActividad(a.nombre, c.key, e.target.value)} className={cellInput} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Elaborado por</p>
          <label className={labelClass}>Cargo</label>
          <input value={plan.elaboradoCargo} onChange={(e) => campo("elaboradoCargo", e.target.value)} className={inputClass} />
          <label className={`${labelClass} mt-2`}>Firma</label>
          <input value={plan.elaboradoFirma} onChange={(e) => campo("elaboradoFirma", e.target.value)} className={inputClass} />
          <label className={`${labelClass} mt-2`}>Fecha</label>
          <input type="date" value={plan.elaboradoFecha} onChange={(e) => campo("elaboradoFecha", e.target.value)} className={inputClass} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Revisado por</p>
          <label className={labelClass}>Cargo</label>
          <input value={plan.revisadoCargo} onChange={(e) => campo("revisadoCargo", e.target.value)} className={inputClass} />
          <label className={`${labelClass} mt-2`}>Firma</label>
          <input value={plan.revisadoFirma} onChange={(e) => campo("revisadoFirma", e.target.value)} className={inputClass} />
          <label className={`${labelClass} mt-2`}>Fecha</label>
          <input type="date" value={plan.revisadoFecha} onChange={(e) => campo("revisadoFecha", e.target.value)} className={inputClass} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Aprobado por</p>
          <label className={labelClass}>Cargo</label>
          <input value={plan.aprobadoCargo} onChange={(e) => campo("aprobadoCargo", e.target.value)} className={inputClass} />
          <label className={`${labelClass} mt-2`}>Firma</label>
          <input value={plan.aprobadoFirma} onChange={(e) => campo("aprobadoFirma", e.target.value)} className={inputClass} />
          <label className={`${labelClass} mt-2`}>Fecha</label>
          <input type="date" value={plan.aprobadoFecha} onChange={(e) => campo("aprobadoFecha", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-green-600 font-semibold">Guardado ✓</span>}
        <button type="button" onClick={guardar} disabled={saving} className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-60">
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
