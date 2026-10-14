"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { ProyectoDiseno } from "@/lib/disenoDesarrollo";
import {
  parseControlDiseno,
  revisionDisenoVacia,
  verificacionDisenoVacia,
  validacionDisenoVacia,
  colorResultadoControlDiseno,
  METODOS_CONTROL_DISENO,
  RESULTADOS_CONTROL_DISENO,
  type RevisionDiseno,
  type VerificacionDiseno,
  type ValidacionDiseno,
} from "@/lib/disenoDesarrollo";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function itemKeyControl(proyectoId: string) {
  return `control_diseno_${proyectoId}`;
}

function fechaCorta(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function ControlDisenoForm({ userId, proyecto }: { userId: string | null; proyecto: ProyectoDiseno }) {
  const { docs, loading, save } = useGestionDocumentos("diseno_desarrollo", userId);
  const ITEM_KEY = itemKeyControl(proyecto.id);

  const [revisiones, setRevisiones] = useState<RevisionDiseno[]>([]);
  const [verificaciones, setVerificaciones] = useState<VerificacionDiseno[]>([]);
  const [validaciones, setValidaciones] = useState<ValidacionDiseno[]>([]);

  const [revision, setRevision] = useState<RevisionDiseno>(revisionDisenoVacia());
  const [verificacion, setVerificacion] = useState<VerificacionDiseno>(verificacionDisenoVacia());
  const [validacion, setValidacion] = useState<ValidacionDiseno>(validacionDisenoVacia());

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      const control = parseControlDiseno(docs[ITEM_KEY] ?? "");
      setRevisiones(control.revisiones);
      setVerificaciones(control.verificaciones);
      setValidaciones(control.validaciones);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  async function persistir(next: { revisiones?: RevisionDiseno[]; verificaciones?: VerificacionDiseno[]; validaciones?: ValidacionDiseno[] }) {
    setSaving(true);
    const actualizado = {
      revisiones: next.revisiones ?? revisiones,
      verificaciones: next.verificaciones ?? verificaciones,
      validaciones: next.validaciones ?? validaciones,
    };
    await save(ITEM_KEY, JSON.stringify(actualizado));
    if (next.revisiones) setRevisiones(next.revisiones);
    if (next.verificaciones) setVerificaciones(next.verificaciones);
    if (next.validaciones) setValidaciones(next.validaciones);
    setSaving(false);
  }

  // --- Revisión ---
  async function guardarRevision() {
    if (!revision.hallazgos.trim()) return;
    const editandoR = revisiones.some((r) => r.id === revision.id);
    const actualizadas = editandoR
      ? revisiones.map((r) => (r.id === revision.id ? revision : r))
      : [...revisiones, revision];
    await persistir({ revisiones: actualizadas });
    setRevision(revisionDisenoVacia());
  }
  async function eliminarRevision(id: string) {
    await persistir({ revisiones: revisiones.filter((r) => r.id !== id) });
  }

  // --- Verificación ---
  async function guardarVerificacion() {
    const editandoV = verificaciones.some((v) => v.id === verificacion.id);
    const actualizadas = editandoV
      ? verificaciones.map((v) => (v.id === verificacion.id ? verificacion : v))
      : [...verificaciones, verificacion];
    await persistir({ verificaciones: actualizadas });
    setVerificacion(verificacionDisenoVacia());
  }
  async function eliminarVerificacion(id: string) {
    await persistir({ verificaciones: verificaciones.filter((v) => v.id !== id) });
  }

  // --- Validación ---
  async function guardarValidacion() {
    const editandoVal = validaciones.some((v) => v.id === validacion.id);
    const actualizadas = editandoVal
      ? validaciones.map((v) => (v.id === validacion.id ? validacion : v))
      : [...validaciones, validacion];
    await persistir({ validaciones: actualizadas });
    setValidacion(validacionDisenoVacia());
  }
  async function eliminarValidacion(id: string) {
    await persistir({ validaciones: validaciones.filter((v) => v.id !== id) });
  }

  return (
    <div className="space-y-4">
      {/* Revisión del diseño (8.3.4) */}
      <Seccion numero="1" icono="🔎" titulo="Revisión del Diseño">
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Evaluá la capacidad del diseño para cumplir los requisitos e identificá problemas y acciones necesarias.</p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={revision.fecha} onChange={(e) => setRevision((r) => ({ ...r, fecha: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Participantes</label>
              <input value={revision.participantes} onChange={(e) => setRevision((r) => ({ ...r, participantes: e.target.value }))} placeholder="Ej: Jefe de diseño, calidad, producción" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Hallazgos</label>
            <textarea value={revision.hallazgos} onChange={(e) => setRevision((r) => ({ ...r, hallazgos: e.target.value }))} rows={2} className={`${inputClass} resize-y`} />
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Acciones derivadas</label>
              <input value={revision.accionesDerivadas} onChange={(e) => setRevision((r) => ({ ...r, accionesDerivadas: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Responsable</label>
              <input value={revision.responsable} onChange={(e) => setRevision((r) => ({ ...r, responsable: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <button onClick={guardarRevision} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
            + Registrar revisión
          </button>

          {revisiones.length > 0 && (
            <div className="space-y-0 mt-2 border-l-2 border-gray-100 ml-1.5 pl-4">
              {[...revisiones].reverse().map((r) => (
                <div key={r.id} className="relative pb-4 last:pb-0">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
                  <p className="text-sm text-[#1A1A1A]">{r.hallazgos}</p>
                  {r.accionesDerivadas && <p className="text-xs text-gray-500 mt-0.5">Acción: {r.accionesDerivadas}</p>}
                  <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                    {fechaCorta(r.fecha)} · {r.participantes || "—"} · {r.responsable || "—"}
                    <button onClick={() => eliminarRevision(r.id)} className="text-gray-300 hover:text-red-500">✕</button>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Seccion>

      {/* Verificación (8.3.4) */}
      <Seccion numero="2" icono="✅" titulo="Verificación del Diseño">
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Confirmá que las salidas del diseño cumplen con los requisitos de las entradas.</p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={verificacion.fecha} onChange={(e) => setVerificacion((v) => ({ ...v, fecha: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Método</label>
              <select value={verificacion.metodo} onChange={(e) => setVerificacion((v) => ({ ...v, metodo: e.target.value }))} className={inputClass}>
                {METODOS_CONTROL_DISENO.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Resultado</label>
              <select value={verificacion.resultado} onChange={(e) => setVerificacion((v) => ({ ...v, resultado: e.target.value }))} className={inputClass}>
                {RESULTADOS_CONTROL_DISENO.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Responsable</label>
              <input value={verificacion.responsable} onChange={(e) => setVerificacion((v) => ({ ...v, responsable: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea value={verificacion.observaciones} onChange={(e) => setVerificacion((v) => ({ ...v, observaciones: e.target.value }))} rows={2} className={`${inputClass} resize-y`} />
          </div>
          <button onClick={guardarVerificacion} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
            + Registrar verificación
          </button>

          {verificaciones.length > 0 && (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs min-w-[600px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">
                    <th className="p-2 font-semibold border-b border-gray-100">Fecha</th>
                    <th className="p-2 font-semibold border-b border-gray-100">Método</th>
                    <th className="p-2 font-semibold border-b border-gray-100">Resultado</th>
                    <th className="p-2 font-semibold border-b border-gray-100">Responsable</th>
                    <th className="p-2 font-semibold border-b border-gray-100"></th>
                  </tr>
                </thead>
                <tbody>
                  {[...verificaciones].reverse().map((v) => (
                    <tr key={v.id} className="border-b border-gray-50">
                      <td className="p-2 text-gray-600 whitespace-nowrap">{fechaCorta(v.fecha)}</td>
                      <td className="p-2 text-gray-600 max-w-[160px] truncate">{v.metodo}</td>
                      <td className="p-2 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorResultadoControlDiseno(v.resultado) }}>
                          {v.resultado}
                        </span>
                      </td>
                      <td className="p-2 text-gray-600 whitespace-nowrap">{v.responsable || "—"}</td>
                      <td className="p-2 whitespace-nowrap"><button onClick={() => eliminarVerificacion(v.id)} className="text-gray-300 hover:text-red-500">Eliminar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Seccion>

      {/* Validación (8.3.4) */}
      <Seccion numero="3" icono="🏁" titulo="Validación del Diseño">
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Confirmá que el producto o servicio resultante satisface los requisitos para su uso previsto.</p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={validacion.fecha} onChange={(e) => setValidacion((v) => ({ ...v, fecha: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Condiciones de uso evaluadas</label>
              <input value={validacion.condicionesUso} onChange={(e) => setValidacion((v) => ({ ...v, condicionesUso: e.target.value }))} placeholder="Ej: Uso en planta, condición real del cliente" className={inputClass} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Resultado</label>
              <select value={validacion.resultado} onChange={(e) => setValidacion((v) => ({ ...v, resultado: e.target.value }))} className={inputClass}>
                {RESULTADOS_CONTROL_DISENO.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Responsable</label>
              <input value={validacion.responsable} onChange={(e) => setValidacion((v) => ({ ...v, responsable: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea value={validacion.observaciones} onChange={(e) => setValidacion((v) => ({ ...v, observaciones: e.target.value }))} rows={2} className={`${inputClass} resize-y`} />
          </div>
          <button onClick={guardarValidacion} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
            + Registrar validación
          </button>

          {validaciones.length > 0 && (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs min-w-[600px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">
                    <th className="p-2 font-semibold border-b border-gray-100">Fecha</th>
                    <th className="p-2 font-semibold border-b border-gray-100">Condiciones</th>
                    <th className="p-2 font-semibold border-b border-gray-100">Resultado</th>
                    <th className="p-2 font-semibold border-b border-gray-100">Responsable</th>
                    <th className="p-2 font-semibold border-b border-gray-100"></th>
                  </tr>
                </thead>
                <tbody>
                  {[...validaciones].reverse().map((v) => (
                    <tr key={v.id} className="border-b border-gray-50">
                      <td className="p-2 text-gray-600 whitespace-nowrap">{fechaCorta(v.fecha)}</td>
                      <td className="p-2 text-gray-600 max-w-[160px] truncate">{v.condicionesUso || "—"}</td>
                      <td className="p-2 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorResultadoControlDiseno(v.resultado) }}>
                          {v.resultado}
                        </span>
                      </td>
                      <td className="p-2 text-gray-600 whitespace-nowrap">{v.responsable || "—"}</td>
                      <td className="p-2 whitespace-nowrap"><button onClick={() => eliminarValidacion(v.id)} className="text-gray-300 hover:text-red-500">Eliminar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Seccion>
    </div>
  );
}
