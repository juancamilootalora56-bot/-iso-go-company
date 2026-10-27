"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { createClient } from "@/lib/supabase/client";
import { otorgarAccesoPorRegistro } from "@/lib/colaboradoresCliente";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import CampoConAyuda from "@/components/dashboard/CampoConAyuda";
import OrganigramaEditor from "@/components/dashboard/OrganigramaEditor";
import ManualesProyectoTab from "@/components/dashboard/ManualesProyectoTab";
import PlanGestionObraTab from "@/components/dashboard/PlanGestionObraTab";
import SelectorAccesoColaboradores from "@/components/dashboard/SelectorAccesoColaboradores";
import {
  parsePlanesCalidad,
  actividadFaseVacia,
  faseVacia,
  colorEstadoPlanCalidad,
  ESTADOS_PLAN_CALIDAD,
  type PlanCalidad,
  type FaseCronograma,
} from "@/lib/planesCalidad";

const ITEM_KEY = "planes_calidad_lista";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";
const cellInput =
  "w-full bg-transparent border-0 focus:outline-none focus:ring-0 focus:bg-[#FFF6E5] px-2 py-1.5 text-xs text-[#1A1A1A] placeholder-gray-300 rounded transition-colors";

type Tab = "planes" | "organigrama" | "manuales" | "obra" | "cronograma";

export default function PerfilPlanCalidadPage() {
  const { user, colaborador } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const id = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-diseno-desarrollo`;

  const { docs, loading, save } = useGestionDocumentos("diseno_desarrollo", user?.id ?? null);

  const [plan, setPlan] = useState<PlanCalidad | null>(null);
  const [tab, setTab] = useState<Tab>("planes");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      const planes = parsePlanesCalidad(docs[ITEM_KEY] ?? "");
      setPlan(planes.find((p) => p.id === id) ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, id]);

  if (loading || !plan) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href={`${basePath}/planes_calidad`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
          ← Planes de Calidad
        </Link>
        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-gray-500 text-sm">No se encontró este plan de calidad.</p>
          </div>
        )}
      </div>
    );
  }

  // Un colaborador solo puede trabajar en los planes puntuales que se le
  // compartieron desde el selector de acceso del propio plan.
  if (colaborador && !plan.colaboradoresConAcceso?.includes(colaborador.empleadoId ?? "")) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href={`${basePath}/planes_calidad`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
          ← Planes de Calidad
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">No tenés acceso a este plan de calidad.</p>
        </div>
      </div>
    );
  }

  function campo<K extends keyof PlanCalidad>(key: K, value: PlanCalidad[K]) {
    setPlan((p) => (p ? { ...p, [key]: value } : p));
  }

  function actualizarFase(faseId: string, cambios: Partial<FaseCronograma>) {
    setPlan((p) => (p ? { ...p, fases: p.fases.map((f) => (f.id === faseId ? { ...f, ...cambios } : f)) } : p));
  }

  function agregarFase() {
    setPlan((p) => (p ? { ...p, fases: [...p.fases, faseVacia(p.fases.length + 1)] } : p));
  }

  function eliminarFase(faseId: string) {
    setPlan((p) => (p ? { ...p, fases: p.fases.filter((f) => f.id !== faseId) } : p));
  }

  function agregarActividad(fase: FaseCronograma) {
    actualizarFase(fase.id, { actividades: [...fase.actividades, actividadFaseVacia(fase.actividades.length + 1)] });
  }

  function actualizarActividad(fase: FaseCronograma, actividadId: string, key: string, value: string | number) {
    actualizarFase(fase.id, {
      actividades: fase.actividades.map((a) => (a.id === actividadId ? { ...a, [key]: value } : a)),
    });
  }

  function eliminarActividad(fase: FaseCronograma, actividadId: string) {
    actualizarFase(fase.id, { actividades: fase.actividades.filter((a) => a.id !== actividadId) });
  }

  async function guardar() {
    if (!plan) return;
    setSaving(true);
    const planes = parsePlanesCalidad(docs[ITEM_KEY] ?? "");
    const actualizados = [...planes.filter((p) => p.id !== plan.id), plan];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    if (user?.id) {
      await otorgarAccesoPorRegistro(createClient() as never, user.id, plan.colaboradoresConAcceso ?? [], "diseno_desarrollo", "planes_calidad");
    }
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminarPlan() {
    if (!plan) return;
    const planes = parsePlanesCalidad(docs[ITEM_KEY] ?? "");
    const restantes = planes.filter((p) => p.id !== plan.id);
    await save(ITEM_KEY, JSON.stringify(restantes));
    router.push(`${basePath}/planes_calidad`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <Link href={`${basePath}/planes_calidad`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Planes de Calidad
        </Link>
        <div className="flex items-center gap-3">
          {!colaborador && (
            <SelectorAccesoColaboradores
              ownerId={user?.id ?? null}
              value={plan.colaboradoresConAcceso ?? []}
              onChange={(ids) => campo("colaboradoresConAcceso", ids)}
            />
          )}
          {!colaborador && (
            <button type="button" onClick={eliminarPlan} className="text-xs text-gray-400 hover:text-red-500">
              Eliminar plan
            </button>
          )}
        </div>
      </div>

      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 overflow-hidden flex flex-col sm:flex-row sm:items-center gap-4">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#14B8A6]/20 rounded-full blur-3xl" />
        <span className="relative z-10 w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl flex-shrink-0">
          📑
        </span>
        <div className="relative z-10 flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white">{plan.nombreProyecto || "Nuevo plan de calidad"}</h1>
          <p className="text-[#14B8A6] font-semibold text-sm">{plan.codigo}</p>
        </div>
        <select
          value={plan.estado}
          onChange={(e) => campo("estado", e.target.value)}
          className="relative z-10 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full text-white border-0 focus:outline-none"
          style={{ backgroundColor: colorEstadoPlanCalidad(plan.estado) }}
        >
          {ESTADOS_PLAN_CALIDAD.map((e) => (
            <option key={e} value={e} style={{ color: "#1A1A1A" }}>{e}</option>
          ))}
        </select>
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">✓ Plan guardado</div>}

      {/* Pestañas */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1.5 w-fit overflow-x-auto">
        {[
          { key: "planes" as Tab, label: "📘 Planes" },
          { key: "organigrama" as Tab, label: "🧩 Organigrama" },
          { key: "manuales" as Tab, label: "📋 Responsabilidades" },
          { key: "obra" as Tab, label: "🏗️ Plan de Gestión de Obra" },
          { key: "cronograma" as Tab, label: "📅 Cronograma del Proyecto" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              tab === t.key ? "bg-[#1A1A1A] text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "planes" && (
        <div className="space-y-4">
      <Seccion numero="1" icono="📘" titulo="Planes">
        <div className="space-y-5">
          <div>
            <label className={labelClass}><span className="text-red-500">*</span> Nombre del proyecto</label>
            <input value={plan.nombreProyecto} onChange={(e) => campo("nombreProyecto", e.target.value)} className={inputClass} placeholder="Ej: Rediseño de envase línea Premium" />
          </div>

          <CampoConAyuda
            label="Introducción"
            value={plan.introduccion}
            onChange={(v) => campo("introduccion", v)}
            ayuda="Describe el contexto del plan de calidad, incluyendo el proyecto, producto o servicio al que aplica, los objetivos de calidad que se pretenden alcanzar y las referencias normativas o estándares que se deben seguir."
          />

          <CampoConAyuda
            label="Alcance"
            value={plan.alcance}
            onChange={(v) => campo("alcance", v)}
            ayuda="Define los límites del plan de calidad, es decir, qué actividades o procesos quedan dentro del alcance del plan y cuáles quedan fuera."
          />

          <CampoConAyuda
            label="Definiciones"
            value={plan.definiciones}
            onChange={(v) => campo("definiciones", v)}
            ayuda="Clarifica los términos técnicos o especializados que se utilizan en el plan de calidad para evitar confusiones o ambigüedades."
          />
        </div>
      </Seccion>

      {/* 2. Objetivos y requisitos */}
      <Seccion numero="2" icono="🎯" titulo="Objetivos y Requisitos de Calidad">
        <div className="space-y-5">
          <CampoConAyuda
            label="Objetivo de calidad"
            value={plan.objetivoCalidad}
            onChange={(v) => campo("objetivoCalidad", v)}
            ayuda="Define los objetivos específicos y medibles que se pretenden alcanzar en términos de calidad del producto o servicio."
          />

          <CampoConAyuda
            label="Requisitos de calidad"
            value={plan.requisitosCalidad}
            onChange={(v) => campo("requisitosCalidad", v)}
            ayuda="Especifica los requisitos detallados que debe cumplir el producto o servicio para alcanzar los objetivos de calidad establecidos. Estos requisitos pueden incluir aspectos como la funcionalidad, el rendimiento, la seguridad, la confiabilidad, la usabilidad y la satisfacción del cliente."
          />
        </div>
      </Seccion>
        </div>
      )}

      {tab === "organigrama" && (
        <OrganigramaEditor
          modulo="diseno_desarrollo"
          itemKeyNodos={`organigrama_plan_${plan.id}`}
          itemKeyConexiones={`organigrama_plan_conexiones_${plan.id}`}
        />
      )}

      {tab === "manuales" && <ManualesProyectoTab userId={user?.id ?? null} planId={plan.id} />}

      {tab === "obra" && <PlanGestionObraTab userId={user?.id ?? null} planId={plan.id} />}

      {tab === "cronograma" && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Responsable del proyecto</label>
              <input value={plan.responsableProyecto} onChange={(e) => campo("responsableProyecto", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nombre de la empresa</label>
              <input value={plan.nombreEmpresa} onChange={(e) => campo("nombreEmpresa", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={plan.fecha} onChange={(e) => campo("fecha", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="space-y-6 pt-2 border-t border-gray-100">
            {plan.fases.map((fase) => (
              <div key={fase.id}>
                <div className="flex items-center justify-between mb-2">
                  <input
                    value={fase.nombre}
                    onChange={(e) => actualizarFase(fase.id, { nombre: e.target.value })}
                    className="text-sm font-bold text-[#1A1A1A] bg-gray-100 rounded-lg px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
                  />
                  {plan.fases.length > 1 && (
                    <button type="button" onClick={() => eliminarFase(fase.id)} className="text-xs text-gray-300 hover:text-red-500">
                      Eliminar fase
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-xs border-collapse min-w-[720px]">
                    <thead>
                      <tr className="bg-gray-50 text-left text-gray-500">
                        <th className="p-2 font-semibold border-b border-gray-100 w-10">N.</th>
                        <th className="p-2 font-semibold border-b border-r border-gray-100">Actividad</th>
                        <th className="p-2 font-semibold border-b border-r border-gray-100">Responsable</th>
                        <th className="p-2 font-semibold border-b border-r border-gray-100">Fecha de inicio</th>
                        <th className="p-2 font-semibold border-b border-r border-gray-100">Fecha de entrega</th>
                        <th className="p-2 font-semibold border-b border-r border-gray-100">Duración</th>
                        <th className="p-2 font-semibold border-b border-r border-gray-100">% completado</th>
                        <th className="p-2 font-semibold border-b border-gray-100 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fase.actividades.map((a, i) => (
                        <tr key={a.id} className="group hover:bg-[#FAFAFA]">
                          <td className="p-2 border-b border-gray-100 text-center text-gray-400 font-semibold">{i + 1}</td>
                          <td className="border-b border-r border-gray-100">
                            <input value={a.actividad} onChange={(e) => actualizarActividad(fase, a.id, "actividad", e.target.value)} className={cellInput} />
                          </td>
                          <td className="border-b border-r border-gray-100">
                            <input value={a.responsable} onChange={(e) => actualizarActividad(fase, a.id, "responsable", e.target.value)} className={cellInput} />
                          </td>
                          <td className="border-b border-r border-gray-100">
                            <input type="date" value={a.fechaInicio} onChange={(e) => actualizarActividad(fase, a.id, "fechaInicio", e.target.value)} className={cellInput} />
                          </td>
                          <td className="border-b border-r border-gray-100">
                            <input type="date" value={a.fechaEntrega} onChange={(e) => actualizarActividad(fase, a.id, "fechaEntrega", e.target.value)} className={cellInput} />
                          </td>
                          <td className="border-b border-r border-gray-100">
                            <input value={a.duracion} onChange={(e) => actualizarActividad(fase, a.id, "duracion", e.target.value)} placeholder="Ej: 5 días" className={cellInput} />
                          </td>
                          <td className="border-b border-r border-gray-100">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={a.porcentajeCompletado}
                              onChange={(e) => actualizarActividad(fase, a.id, "porcentajeCompletado", Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                              onWheel={(e) => e.currentTarget.blur()}
                              className={cellInput}
                            />
                          </td>
                          <td className="border-b border-gray-100 text-center">
                            <button type="button" onClick={() => eliminarActividad(fase, a.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={() => agregarActividad(fase)} className="mt-2 text-xs font-semibold text-[#F5A623] hover:text-[#e09410]">
                  + Agregar actividad
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={agregarFase} className="text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#F5A623]/50">
            + Agregar fase
          </button>
        </div>
      )}

      {(tab === "planes" || tab === "cronograma") && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={guardar}
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-10 py-3 rounded-lg hover:bg-[#e09410] disabled:opacity-60 shadow-lg"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </div>
  );
}
