"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { ProyectoDiseno } from "@/lib/disenoDesarrollo";
import {
  parseEtapasPlanificacion,
  etapaPlanificacionVacia,
  colorEstadoEtapaPlanificacion,
  cumplimientoPlanificacion,
  ESTADOS_ETAPA_PLANIFICACION,
  type EtapaPlanificacion,
} from "@/lib/disenoDesarrollo";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function itemKeyPlanificacion(proyectoId: string) {
  return `planificacion_diseno_${proyectoId}`;
}

function fechaCorta(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function PlanificacionDisenoForm({ userId, proyecto }: { userId: string | null; proyecto: ProyectoDiseno }) {
  const { docs, loading, save } = useGestionDocumentos("diseno_desarrollo", userId);
  const ITEM_KEY = itemKeyPlanificacion(proyecto.id);

  const [etapas, setEtapas] = useState<EtapaPlanificacion[]>([]);
  const [etapa, setEtapa] = useState<EtapaPlanificacion>(etapaPlanificacionVacia());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) setEtapas(parseEtapasPlanificacion(docs[ITEM_KEY] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = etapas.some((e) => e.id === etapa.id);
  const cumplimiento = cumplimientoPlanificacion(etapas);
  const retrasadas = etapas.filter((e) => e.estado === "Retrasada").length;
  const completadas = etapas.filter((e) => e.estado === "Completada").length;

  function campo<K extends keyof EtapaPlanificacion>(key: K, value: EtapaPlanificacion[K]) {
    setEtapa((e) => ({ ...e, [key]: value }));
  }

  function limpiar() {
    setEtapa(etapaPlanificacionVacia());
    setError(null);
  }

  function editar(e: EtapaPlanificacion) {
    setEtapa({ ...e });
    setError(null);
  }

  async function guardar() {
    if (!etapa.nombre.trim()) {
      setError("Ingresá el nombre de la etapa.");
      return;
    }
    setError(null);
    setSaving(true);
    const actualizadas = [...etapas.filter((e) => e.id !== etapa.id), etapa];
    await save(ITEM_KEY, JSON.stringify(actualizadas));
    setEtapas(actualizadas);
    setEtapa(etapaPlanificacionVacia());
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    setSaving(true);
    const restantes = etapas.filter((e) => e.id !== id);
    await save(ITEM_KEY, JSON.stringify(restantes));
    setEtapas(restantes);
    if (etapa.id === id) limpiar();
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🗒️</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{etapas.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Etapas planificadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">📈</p>
          <p className="text-lg font-bold" style={{ color: cumplimiento === null ? "#9CA3AF" : cumplimiento >= 70 ? "#22C55E" : cumplimiento >= 40 ? "#F5A623" : "#EF4444" }}>
            {cumplimiento !== null ? `${cumplimiento}%` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Cumplimiento del plan</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">✅</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{completadas}</p>
          <p className="text-xs text-gray-500 mt-0.5">Completadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">⏳</p>
          <p className="text-lg font-bold" style={{ color: retrasadas > 0 ? "#EF4444" : "#1A1A1A" }}>{retrasadas}</p>
          <p className="text-xs text-gray-500 mt-0.5">Retrasadas</p>
        </div>
      </div>

      {/* Formulario */}
      <Seccion icono="🗒️" titulo={editando ? "Editando etapa" : "Nueva etapa de planificación"}>
        <div className="space-y-3">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Etapa guardada</div>}

          <div>
            <label className={labelClass}><span className="text-red-500">*</span> Nombre de la etapa</label>
            <input value={etapa.nombre} onChange={(e) => campo("nombre", e.target.value)} placeholder="Ej: Desarrollo de prototipo" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className={labelClass}>Responsable</label>
              <input value={etapa.responsable} onChange={(e) => campo("responsable", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select value={etapa.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                {ESTADOS_ETAPA_PLANIFICACION.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fecha de inicio</label>
              <input type="date" value={etapa.fechaInicio} onChange={(e) => campo("fechaInicio", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fin planeado</label>
              <input type="date" value={etapa.fechaFinPlaneada} onChange={(e) => campo("fechaFinPlaneada", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Fin real</label>
              <input type="date" value={etapa.fechaFinReal} onChange={(e) => campo("fechaFinReal", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Recursos necesarios</label>
              <input value={etapa.recursosNecesarios} onChange={(e) => campo("recursosNecesarios", e.target.value)} placeholder="Ej: Equipo de ensayo, 2 ingenieros" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea value={etapa.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button onClick={guardar} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
              {saving ? "Guardando..." : editando ? "Guardar cambios" : "Agregar etapa"}
            </button>
            <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
              {editando ? "Nueva etapa en blanco" : "Limpiar"}
            </button>
          </div>
        </div>
      </Seccion>

      {/* Tabla */}
      <Seccion icono="🗂️" titulo="Plan de Etapas">
        {etapas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no planificaste ninguna etapa.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[720px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2.5 font-semibold border-b border-gray-100">Etapa</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Responsable</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Inicio</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Fin planeado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Estado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody>
                {etapas.map((e) => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                    <td className="p-2.5 font-medium text-[#1A1A1A] max-w-[200px] truncate">{e.nombre}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{e.responsable || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(e.fechaInicio)}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(e.fechaFinPlaneada)}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoEtapaPlanificacion(e.estado) }}>
                        {e.estado}
                      </span>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <button onClick={() => editar(e)} className="text-[#F5A623] font-semibold hover:text-[#e09410] mr-2">Editar</button>
                      <button onClick={() => eliminar(e.id)} className="text-gray-300 hover:text-red-500">Eliminar</button>
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
