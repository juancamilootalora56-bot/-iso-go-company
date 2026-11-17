"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parseOportunidadesMejora,
  oportunidadMejoraVacia,
  eventoOMVacio,
  siguienteRadicadoOM,
  numeroDeRadicadoOM,
  colorEstadoOM,
  colorResultadoVerificacionOM,
  estaAbiertaOM,
  prioridadOM,
  diasAbiertaOM,
  tiempoPromedioCicloOM,
  tasaEfectividadOM,
  ORIGENES_OM,
  NIVELES_OM,
  RESULTADOS_VERIFICACION_OM,
  ESTADOS_OM,
  type OportunidadMejora,
  type EventoOM,
} from "@/lib/oportunidadesMejora";
import {
  Lightbulb,
  Flame,
  Zap,
  Clock3,
  Target,
  Search,
  Compass,
  ClipboardList,
  Rocket,
  CheckCircle2,
  Flag,
  NotebookPen,
  ChevronLeft,
  ChevronRight,
  Check,
  Pencil,
  Trash2,
  Paperclip,
  X,
} from "lucide-react";

const ITEM_KEY = "oportunidades_mejora_lista";
const MAX_EVID_BYTES = 1_500_000; // ~1.5MB
const NARANJA = "#F97316";
const ACENTO = "#6D28D9"; // violeta tecnológico para el hero y el stepper

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#6D28D9] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const FILAS_IMPACTO = ["Alto", "Medio", "Bajo"];
const COLUMNAS_ESFUERZO = ["Bajo", "Medio", "Alto"];

type PasoKey = "identificacion" | "priorizacion" | "planificar" | "hacer" | "verificar" | "actuar" | "seguimiento";

const PASOS: { key: PasoKey; label: string; icono: typeof Search }[] = [
  { key: "identificacion", label: "Identificación", icono: Search },
  { key: "priorizacion", label: "Priorización", icono: Compass },
  { key: "planificar", label: "Planificar", icono: ClipboardList },
  { key: "hacer", label: "Hacer", icono: Rocket },
  { key: "verificar", label: "Verificar", icono: CheckCircle2 },
  { key: "actuar", label: "Actuar", icono: Flag },
  { key: "seguimiento", label: "Seguimiento", icono: NotebookPen },
];

function fechaHoraLegible(iso: string) {
  try {
    return new Date(iso).toLocaleString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function AnilloProgreso({ valor, color, label, sufijo = "%" }: { valor: number | null; color: string; label: string; sufijo?: string }) {
  const pct = valor === null ? 0 : Math.max(0, Math.min(100, valor));
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <svg width="64" height="64" viewBox="0 0 64 64" className="flex-shrink-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="-ml-[52px] w-11 text-center">
        <span className="text-sm font-bold text-white">{valor !== null ? `${valor}${sufijo}` : "—"}</span>
      </div>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

export default function OportunidadesMejoraPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const evidFileInputRef = useRef<HTMLInputElement>(null);

  const [casos, setCasos] = useState<OportunidadMejora[]>([]);
  const [caso, setCaso] = useState<OportunidadMejora>(oportunidadMejoraVacia("OM-0001"));
  const [notaNueva, setNotaNueva] = useState("");
  const [autorNota, setAutorNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    if (!loading) {
      const cargados = parseOportunidadesMejora(docs[ITEM_KEY] ?? "");
      setCasos(cargados);
      setCaso(oportunidadMejoraVacia(siguienteRadicadoOM(cargados.map((c) => numeroDeRadicadoOM(c.radicado)))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = casos.some((c) => c.id === caso.id);
  const abiertas = casos.filter((c) => estaAbiertaOM(c.estado)).length;
  const cicloPromedio = tiempoPromedioCicloOM(casos);
  const efectividad = tasaEfectividadOM(casos);
  const victoriasRapidas = casos.filter((c) => prioridadOM(c.impacto, c.esfuerzo).orden === 1 && estaAbiertaOM(c.estado)).length;

  function campo<K extends keyof OportunidadMejora>(key: K, value: OportunidadMejora[K]) {
    setCaso((c) => ({ ...c, [key]: value }));
  }

  function limpiar() {
    setCaso(oportunidadMejoraVacia(siguienteRadicadoOM(casos.map((c) => numeroDeRadicadoOM(c.radicado)))));
    setError(null);
    setPaso(0);
    if (evidFileInputRef.current) evidFileInputRef.current.value = "";
  }

  function editar(c: OportunidadMejora) {
    setCaso({ ...c, bitacora: c.bitacora.map((b) => ({ ...b })) });
    setError(null);
    setPaso(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEvidencia(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_EVID_BYTES) {
      setError("El archivo es muy pesado. Usá uno de menos de 1.5MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setCaso((c) => ({ ...c, evidenciaArchivo: reader.result as string, evidenciaArchivoNombre: file.name }));
    reader.readAsDataURL(file);
  }

  function agregarNota() {
    if (!notaNueva.trim()) return;
    setCaso((c) => ({ ...c, bitacora: [...c.bitacora, eventoOMVacio(notaNueva.trim(), autorNota.trim() || "Sin especificar")] }));
    setNotaNueva("");
  }

  function quitarNota(id: string) {
    setCaso((c) => ({ ...c, bitacora: c.bitacora.filter((b) => b.id !== id) }));
  }

  async function guardar() {
    if (!caso.titulo.trim() || !caso.descripcion.trim()) {
      setError("Título y descripción son obligatorios.");
      setPaso(0);
      return;
    }
    setError(null);
    setSaving(true);
    const actualizados = [...casos.filter((c) => c.id !== caso.id), caso];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setCasos(actualizados);
    limpiar();
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    setSaving(true);
    const restantes = casos.filter((c) => c.id !== id);
    await save(ITEM_KEY, JSON.stringify(restantes));
    setCasos(restantes);
    if (caso.id === id) limpiar();
    setSaving(false);
  }

  const prioridadActual = prioridadOM(caso.impacto, caso.esfuerzo);
  const pasoActual = PASOS[paso];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Gestión de Calidad
        </Link>
        <Link
          href={`${basePath}/oportunidades_mejora/matriz`}
          className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-lg hover:opacity-90"
          style={{ backgroundColor: ACENTO }}
        >
          <Compass size={14} /> Ver matriz de priorización →
        </Link>
      </div>

      {/* Hero */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${ACENTO}40` }} />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#C4B5FD" }}>
            Ciclo PHVA · ISO 9001 cl. 10.1 / 10.3
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Gestión de Oportunidades de Mejora</h1>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            Planificar–Hacer–Verificar–Actuar, de punta a punta, con priorización visual por impacto y esfuerzo.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <Lightbulb size={16} style={{ color: "#C4B5FD" }} className="mb-1.5" />
              <p className="text-xl font-bold text-white">{casos.length}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Oportunidades totales</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <Flame size={16} style={{ color: "#F5A623" }} className="mb-1.5" />
              <p className="text-xl font-bold text-white">{abiertas}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">En curso</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <Zap size={16} style={{ color: "#22C55E" }} className="mb-1.5" />
              <p className="text-xl font-bold" style={{ color: victoriasRapidas > 0 ? "#22C55E" : "#FFFFFF" }}>{victoriasRapidas}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Victorias rápidas</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <Clock3 size={16} style={{ color: "#38BDF8" }} className="mb-1.5" />
              <p className="text-xl font-bold text-white">{cicloPromedio !== null ? `${cicloPromedio}d` : "—"}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Ciclo promedio</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
            <Target size={14} style={{ color: efectividad === null ? "#9CA3AF" : efectividad >= 70 ? "#22C55E" : efectividad >= 40 ? "#F5A623" : "#EF4444" }} />
            <AnilloProgreso
              valor={efectividad}
              color={efectividad === null ? "#9CA3AF" : efectividad >= 70 ? "#22C55E" : efectividad >= 40 ? "#F5A623" : "#EF4444"}
              label="Tasa de efectividad de las mejoras verificadas"
            />
          </div>
        </div>
      </div>

      {/* Wizard */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 sm:px-8 pt-6 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: ACENTO }}>
              {editando ? `Editando ${caso.radicado}` : `Nueva oportunidad · ${caso.radicado}`}
            </span>
            {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
            {success && <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><Check size={13} /> Guardada</span>}
          </div>

          {/* Stepper */}
          <div className="flex items-center overflow-x-auto pb-1 -mx-1 px-1">
            {PASOS.map((p, i) => {
              const Icono = p.icono;
              const activo = i === paso;
              const completado = i < paso;
              return (
                <Fragment key={p.key}>
                  {i > 0 && (
                    <div
                      className="h-0.5 flex-1 min-w-[16px] mx-1"
                      style={{ backgroundColor: completado || activo ? ACENTO : "#E5E7EB" }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setPaso(i)}
                    className="flex flex-col items-center gap-1 flex-shrink-0 group"
                    title={p.label}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0"
                      style={{
                        backgroundColor: activo || completado ? ACENTO : "#fff",
                        borderColor: activo || completado ? ACENTO : "#E5E7EB",
                        color: activo || completado ? "#fff" : "#9CA3AF",
                      }}
                    >
                      {completado ? <Check size={15} /> : <Icono size={15} />}
                    </span>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wide hidden sm:block whitespace-nowrap"
                      style={{ color: activo ? ACENTO : "#9CA3AF" }}
                    >
                      {p.label}
                    </span>
                  </button>
                </Fragment>
              );
            })}
          </div>
        </div>

        <div className="px-5 sm:px-8 pb-6 pt-2">
          {/* Paso: Identificación */}
          {pasoActual.key === "identificacion" && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}><span className="text-red-500">*</span> Título</label>
                <input value={caso.titulo} onChange={(e) => campo("titulo", e.target.value)} className={inputClass} placeholder="Ej: Reducir tiempo de respuesta a reclamos" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Origen</label>
                  <select value={caso.origen} onChange={(e) => campo("origen", e.target.value)} className={inputClass}>
                    {ORIGENES_OM.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Proceso / área</label>
                  <input value={caso.procesoArea} onChange={(e) => campo("procesoArea", e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}><span className="text-red-500">*</span> Descripción</label>
                <textarea value={caso.descripcion} onChange={(e) => campo("descripcion", e.target.value)} rows={3} className={`${inputClass} resize-y`} />
              </div>
              <div>
                <label className={labelClass}>Beneficio esperado</label>
                <textarea value={caso.beneficioEsperado} onChange={(e) => campo("beneficioEsperado", e.target.value)} rows={2} className={`${inputClass} resize-y`} placeholder="Cualitativo y/o cuantitativo" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Fecha de identificación</label>
                  <input type="date" value={caso.fechaIdentificacion} onChange={(e) => campo("fechaIdentificacion", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Identificado por</label>
                  <input value={caso.identificadoPor} onChange={(e) => campo("identificadoPor", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* Paso: Priorización — matriz interactiva */}
          {pasoActual.key === "priorizacion" && (
            <div>
              <p className="text-sm text-gray-500 mb-4">Tocá la celda que mejor describe esta oportunidad. Define impacto y esfuerzo a la vez.</p>
              <div className="flex">
                <div className="flex items-center justify-center mr-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide [writing-mode:vertical-rl] rotate-180">Impacto</span>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-2 mb-1.5 pl-0">
                    {COLUMNAS_ESFUERZO.map((esf) => (
                      <div key={esf} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        Esfuerzo {esf}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {FILAS_IMPACTO.map((imp) => (
                      <div key={imp} className="grid grid-cols-3 gap-2">
                        {COLUMNAS_ESFUERZO.map((esf) => {
                          const p = prioridadOM(imp, esf);
                          const activa = caso.impacto === imp && caso.esfuerzo === esf;
                          return (
                            <button
                              key={esf}
                              type="button"
                              onClick={() => setCaso((c) => ({ ...c, impacto: imp, esfuerzo: esf }))}
                              className="relative rounded-xl border-2 p-3 text-left transition-all min-h-[64px]"
                              style={{
                                backgroundColor: activa ? p.color : `${p.color}12`,
                                borderColor: activa ? p.color : `${p.color}35`,
                                transform: activa ? "scale(1.03)" : undefined,
                                boxShadow: activa ? `0 8px 20px -6px ${p.color}80` : undefined,
                              }}
                            >
                              {activa && <Check size={13} className="absolute top-2 right-2 text-white" />}
                              <p className="text-[10px] font-bold uppercase tracking-wide leading-tight" style={{ color: activa ? "#fff" : p.color }}>
                                {p.etiqueta}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs text-gray-400">Prioridad resultante:</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: prioridadActual.color }}>
                  {prioridadActual.etiqueta}
                </span>
              </div>
            </div>
          )}

          {/* Paso: Planificar */}
          {pasoActual.key === "planificar" && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Acción propuesta</label>
                <textarea value={caso.accionPropuesta} onChange={(e) => campo("accionPropuesta", e.target.value)} rows={3} className={`${inputClass} resize-y`} />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Responsable</label>
                  <input value={caso.responsable} onChange={(e) => campo("responsable", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Recursos necesarios</label>
                  <input value={caso.recursosNecesarios} onChange={(e) => campo("recursosNecesarios", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha planeada</label>
                  <input type="date" value={caso.fechaPlaneada} onChange={(e) => campo("fechaPlaneada", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* Paso: Hacer */}
          {pasoActual.key === "hacer" && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Fecha de ejecución</label>
                  <input type="date" value={caso.fechaEjecucion} onChange={(e) => campo("fechaEjecucion", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Evidencia (texto)</label>
                  <input value={caso.evidenciaEjecucion} onChange={(e) => campo("evidenciaEjecucion", e.target.value)} className={inputClass} placeholder="Qué se hizo concretamente" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Archivo de evidencia</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => evidFileInputRef.current?.click()} className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#6D28D9]/50">
                    <Paperclip size={13} /> {caso.evidenciaArchivoNombre ? "Cambiar archivo" : "Adjuntar archivo"}
                  </button>
                  {caso.evidenciaArchivoNombre && <p className="text-xs text-gray-500 truncate">{caso.evidenciaArchivoNombre}</p>}
                </div>
                <input ref={evidFileInputRef} type="file" accept="image/*,.pdf" onChange={handleEvidencia} className="hidden" />
              </div>
            </div>
          )}

          {/* Paso: Verificar */}
          {pasoActual.key === "verificar" && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Fecha de verificación</label>
                  <input type="date" value={caso.fechaVerificacion} onChange={(e) => campo("fechaVerificacion", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Indicador de verificación</label>
                  <input value={caso.indicadorVerificacion} onChange={(e) => campo("indicadorVerificacion", e.target.value)} className={inputClass} placeholder="Qué se midió para confirmar el resultado" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Resultado</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {RESULTADOS_VERIFICACION_OM.map((r) => {
                    const color = colorResultadoVerificacionOM(r);
                    const activo = caso.resultadoVerificacion === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => campo("resultadoVerificacion", r)}
                        className="rounded-lg border-2 px-3 py-2 text-xs font-bold transition-all"
                        style={{
                          backgroundColor: activo ? color : `${color}12`,
                          borderColor: activo ? color : `${color}35`,
                          color: activo ? "#fff" : color,
                        }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Paso: Actuar */}
          {pasoActual.key === "actuar" && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={caso.seEstandarizo} onChange={(e) => campo("seEstandarizo", e.target.checked)} className="accent-[#6D28D9] w-4 h-4" />
                Se estandarizó (quedó incorporado a un procedimiento/instructivo)
              </label>
              <textarea value={caso.comoSeEstandarizo} onChange={(e) => campo("comoSeEstandarizo", e.target.value)} rows={3} className={`${inputClass} resize-y`} placeholder="Cómo se estandarizó / dónde quedó documentado" />
            </div>
          )}

          {/* Paso: Seguimiento (estado + bitácora + observaciones) */}
          {pasoActual.key === "seguimiento" && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Estado</label>
                  <select value={caso.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                    {ESTADOS_OM.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Fecha de cierre</label>
                  <input type="date" value={caso.fechaCierre} onChange={(e) => campo("fechaCierre", e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Bitácora de seguimiento</p>
                {caso.bitacora.length > 0 ? (
                  <div className="space-y-0 mb-3 border-l-2 border-gray-100 ml-1.5 pl-4">
                    {[...caso.bitacora].reverse().map((b: EventoOM) => (
                      <div key={b.id} className="relative pb-4 last:pb-0">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ACENTO }} />
                        <p className="text-sm text-[#1A1A1A]">{b.nota}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                          {fechaHoraLegible(b.fecha)} · {b.autor}
                          <button type="button" onClick={() => quitarNota(b.id)} className="text-gray-300 hover:text-red-500"><X size={11} /></button>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mb-3">Todavía no hay entradas en la bitácora.</p>
                )}
                <div className="grid sm:grid-cols-[1fr_auto] gap-2">
                  <input value={notaNueva} onChange={(e) => setNotaNueva(e.target.value)} placeholder="Nueva entrada de seguimiento..." className={inputClass} />
                  <div className="flex gap-2">
                    <input value={autorNota} onChange={(e) => setAutorNota(e.target.value)} placeholder="Autor" className={`${inputClass} sm:w-32`} />
                    <button type="button" onClick={agregarNota} className="flex-shrink-0 text-white font-bold text-xs px-4 py-2 rounded-lg hover:opacity-90 whitespace-nowrap" style={{ backgroundColor: ACENTO }}>
                      + Agregar
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Observaciones</label>
                <textarea value={caso.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
              </div>
            </div>
          )}
        </div>

        {/* Footer de navegación */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-4 border-t border-gray-100 bg-[#FAFAFA]">
          <button
            type="button"
            onClick={() => setPaso((p) => Math.max(0, p - 1))}
            disabled={paso === 0}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-[#1A1A1A] disabled:opacity-30"
          >
            <ChevronLeft size={15} /> Atrás
          </button>

          <div className="flex items-center gap-2">
            <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
              {editando ? "Nueva en blanco" : "Limpiar"}
            </button>
            <button onClick={guardar} disabled={saving} className="text-white font-bold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-60 text-sm" style={{ backgroundColor: ACENTO }}>
              {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar oportunidad"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPaso((p) => Math.min(PASOS.length - 1, p + 1))}
            disabled={paso === PASOS.length - 1}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-[#1A1A1A] disabled:opacity-30"
          >
            Siguiente <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Kanban de registro */}
      <KanbanOportunidades casos={casos} onEditar={editar} onEliminar={eliminar} />
    </div>
  );
}

function KanbanOportunidades({
  casos,
  onEditar,
  onEliminar,
}: {
  casos: OportunidadMejora[];
  onEditar: (c: OportunidadMejora) => void;
  onEliminar: (id: string) => void;
}) {
  if (casos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <Lightbulb size={28} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
        <p className="text-gray-500 text-sm">Todavía no hay oportunidades de mejora registradas.</p>
      </div>
    );
  }

  const columnas = ESTADOS_OM.map((estado) => ({
    estado,
    color: colorEstadoOM(estado),
    items: casos
      .filter((c) => c.estado === estado)
      .sort((a, b) => prioridadOM(a.impacto, a.esfuerzo).orden - prioridadOM(b.impacto, b.esfuerzo).orden),
  })).filter((col) => col.items.length > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <NotebookPen size={16} style={{ color: ACENTO }} />
        <h2 className="text-sm font-bold text-[#1A1A1A]">Registro de Oportunidades</h2>
        <span className="text-xs text-gray-400">· tablero por estado</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {columnas.map((col) => (
          <div key={col.estado} className="flex-shrink-0 w-64">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{col.estado}</p>
              <span className="text-[10px] font-bold text-white rounded-full px-1.5" style={{ backgroundColor: col.color }}>{col.items.length}</span>
            </div>
            <div className="space-y-2">
              {col.items.map((c) => {
                const prioridad = prioridadOM(c.impacto, c.esfuerzo);
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-gray-100 border-l-4 p-3 hover:shadow-md transition-all"
                    style={{ borderLeftColor: prioridad.color }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] text-gray-400">{c.radicado}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: prioridad.color }}>
                        {prioridad.etiqueta}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A1A] mt-1.5 line-clamp-2">{c.titulo || "Sin título"}</p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400">
                        {estaAbiertaOM(c.estado) ? `${diasAbiertaOM(c)}d abierta` : "Cerrada"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onEditar(c)} className="hover:opacity-70" style={{ color: ACENTO }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => onEliminar(c.id)} className="text-gray-300 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
