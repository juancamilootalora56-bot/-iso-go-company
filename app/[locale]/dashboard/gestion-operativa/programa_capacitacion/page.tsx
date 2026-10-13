"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import { parseInventario } from "@/lib/inventario";
import {
  parseCapacitaciones,
  capacitacionVacia,
  colorEstadoCapacitacion,
  colorResultadoCapacitacion,
  estaVencidaCapacitacion,
  costoTotalCapacitaciones,
  horasTotalesCapacitacion,
  cumplimientoPrograma,
  formatoMonto,
  TIPOS_CAPACITACION,
  ESTADOS_CAPACITACION,
  RESULTADOS_CAPACITACION,
  MONEDAS_CAPACITACION,
  type Capacitacion,
} from "@/lib/programaCapacitacion";

const ITEM_KEY = "capacitaciones_lista";
const MAX_CERT_BYTES = 1_500_000; // ~1.5MB

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

export default function ProgramaCapacitacionPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading, save } = useGestionDocumentos("operativa", user?.id ?? null);
  const certFileInputRef = useRef<HTMLInputElement>(null);

  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [capacitacion, setCapacitacion] = useState<Capacitacion>(capacitacionVacia());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) setCapacitaciones(parseCapacitaciones(docs[ITEM_KEY] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const equipos = parseInventario(docs["inventario_lista"] ?? "");
  const editando = capacitaciones.some((c) => c.id === capacitacion.id);

  const totalProgramadas = capacitaciones.filter((c) => c.estado === "Programada" || c.estado === "En curso").length;
  const totalCompletadas = capacitaciones.filter((c) => c.estado === "Completada").length;
  const cumplimiento = cumplimientoPrograma(capacitaciones);
  const horasTotales = horasTotalesCapacitacion(capacitaciones);
  const costoTotal = costoTotalCapacitaciones(capacitaciones);
  const vencidas = capacitaciones.filter((c) => estaVencidaCapacitacion(c)).length;

  function campo<K extends keyof Capacitacion>(key: K, value: Capacitacion[K]) {
    setCapacitacion((c) => ({ ...c, [key]: value }));
  }

  function toggleEquipo(equipoId: string) {
    setCapacitacion((c) => ({
      ...c,
      equiposIds: c.equiposIds.includes(equipoId) ? c.equiposIds.filter((id) => id !== equipoId) : [...c.equiposIds, equipoId],
    }));
  }

  function nombreEquipo(id: string) {
    return equipos.find((e) => e.id === id)?.nombre ?? "—";
  }

  function limpiar() {
    setCapacitacion(capacitacionVacia());
    setError(null);
    if (certFileInputRef.current) certFileInputRef.current.value = "";
  }

  function editar(c: Capacitacion) {
    setCapacitacion({ ...c, equiposIds: [...c.equiposIds] });
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCertificado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_CERT_BYTES) {
      setError("El archivo es muy pesado. Usá uno de menos de 1.5MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setCapacitacion((c) => ({ ...c, certificado: reader.result as string, certificadoNombre: file.name }));
    };
    reader.readAsDataURL(file);
  }

  async function guardar() {
    if (!capacitacion.tema.trim()) {
      setError("Ingresá el tema de la capacitación.");
      return;
    }
    setError(null);
    setSaving(true);
    const actualizadas = [...capacitaciones.filter((c) => c.id !== capacitacion.id), capacitacion];
    await save(ITEM_KEY, JSON.stringify(actualizadas));
    setCapacitaciones(actualizadas);
    limpiar();
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    setSaving(true);
    const actualizadas = capacitaciones.filter((c) => c.id !== id);
    await save(ITEM_KEY, JSON.stringify(actualizadas));
    setCapacitaciones(actualizadas);
    if (capacitacion.id === id) limpiar();
    setSaving(false);
  }

  const ordenadas = [...capacitaciones].sort((a, b) => (b.fechaProgramada || "").localeCompare(a.fechaProgramada || ""));

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión Operativa
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Programa de Capacitación</h1>
        <p className="text-gray-500 text-sm mt-1">Formación sobre máquinas, equipos y herramientas de la empresa.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">📋</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{capacitaciones.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total registros</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🗓️</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{totalProgramadas}</p>
          <p className="text-xs text-gray-500 mt-0.5">Programadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">✅</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{totalCompletadas}</p>
          <p className="text-xs text-gray-500 mt-0.5">Completadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">📊</p>
          <p className="text-lg font-bold" style={{ color: cumplimiento === null ? "#9CA3AF" : cumplimiento >= 80 ? "#22C55E" : cumplimiento >= 50 ? "#F5A623" : "#EF4444" }}>
            {cumplimiento !== null ? `${cumplimiento}%` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Cumplimiento</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">⏱️</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{horasTotales}h</p>
          <p className="text-xs text-gray-500 mt-0.5">Horas dictadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">⚠️</p>
          <p className={`text-lg font-bold ${vencidas > 0 ? "text-red-500" : "text-[#1A1A1A]"}`}>{vencidas}</p>
          <p className="text-xs text-gray-500 mt-0.5">Vencidas</p>
        </div>
      </div>
      {costoTotal > 0 && (
        <p className="text-xs text-gray-500">💰 Costo total invertido: <strong className="text-[#1A1A1A]">{formatoMonto(costoTotal)}</strong></p>
      )}

      {/* Formulario */}
      <Seccion icono="🎓" titulo={editando ? "Editando capacitación" : "Nueva capacitación"}>
        <div className="space-y-4">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Capacitación guardada</div>}

          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Tema de la capacitación</label>
              <input value={capacitacion.tema} onChange={(e) => campo("tema", e.target.value)} placeholder="Ej: Manejo seguro de torno CNC" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tipo</label>
              <select value={capacitacion.tipo} onChange={(e) => campo("tipo", e.target.value)} className={inputClass}>
                {TIPOS_CAPACITACION.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Máquinas / equipos / herramientas relacionadas</label>
            {equipos.length === 0 ? (
              <p className="text-xs text-gray-400">
                No hay ítems en el{" "}
                <Link href={`${basePath}/inscripcion_inventario`} className="text-[#F5A623] font-semibold hover:text-[#e09410]">
                  Inventario
                </Link>{" "}
                todavía. Podés guardar la capacitación igual y vincularla después.
              </p>
            ) : (
              <div className="bg-[#FAFAFA] rounded-lg border border-gray-100 p-2.5 max-h-36 overflow-y-auto grid sm:grid-cols-2 gap-1">
                {equipos.map((eq) => (
                  <label key={eq.id} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer py-0.5">
                    <input type="checkbox" checked={capacitacion.equiposIds.includes(eq.id)} onChange={() => toggleEquipo(eq.id)} className="accent-[#F5A623]" />
                    {eq.nombre} <span className="text-gray-400">· {eq.tipo}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-4 gap-2.5">
            <div>
              <label className={labelClass}>Fecha programada</label>
              <input type="date" value={capacitacion.fechaProgramada} onChange={(e) => campo("fechaProgramada", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha realizada</label>
              <input type="date" value={capacitacion.fechaRealizada} onChange={(e) => campo("fechaRealizada", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select value={capacitacion.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                {ESTADOS_CAPACITACION.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Resultado</label>
              <select value={capacitacion.resultado} onChange={(e) => campo("resultado", e.target.value)} className={inputClass}>
                {RESULTADOS_CAPACITACION.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Responsable interno</label>
              <input value={capacitacion.responsable} onChange={(e) => campo("responsable", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Proveedor / capacitador externo</label>
              <input value={capacitacion.proveedor} onChange={(e) => campo("proveedor", e.target.value)} placeholder="Opcional" className={inputClass} />
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-2.5">
            <div>
              <label className={labelClass}>Duración (horas)</label>
              <input
                type="number"
                min={0}
                value={capacitacion.duracionHoras || ""}
                onChange={(e) => campo("duracionHoras", Math.max(0, Number(e.target.value) || 0))}
                onWheel={(e) => e.currentTarget.blur()}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Cantidad de participantes</label>
              <input
                type="number"
                min={0}
                value={capacitacion.cantidadParticipantes || ""}
                onChange={(e) => campo("cantidadParticipantes", Math.max(0, Number(e.target.value) || 0))}
                onWheel={(e) => e.currentTarget.blur()}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Costo</label>
              <input
                type="number"
                min={0}
                value={capacitacion.costo || ""}
                onChange={(e) => campo("costo", Math.max(0, Number(e.target.value) || 0))}
                onWheel={(e) => e.currentTarget.blur()}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Moneda</label>
              <select value={capacitacion.moneda} onChange={(e) => campo("moneda", e.target.value)} className={inputClass}>
                {MONEDAS_CAPACITACION.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Participantes (opcional)</label>
            <input value={capacitacion.participantes} onChange={(e) => campo("participantes", e.target.value)} placeholder="Nombres, separados por coma" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Certificado / constancia (opcional)</label>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => certFileInputRef.current?.click()}
                className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410] bg-white border border-gray-200 px-3 py-1.5 rounded-lg"
              >
                📎 Subir archivo
              </button>
              <input ref={certFileInputRef} type="file" accept="image/*,.pdf" onChange={handleCertificado} className="hidden" />
              {capacitacion.certificado && <span className="text-xs text-gray-500 truncate max-w-[200px]">{capacitacion.certificadoNombre || "Archivo cargado"}</span>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea value={capacitacion.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button onClick={guardar} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
              {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar capacitación"}
            </button>
            <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
              {editando ? "Nueva en blanco" : "Limpiar"}
            </button>
          </div>
        </div>
      </Seccion>

      {/* Registro */}
      <Seccion icono="🗂️" titulo="Capacitaciones Registradas">
        {ordenadas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no cargaste ninguna capacitación.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2.5 font-semibold border-b border-gray-100">Tema</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Equipos</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Fecha</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Estado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Responsable</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Resultado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Costo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody>
                {ordenadas.map((c) => {
                  const vencida = estaVencidaCapacitacion(c);
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                      <td className="p-2.5 font-medium text-[#1A1A1A] max-w-[180px] truncate">{c.tema}</td>
                      <td className="p-2.5 text-gray-600 max-w-[180px] truncate">
                        {c.equiposIds.length > 0 ? c.equiposIds.map((id) => nombreEquipo(id)).join(", ") : "—"}
                      </td>
                      <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(c.fechaRealizada || c.fechaProgramada)}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: vencida ? "#EF4444" : colorEstadoCapacitacion(c.estado) }}>
                          {vencida ? "Vencida" : c.estado}
                        </span>
                      </td>
                      <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.responsable || "—"}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorResultadoCapacitacion(c.resultado) }}>
                          {c.resultado}
                        </span>
                      </td>
                      <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.costo > 0 ? formatoMonto(c.costo) : "—"}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <button onClick={() => editar(c)} className="text-[#F5A623] font-semibold hover:text-[#e09410] mr-2">Editar</button>
                        <button onClick={() => eliminar(c.id)} className="text-gray-300 hover:text-red-500">Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>
    </div>
  );
}
