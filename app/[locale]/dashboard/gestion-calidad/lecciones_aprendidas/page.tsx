"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { temaPanelDe } from "@/lib/temaPanel";
import {
  parseLeccionesAprendidas,
  leccionAprendidaVacia,
  eventoLAVacio,
  siguienteRadicadoLA,
  numeroDeRadicadoLA,
  colorTipoLA,
  colorEstadoDifusionLA,
  tasaIncorporacionLA,
  TIPOS_LA,
  CATEGORIAS_LA,
  FUENTES_LA,
  ESTADOS_DIFUSION_LA,
  type LeccionAprendida,
  type EventoLA,
} from "@/lib/leccionesAprendidas";
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Target,
  Search,
  FileSearch,
  Sparkles,
  Share2,
  NotebookPen,
  ChevronLeft,
  ChevronRight,
  Check,
  Pencil,
  Trash2,
  Paperclip,
  X,
  Flame,
  BookOpen,
} from "lucide-react";

const ITEM_KEY = "lecciones_aprendidas_lista";
const MAX_EVID_BYTES = 1_500_000; // ~1.5MB
const ACENTO = "#0891B2"; // cian "conocimiento" — distinto del violeta de Oportunidades de Mejora

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#0891B2] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const ICONOS_TIPO_LA: Record<string, typeof CheckCircle2> = {
  "Éxito a replicar": CheckCircle2,
  "Error a evitar": AlertTriangle,
  "Riesgo materializado": Flame,
  "Hallazgo técnico": FileSearch,
};

type PasoKey = "identificacion" | "contexto" | "aprendizaje" | "difusion" | "seguimiento";

const PASOS: { key: PasoKey; label: string; icono: typeof Search }[] = [
  { key: "identificacion", label: "Identificación", icono: Search },
  { key: "contexto", label: "Contexto", icono: FileSearch },
  { key: "aprendizaje", label: "Aprendizaje", icono: Sparkles },
  { key: "difusion", label: "Difusión", icono: Share2 },
  { key: "seguimiento", label: "Seguimiento", icono: NotebookPen },
];

function fechaCorta(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function fechaHoraLegible(iso: string) {
  try {
    return new Date(iso).toLocaleString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function AnilloProgreso({
  valor,
  color,
  label,
  textColor = "#FFFFFF",
  trackColor = "rgba(255,255,255,0.12)",
  labelColor = "#9CA3AF",
}: {
  valor: number | null;
  color: string;
  label: string;
  textColor?: string;
  trackColor?: string;
  labelColor?: string;
}) {
  const pct = valor === null ? 0 : Math.max(0, Math.min(100, valor));
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <svg width="64" height="64" viewBox="0 0 64 64" className="flex-shrink-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke={trackColor} strokeWidth="6" />
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
        <span className="text-sm font-bold" style={{ color: textColor }}>{valor !== null ? `${valor}%` : "—"}</span>
      </div>
      <p className="text-xs" style={{ color: labelColor }}>{label}</p>
    </div>
  );
}

export default function LeccionesAprendidasPage() {
  const { user, profile } = useDashboardUser();
  const tema = temaPanelDe(profile?.tema_panel);
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const evidFileInputRef = useRef<HTMLInputElement>(null);

  const [lecciones, setLecciones] = useState<LeccionAprendida[]>([]);
  const [leccion, setLeccion] = useState<LeccionAprendida>(leccionAprendidaVacia("LA-0001"));
  const [notaNueva, setNotaNueva] = useState("");
  const [autorNota, setAutorNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    if (!loading) {
      const cargadas = parseLeccionesAprendidas(docs[ITEM_KEY] ?? "");
      setLecciones(cargadas);
      setLeccion(leccionAprendidaVacia(siguienteRadicadoLA(cargadas.map((l) => numeroDeRadicadoLA(l.radicado)))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = lecciones.some((l) => l.id === leccion.id);
  const tasaIncorporacion = tasaIncorporacionLA(lecciones);
  const exitos = lecciones.filter((l) => l.tipo === "Éxito a replicar").length;
  const errores = lecciones.filter((l) => l.tipo === "Error a evitar").length;

  function campo<K extends keyof LeccionAprendida>(key: K, value: LeccionAprendida[K]) {
    setLeccion((l) => ({ ...l, [key]: value }));
  }

  function limpiar() {
    setLeccion(leccionAprendidaVacia(siguienteRadicadoLA(lecciones.map((l) => numeroDeRadicadoLA(l.radicado)))));
    setError(null);
    setPaso(0);
    if (evidFileInputRef.current) evidFileInputRef.current.value = "";
  }

  function editar(l: LeccionAprendida) {
    setLeccion({ ...l, bitacora: l.bitacora.map((b) => ({ ...b })) });
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
    reader.onload = () => setLeccion((l) => ({ ...l, evidencia: reader.result as string, evidenciaNombre: file.name }));
    reader.readAsDataURL(file);
  }

  function agregarNota() {
    if (!notaNueva.trim()) return;
    setLeccion((l) => ({ ...l, bitacora: [...l.bitacora, eventoLAVacio(notaNueva.trim(), autorNota.trim() || "Sin especificar")] }));
    setNotaNueva("");
  }

  function quitarNota(id: string) {
    setLeccion((l) => ({ ...l, bitacora: l.bitacora.filter((b) => b.id !== id) }));
  }

  async function guardar() {
    if (!leccion.titulo.trim() || !leccion.leccion.trim()) {
      setError("Título y la lección aprendida en sí son obligatorios.");
      setPaso(0);
      return;
    }
    setError(null);
    setSaving(true);
    const actualizadas = [...lecciones.filter((l) => l.id !== leccion.id), leccion];
    await save(ITEM_KEY, JSON.stringify(actualizadas));
    setLecciones(actualizadas);
    limpiar();
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    setSaving(true);
    const restantes = lecciones.filter((l) => l.id !== id);
    await save(ITEM_KEY, JSON.stringify(restantes));
    setLecciones(restantes);
    if (leccion.id === id) limpiar();
    setSaving(false);
  }

  const pasoActual = PASOS[paso];
  const indiceDifusion = Math.max(0, ESTADOS_DIFUSION_LA.indexOf(leccion.estadoDifusion));

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Gestión de Calidad
        </Link>
        <Link
          href={`${basePath}/lecciones_aprendidas/biblioteca`}
          className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-lg hover:opacity-90"
          style={{ backgroundColor: ACENTO }}
        >
          <BookOpen size={14} /> Ver biblioteca de conocimiento →
        </Link>
      </div>

      {/* Hero */}
      <div
        className="relative rounded-2xl p-6 sm:p-8 overflow-hidden"
        style={{ background: `linear-gradient(to bottom right, ${tema.bgFrom}, ${tema.bgTo})`, border: `1px solid ${tema.cardBorder}` }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, ${tema.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${tema.gridColor} 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${ACENTO}40` }} />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: tema.isLight ? ACENTO : "#67E8F9" }}>
            Conocimiento organizacional · ISO 9001 cl. 7.1.6
          </p>
          <h1 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: tema.textPrimary }}>Gestión de Lecciones Aprendidas</h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: tema.textMuted }}>
            Capturá la experiencia como conocimiento reutilizable: qué replicar, qué evitar, y cómo se difunde al resto de la organización.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            <div className="rounded-xl p-3.5" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <BrainCircuit size={16} style={{ color: tema.isLight ? ACENTO : "#67E8F9" }} className="mb-1.5" />
              <p className="text-xl font-bold" style={{ color: tema.textPrimary }}>{lecciones.length}</p>
              <p className="text-[11px] mt-0.5" style={{ color: tema.textMuted }}>Lecciones registradas</p>
            </div>
            <div className="rounded-xl p-3.5" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <CheckCircle2 size={16} style={{ color: "#22C55E" }} className="mb-1.5" />
              <p className="text-xl font-bold" style={{ color: tema.textPrimary }}>{exitos}</p>
              <p className="text-[11px] mt-0.5" style={{ color: tema.textMuted }}>Éxitos a replicar</p>
            </div>
            <div className="rounded-xl p-3.5" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <AlertTriangle size={16} style={{ color: "#EF4444" }} className="mb-1.5" />
              <p className="text-xl font-bold" style={{ color: tema.textPrimary }}>{errores}</p>
              <p className="text-[11px] mt-0.5" style={{ color: tema.textMuted }}>Errores a evitar</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${tema.cardBorder}` }}>
            <Target size={14} style={{ color: tasaIncorporacion === null ? "#9CA3AF" : tasaIncorporacion >= 60 ? "#22C55E" : tasaIncorporacion >= 30 ? "#F5A623" : "#EF4444" }} />
            <AnilloProgreso
              valor={tasaIncorporacion}
              color={tasaIncorporacion === null ? "#9CA3AF" : tasaIncorporacion >= 60 ? "#22C55E" : tasaIncorporacion >= 30 ? "#F5A623" : "#EF4444"}
              label="Incorporadas al SGC (procedimiento o capacitación)"
              textColor={tema.textPrimary}
              trackColor={tema.cardBorder}
              labelColor={tema.textMuted}
            />
          </div>
        </div>
      </div>

      {/* Wizard */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 sm:px-8 pt-6 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: ACENTO }}>
              {editando ? `Editando ${leccion.radicado}` : `Nueva lección · ${leccion.radicado}`}
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
            <div className="space-y-4">
              <div>
                <label className={labelClass}><span className="text-red-500">*</span> Título</label>
                <input value={leccion.titulo} onChange={(e) => campo("titulo", e.target.value)} className={inputClass} placeholder="Ej: Validar stock de insumos antes de confirmar fecha de entrega" />
              </div>

              <div>
                <label className={labelClass}>Tipo de lección</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIPOS_LA.map((t) => {
                    const Icono = ICONOS_TIPO_LA[t] ?? FileSearch;
                    const color = colorTipoLA(t);
                    const activo = leccion.tipo === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => campo("tipo", t)}
                        className="relative flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all"
                        style={{
                          backgroundColor: activo ? color : `${color}12`,
                          borderColor: activo ? color : `${color}35`,
                          transform: activo ? "scale(1.02)" : undefined,
                          boxShadow: activo ? `0 8px 20px -6px ${color}80` : undefined,
                        }}
                      >
                        <Icono size={18} color={activo ? "#fff" : color} className="flex-shrink-0" />
                        <span className="text-xs font-bold" style={{ color: activo ? "#fff" : color }}>{t}</span>
                        {activo && <Check size={13} className="absolute top-2 right-2 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Categoría</label>
                  <select value={leccion.categoria} onChange={(e) => campo("categoria", e.target.value)} className={inputClass}>
                    {CATEGORIAS_LA.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Fuente</label>
                  <select value={leccion.fuente} onChange={(e) => campo("fuente", e.target.value)} className={inputClass}>
                    {FUENTES_LA.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Proceso / área</label>
                  <input value={leccion.procesoArea} onChange={(e) => campo("procesoArea", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha</label>
                  <input type="date" value={leccion.fecha} onChange={(e) => campo("fecha", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Registrado por</label>
                  <input value={leccion.registradoPor} onChange={(e) => campo("registradoPor", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* Paso: Contexto */}
          {pasoActual.key === "contexto" && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Contexto (qué pasó)</label>
                <textarea value={leccion.contexto} onChange={(e) => campo("contexto", e.target.value)} rows={4} className={`${inputClass} resize-y`} placeholder="Describí la situación: qué ocurrió, cuándo y en qué circunstancias." />
              </div>
              <div>
                <label className={labelClass}>Causa raíz</label>
                <textarea value={leccion.causaRaiz} onChange={(e) => campo("causaRaiz", e.target.value)} rows={3} className={`${inputClass} resize-y`} placeholder="¿Por qué pasó realmente? (no el síntoma, la causa de fondo)" />
              </div>
            </div>
          )}

          {/* Paso: Aprendizaje */}
          {pasoActual.key === "aprendizaje" && (
            <div className="space-y-3">
              <div className="rounded-xl p-4 border-2" style={{ borderColor: `${ACENTO}35`, backgroundColor: `${ACENTO}0A` }}>
                <label className="block text-xs font-bold mb-1" style={{ color: ACENTO }}>
                  <span className="text-red-500">*</span> Lección aprendida
                </label>
                <textarea
                  value={leccion.leccion}
                  onChange={(e) => campo("leccion", e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none resize-y"
                  style={{ borderColor: `${ACENTO}40` }}
                  placeholder="Redactada como conocimiento reutilizable: 'Cuando ocurra X, hacer/evitar Y porque...'"
                />
              </div>
              <div>
                <label className={labelClass}>Recomendaciones</label>
                <textarea value={leccion.recomendaciones} onChange={(e) => campo("recomendaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
              </div>
              <div>
                <label className={labelClass}>Aplicabilidad (a qué procesos/proyectos futuros aplica)</label>
                <input value={leccion.aplicabilidad} onChange={(e) => campo("aplicabilidad", e.target.value)} className={inputClass} />
              </div>
            </div>
          )}

          {/* Paso: Difusión */}
          {pasoActual.key === "difusion" && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-4">Estado de difusión — nivel de madurez en la propagación del conocimiento.</p>
                <div className="flex items-center">
                  {ESTADOS_DIFUSION_LA.map((e, i) => {
                    const color = colorEstadoDifusionLA(e);
                    const activo = i === indiceDifusion;
                    const pasado = i < indiceDifusion;
                    return (
                      <Fragment key={e}>
                        {i > 0 && (
                          <div className="h-0.5 flex-1 min-w-[12px]" style={{ backgroundColor: pasado || activo ? color : "#E5E7EB" }} />
                        )}
                        <button
                          type="button"
                          onClick={() => campo("estadoDifusion", e)}
                          className="flex flex-col items-center gap-1.5 flex-shrink-0 px-1"
                        >
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all"
                            style={{
                              backgroundColor: activo || pasado ? color : "#fff",
                              borderColor: activo || pasado ? color : "#E5E7EB",
                              color: activo || pasado ? "#fff" : "#9CA3AF",
                              transform: activo ? "scale(1.1)" : undefined,
                            }}
                          >
                            {pasado ? <Check size={13} /> : <Share2 size={13} />}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wide text-center max-w-[70px] leading-tight" style={{ color: activo ? color : "#9CA3AF" }}>
                            {e}
                          </span>
                        </button>
                      </Fragment>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass}>Archivo de evidencia</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => evidFileInputRef.current?.click()} className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#0891B2]/50">
                    <Paperclip size={13} /> {leccion.evidenciaNombre ? "Cambiar archivo" : "Adjuntar archivo"}
                  </button>
                  {leccion.evidenciaNombre && <p className="text-xs text-gray-500 truncate">{leccion.evidenciaNombre}</p>}
                </div>
                <input ref={evidFileInputRef} type="file" accept="image/*,.pdf" onChange={handleEvidencia} className="hidden" />
              </div>
            </div>
          )}

          {/* Paso: Seguimiento */}
          {pasoActual.key === "seguimiento" && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Bitácora de seguimiento</p>
                {leccion.bitacora.length > 0 ? (
                  <div className="space-y-0 mb-3 border-l-2 border-gray-100 ml-1.5 pl-4">
                    {[...leccion.bitacora].reverse().map((b: EventoLA) => (
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
                <textarea value={leccion.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
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
              {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar lección"}
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

      {/* Kanban de registro, por tipo */}
      <KanbanLecciones lecciones={lecciones} onEditar={editar} onEliminar={eliminar} />
    </div>
  );
}

function KanbanLecciones({
  lecciones,
  onEditar,
  onEliminar,
}: {
  lecciones: LeccionAprendida[];
  onEditar: (l: LeccionAprendida) => void;
  onEliminar: (id: string) => void;
}) {
  if (lecciones.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <BrainCircuit size={28} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
        <p className="text-gray-500 text-sm">Todavía no hay lecciones aprendidas registradas.</p>
      </div>
    );
  }

  const columnas = TIPOS_LA.map((tipo) => ({
    tipo,
    color: colorTipoLA(tipo),
    icono: ICONOS_TIPO_LA[tipo] ?? FileSearch,
    items: lecciones.filter((l) => l.tipo === tipo).sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")),
  })).filter((col) => col.items.length > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <NotebookPen size={16} style={{ color: ACENTO }} />
        <h2 className="text-sm font-bold text-[#1A1A1A]">Registro de Lecciones</h2>
        <span className="text-xs text-gray-400">· tablero por tipo</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {columnas.map((col) => {
          const IconoCol = col.icono;
          return (
            <div key={col.tipo} className="flex-shrink-0 w-64">
              <div className="flex items-center gap-2 mb-2 px-1">
                <IconoCol size={13} style={{ color: col.color }} />
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{col.tipo}</p>
                <span className="text-[10px] font-bold text-white rounded-full px-1.5" style={{ backgroundColor: col.color }}>{col.items.length}</span>
              </div>
              <div className="space-y-2">
                {col.items.map((l) => (
                  <div
                    key={l.id}
                    className="bg-white rounded-xl border border-gray-100 border-l-4 p-3 hover:shadow-md transition-all"
                    style={{ borderLeftColor: col.color }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] text-gray-400">{l.radicado}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: colorEstadoDifusionLA(l.estadoDifusion) }}>
                        {l.estadoDifusion}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A1A] mt-1.5 line-clamp-2">{l.titulo || "Sin título"}</p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400">{l.categoria} · {fechaCorta(l.fecha)}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onEditar(l)} className="hover:opacity-70" style={{ color: ACENTO }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => onEliminar(l.id)} className="text-gray-300 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
