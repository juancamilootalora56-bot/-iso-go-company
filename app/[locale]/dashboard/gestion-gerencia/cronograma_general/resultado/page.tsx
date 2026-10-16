"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import EncabezadoDocumento from "@/components/dashboard/EncabezadoDocumento";
import {
  parseCronograma,
  generarCalendario,
  generarTareasIniciales,
  tareaVacia,
  diasLaborablesEnRango,
  duracionDias,
  resumenGeneral,
  MODULOS_SISTEMA,
  type TareaCronograma,
} from "@/lib/cronogramaGeneral";

const ITEM_KEY = "cronograma_general";
const NARANJA = "#6366F1";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#6366F1] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";
const celdaInput =
  "w-full bg-transparent border-0 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1] rounded px-1 py-1 text-xs text-[#1A1A1A]";

const COL_NUMERO = 46;
const COL_TITULO = 210;
const DIA_PX = 22;

export default function CronogramaGeneralPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const guardado = useMemo(() => parseCronograma(docs[ITEM_KEY] ?? ""), [docs]);
  const [draft, setDraft] = useState<ReturnType<typeof parseCronograma> | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cronograma = draft ?? guardado;

  const calendario = useMemo(() => generarCalendario(cronograma.fechaInicioCronograma, 6), [cronograma.fechaInicioCronograma]);
  const resumen = useMemo(() => resumenGeneral(cronograma.tareas), [cronograma.tareas]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  function actualizarCabecera(cambios: Partial<typeof cronograma>) {
    setDraft({ ...cronograma, ...cambios });
    setMensaje("");
  }

  function actualizarTarea(id: string, cambios: Partial<TareaCronograma>) {
    setDraft({
      ...cronograma,
      tareas: cronograma.tareas.map((t) => {
        if (t.id !== id) return t;
        const nueva = { ...t, ...cambios };
        if (cambios.fechaInicio !== undefined || cambios.fechaFin !== undefined) {
          if (nueva.fechaInicio && nueva.fechaFin) {
            nueva.diasPintados = diasLaborablesEnRango(nueva.fechaInicio, nueva.fechaFin);
          }
        }
        return nueva;
      }),
    });
    setMensaje("");
  }

  function cambiarDuracion(id: string, dias: number) {
    const tarea = cronograma.tareas.find((t) => t.id === id);
    if (!tarea || !tarea.fechaInicio || dias < 1) return;
    const inicio = new Date(tarea.fechaInicio + "T00:00:00");
    inicio.setDate(inicio.getDate() + (dias - 1));
    const fechaFin = inicio.toISOString().slice(0, 10);
    actualizarTarea(id, { fechaFin });
  }

  function toggleDia(id: string, fecha: string) {
    setDraft({
      ...cronograma,
      tareas: cronograma.tareas.map((t) => {
        if (t.id !== id) return t;
        const yaPintado = t.diasPintados.includes(fecha);
        return { ...t, diasPintados: yaPintado ? t.diasPintados.filter((d) => d !== fecha) : [...t.diasPintados, fecha].sort() };
      }),
    });
    setMensaje("");
  }

  function agregarTarea(moduloKey: string) {
    const numero = cronograma.tareas.filter((t) => t.moduloKey === moduloKey).length + 1;
    setDraft({ ...cronograma, tareas: [...cronograma.tareas, tareaVacia(moduloKey, numero)] });
  }

  function eliminarTarea(id: string) {
    if (!confirm("¿Eliminar esta tarea del cronograma?")) return;
    setDraft({ ...cronograma, tareas: cronograma.tareas.filter((t) => t.id !== id) });
  }

  function regenerarTareas() {
    if (!confirm("Esto reemplaza todas las tareas actuales por las actividades estándar del sistema, recalculadas desde la fecha de inicio. ¿Continuar?")) return;
    setDraft({ ...cronograma, tareas: generarTareasIniciales(cronograma.fechaInicioCronograma) });
  }

  async function guardar() {
    setGuardando(true);
    await save(ITEM_KEY, JSON.stringify(cronograma));
    setDraft(null);
    setGuardando(false);
    setMensaje("Guardado ✓");
    setTimeout(() => setMensaje(""), 2500);
  }

  const totalColumnasDias = calendario.reduce((sum, m) => sum + m.semanas.length * 5, 0);
  const anchoGrilla = totalColumnasDias * DIA_PX;

  return (
    <div className="max-w-full space-y-4 pb-16">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de la Gerencia
      </Link>

      {/* Encabezado */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <EncabezadoDocumento />
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Título del cronograma</label>
            <input value={cronograma.titulo} onChange={(e) => actualizarCabecera({ titulo: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Responsable general</label>
            <input value={cronograma.responsableGeneral} onChange={(e) => actualizarCabecera({ responsableGeneral: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fecha de inicio del cronograma (6 meses desde acá)</label>
            <input
              type="date"
              value={cronograma.fechaInicioCronograma}
              onChange={(e) => actualizarCabecera({ fechaInicioCronograma: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
          <span className="text-lg font-bold text-[#1A1A1A]">{resumen.total}</span>
          <span className="text-xs text-gray-500 ml-1.5">tareas</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
          <span className="text-lg font-bold" style={{ color: resumen.promedioAvance >= 80 ? "#22C55E" : resumen.promedioAvance >= 40 ? "#F5A623" : "#9CA3AF" }}>
            {resumen.promedioAvance}%
          </span>
          <span className="text-xs text-gray-500 ml-1.5">avance promedio</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
          <span className="text-lg font-bold text-[#1A1A1A]">{resumen.modulosConTareas}</span>
          <span className="text-xs text-gray-500 ml-1.5">módulos</span>
        </div>
        <button onClick={regenerarTareas} className="text-xs font-semibold text-gray-400 hover:text-[#1A1A1A]">
          ↺ Regenerar actividades estándar del sistema
        </button>
      </div>

      <p className="text-xs text-gray-400 max-w-2xl">
        Cada tarea se pinta en el calendario de dos formas: escribiendo fecha de inicio y fin (se rellenan solas las
        semanas que correspondan), o haciendo clic directo sobre los días del calendario para ajustarlo a mano.
      </p>

      {/* Gantt */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="border-collapse" style={{ minWidth: COL_NUMERO + COL_TITULO + 560 + anchoGrilla }}>
          <thead>
            {/* Fila de meses */}
            <tr>
              <th className="sticky left-0 z-20 bg-[#FAFAFA]" style={{ minWidth: COL_NUMERO, width: COL_NUMERO }} rowSpan={3} />
              <th className="sticky z-20 bg-[#FAFAFA] text-[10px] font-bold uppercase text-gray-500 text-left px-2" style={{ left: COL_NUMERO, minWidth: COL_TITULO, width: COL_TITULO }} rowSpan={3}>
                Título de la tarea
              </th>
              <th className="text-[10px] font-bold uppercase text-gray-500 text-left px-2 bg-[#FAFAFA]" style={{ minWidth: 130 }} rowSpan={3}>
                Responsable
              </th>
              <th className="text-[10px] font-bold uppercase text-gray-500 px-2 bg-[#FAFAFA]" style={{ minWidth: 110 }} rowSpan={3}>
                Inicio
              </th>
              <th className="text-[10px] font-bold uppercase text-gray-500 px-2 bg-[#FAFAFA]" style={{ minWidth: 110 }} rowSpan={3}>
                Entrega
              </th>
              <th className="text-[10px] font-bold uppercase text-gray-500 px-2 bg-[#FAFAFA]" style={{ minWidth: 80 }} rowSpan={3}>
                Días
              </th>
              <th className="text-[10px] font-bold uppercase text-gray-500 px-2 bg-[#FAFAFA]" style={{ minWidth: 90 }} rowSpan={3}>
                % Completado
              </th>
              <th className="text-[10px] font-bold uppercase text-gray-500 px-2 bg-[#FAFAFA]" style={{ minWidth: 40 }} rowSpan={3} />
              {calendario.map((mes) => (
                <th key={mes.nombre} colSpan={mes.semanas.length * 5} className="text-[10px] font-bold uppercase text-white text-center py-1.5" style={{ backgroundColor: "#1A1A1A" }}>
                  {mes.nombre}
                </th>
              ))}
            </tr>
            {/* Fila de semanas */}
            <tr>
              {calendario.map((mes) =>
                mes.semanas.map((semana) => (
                  <th key={`${mes.nombre}-${semana.numero}`} colSpan={5} className="text-[9px] font-bold uppercase text-white text-center py-1" style={{ backgroundColor: NARANJA }}>
                    Semana {semana.numero}
                  </th>
                ))
              )}
            </tr>
            {/* Fila de días */}
            <tr>
              {calendario.map((mes) =>
                mes.semanas.map((semana) =>
                  semana.dias.map((dia) => (
                    <th key={dia.fecha} className="text-[9px] font-bold text-gray-400 text-center py-1 border-b border-gray-200 bg-[#FAFAFA]" style={{ minWidth: DIA_PX, width: DIA_PX }}>
                      {dia.letra}
                    </th>
                  ))
                )
              )}
            </tr>
          </thead>
          <tbody>
            {MODULOS_SISTEMA.map((modulo) => {
              const tareasModulo = cronograma.tareas.filter((t) => t.moduloKey === modulo.key);
              return (
                <RenderModulo
                  key={modulo.key}
                  moduloKey={modulo.key}
                  color={modulo.color}
                  label={modulo.label}
                  tareas={tareasModulo}
                  calendario={calendario}
                  totalColumnasDias={totalColumnasDias}
                  onActualizar={actualizarTarea}
                  onDuracion={cambiarDuracion}
                  onToggleDia={toggleDia}
                  onEliminar={eliminarTarea}
                  onAgregar={() => agregarTarea(modulo.key)}
                />
              );
            })}

            {/* Tareas sin módulo reconocido (por si quedan de una versión anterior) */}
            {cronograma.tareas.some((t) => !MODULOS_SISTEMA.some((m) => m.key === t.moduloKey)) && (
              <RenderModulo
                moduloKey="otros"
                color="#9CA3AF"
                label="Otras actividades"
                tareas={cronograma.tareas.filter((t) => !MODULOS_SISTEMA.some((m) => m.key === t.moduloKey))}
                calendario={calendario}
                totalColumnasDias={totalColumnasDias}
                onActualizar={actualizarTarea}
                onDuracion={cambiarDuracion}
                onToggleDia={toggleDia}
                onEliminar={eliminarTarea}
                onAgregar={() => agregarTarea("otros")}
              />
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3">
        {mensaje && <span className="text-xs text-green-600 font-semibold">{mensaje}</span>}
        <button onClick={guardar} disabled={guardando} className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50">
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

function RenderModulo({
  moduloKey,
  color,
  label,
  tareas,
  calendario,
  totalColumnasDias,
  onActualizar,
  onDuracion,
  onToggleDia,
  onEliminar,
  onAgregar,
}: {
  moduloKey: string;
  color: string;
  label: string;
  tareas: TareaCronograma[];
  calendario: ReturnType<typeof generarCalendario>;
  totalColumnasDias: number;
  onActualizar: (id: string, cambios: Partial<TareaCronograma>) => void;
  onDuracion: (id: string, dias: number) => void;
  onToggleDia: (id: string, fecha: string) => void;
  onEliminar: (id: string) => void;
  onAgregar: () => void;
}) {
  return (
    <>
      <tr>
        <td colSpan={8 + totalColumnasDias} className="p-0 sticky left-0 z-10">
          <div className="flex items-center gap-2 px-2 py-1.5" style={{ backgroundColor: `${color}22`, borderLeft: `4px solid ${color}` }}>
            <span className="text-xs font-bold" style={{ color }}>
              {label}
            </span>
            <span className="text-[10px] text-gray-400">· {tareas.length}</span>
            <button onClick={onAgregar} className="text-[10px] font-semibold hover:opacity-80 ml-2" style={{ color }}>
              + Agregar tarea
            </button>
          </div>
        </td>
      </tr>
      {tareas.map((t) => {
        const dur = duracionDias(t.fechaInicio, t.fechaFin);
        return (
          <tr key={t.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]/60">
            <td className="sticky left-0 bg-white z-10 text-center text-[11px] font-bold text-gray-400 border-r border-gray-50" style={{ minWidth: COL_NUMERO, width: COL_NUMERO }}>
              {t.numero}
            </td>
            <td className="sticky bg-white z-10 border-r border-gray-50" style={{ left: COL_NUMERO, minWidth: COL_TITULO, width: COL_TITULO }}>
              <input value={t.titulo} onChange={(e) => onActualizar(t.id, { titulo: e.target.value })} placeholder="Título de la tarea" className={celdaInput + " font-medium"} />
            </td>
            <td>
              <input value={t.responsable} onChange={(e) => onActualizar(t.id, { responsable: e.target.value })} placeholder="Responsable" className={celdaInput} />
            </td>
            <td>
              <input type="date" value={t.fechaInicio} onChange={(e) => onActualizar(t.id, { fechaInicio: e.target.value })} className={celdaInput} />
            </td>
            <td>
              <input type="date" value={t.fechaFin} onChange={(e) => onActualizar(t.id, { fechaFin: e.target.value })} className={celdaInput} />
            </td>
            <td>
              <input
                type="number"
                min={0}
                value={dur}
                onChange={(e) => onDuracion(t.id, Math.max(1, Number(e.target.value) || 1))}
                onWheel={(e) => e.currentTarget.blur()}
                className={celdaInput + " text-center"}
              />
            </td>
            <td>
              <input
                type="number"
                min={0}
                max={100}
                value={t.porcentaje}
                onChange={(e) => onActualizar(t.id, { porcentaje: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                onWheel={(e) => e.currentTarget.blur()}
                className={celdaInput + " text-center"}
              />
            </td>
            <td className="text-center">
              <button onClick={() => onEliminar(t.id)} className="text-red-300 hover:text-red-600 text-xs">
                ✕
              </button>
            </td>
            {calendario.map((mes) =>
              mes.semanas.map((semana) =>
                semana.dias.map((dia) => {
                  const pintado = t.diasPintados.includes(dia.fecha);
                  return (
                    <td
                      key={dia.fecha}
                      onClick={() => onToggleDia(t.id, dia.fecha)}
                      className="border-l border-gray-50 cursor-pointer"
                      style={{ minWidth: DIA_PX, width: DIA_PX, height: 30, backgroundColor: pintado ? color : "transparent" }}
                      title={dia.fecha}
                    />
                  );
                })
              )
            )}
          </tr>
        );
      })}
    </>
  );
}
