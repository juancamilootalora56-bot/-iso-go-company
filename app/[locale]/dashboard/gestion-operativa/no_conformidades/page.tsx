"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseProductos } from "@/lib/productosFabricados";
import { parseClientes } from "@/lib/clientes";
import { temaPanelDe } from "@/lib/temaPanel";
import {
  parseNoConformidades,
  noConformidadVacia,
  eventoNCVacio,
  siguienteRadicadoNC,
  numeroDeRadicadoNC,
  colorSeveridadNC,
  colorEstadoNC,
  estaAbiertaNC,
  costoTotalNC,
  costoTotalNoCalidad,
  diasAbiertaNC,
  tiempoPromedioResolucionNC,
  resumenPorEtapaNC,
  rankingPorProducto,
  formatoMontoNC,
  ETAPAS_DETECCION_NC,
  SEVERIDADES_NC,
  CAUSAS_APARENTES_NC,
  DISPOSICIONES_NC,
  RESULTADOS_VERIFICACION_NC,
  ESTADOS_NC,
  MONEDAS_NC,
  MAX_EVIDENCIAS_NC,
  type NoConformidad,
  type EventoNC,
} from "@/lib/noConformidades";
import {
  ClipboardList,
  Flame,
  DollarSign,
  Timer,
  Search,
  MapPin,
  Trophy,
  Tag,
  AlertOctagon,
  AlertTriangle,
  Info,
  Scale,
  CheckCircle2,
  Wrench,
  Flag,
  NotebookPen,
  ChevronLeft,
  ChevronRight,
  Check,
  Pencil,
  Trash2,
  Paperclip,
  X,
  Package,
  BarChart3,
  LineChart,
} from "lucide-react";

const ITEM_KEY = "no_conformidades_lista";
const MAX_EVID_BYTES = 1_500_000; // ~1.5MB
const ACENTO = "#EA580C"; // naranja intenso — distinto del violeta (OM) y cian (LA)

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#EA580C] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const ICONOS_SEVERIDAD: Record<string, typeof AlertOctagon> = {
  "Crítica": AlertOctagon,
  "Mayor": AlertTriangle,
  "Menor": Info,
};

type PasoKey = "identificacion" | "clasificacion" | "disposicion" | "verificacion" | "costo" | "accion" | "seguimiento";

const PASOS: { key: PasoKey; label: string; icono: typeof Search }[] = [
  { key: "identificacion", label: "Identificación", icono: Tag },
  { key: "clasificacion", label: "Clasificación", icono: AlertTriangle },
  { key: "disposicion", label: "Disposición", icono: Scale },
  { key: "verificacion", label: "Verificación", icono: CheckCircle2 },
  { key: "costo", label: "Costo", icono: DollarSign },
  { key: "accion", label: "Acción", icono: Wrench },
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

export default function NoConformidadesPage() {
  const { user, profile } = useDashboardUser();
  const tema = temaPanelDe(profile?.tema_panel);
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading, save } = useGestionDocumentos("operativa", user?.id ?? null);
  const { docs: docsComercial, loading: loadingComercial } = useGestionDocumentos("comercial", user?.id ?? null);
  const evidFileInputRef = useRef<HTMLInputElement>(null);

  const [casos, setCasos] = useState<NoConformidad[]>([]);
  const [caso, setCaso] = useState<NoConformidad>(noConformidadVacia("NC-0001"));
  const [notaNueva, setNotaNueva] = useState("");
  const [autorNota, setAutorNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [filtroEtapa, setFiltroEtapa] = useState("");
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    if (!loading) {
      const cargados = parseNoConformidades(docs[ITEM_KEY] ?? "");
      setCasos(cargados);
      setCaso(noConformidadVacia(siguienteRadicadoNC(cargados.map((c) => numeroDeRadicadoNC(c.radicado)))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading || loadingComercial) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const productos = parseProductos(docs["productos_lista"] ?? "");
  const clientes = parseClientes(docsComercial["clientes_lista"] ?? "");

  const editando = casos.some((c) => c.id === caso.id);
  const abiertos = casos.filter((c) => estaAbiertaNC(c.estado)).length;
  const costoTotal = costoTotalNoCalidad(casos);
  const tiempoPromedio = tiempoPromedioResolucionNC(casos);
  const resumenEtapa = resumenPorEtapaNC(casos);
  const ranking = rankingPorProducto(casos, 5);
  const requierenVerif = casos.filter((c) => c.requiereVerificacion);
  const tasaVerificacion = requierenVerif.length > 0
    ? Math.round((requierenVerif.filter((c) => c.resultadoVerificacion !== "Pendiente").length / requierenVerif.length) * 100)
    : null;

  function campo<K extends keyof NoConformidad>(key: K, value: NoConformidad[K]) {
    setCaso((c) => ({ ...c, [key]: value }));
  }

  function onProductoChange(valor: string) {
    const match = productos.find((p) => p.nombre.toLowerCase() === valor.toLowerCase());
    setCaso((c) => (match ? { ...c, productoId: match.id, productoNombre: match.nombre } : { ...c, productoId: "", productoNombre: valor }));
  }

  function toggleDisposicion(d: string) {
    setCaso((c) => ({
      ...c,
      disposiciones: c.disposiciones.includes(d) ? c.disposiciones.filter((x) => x !== d) : [...c.disposiciones, d],
    }));
  }

  function limpiar() {
    const numeros = casos.map((c) => numeroDeRadicadoNC(c.radicado));
    setCaso(noConformidadVacia(siguienteRadicadoNC(numeros)));
    setError(null);
    setPaso(0);
    setNotaNueva("");
    setAutorNota("");
    if (evidFileInputRef.current) evidFileInputRef.current.value = "";
  }

  function editar(c: NoConformidad) {
    setCaso({ ...c, disposiciones: [...c.disposiciones], bitacora: c.bitacora.map((b) => ({ ...b })), evidencias: c.evidencias.map((ev) => ({ ...ev })) });
    setError(null);
    setPaso(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEvidencia(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const espacioDisponible = MAX_EVIDENCIAS_NC - caso.evidencias.length;
    if (espacioDisponible <= 0) {
      setError(`Ya cargaste el máximo de ${MAX_EVIDENCIAS_NC} archivos de evidencia.`);
      return;
    }

    const aProcesar = files.slice(0, espacioDisponible);
    setError(files.length > aProcesar.length ? `Solo se cargaron ${aProcesar.length} archivo(s): el máximo es ${MAX_EVIDENCIAS_NC}.` : null);

    aProcesar.forEach((file) => {
      if (file.size > MAX_EVID_BYTES) {
        setError(`"${file.name}" es muy pesado. Usá archivos de menos de 1.5MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCaso((c) =>
          c.evidencias.length >= MAX_EVIDENCIAS_NC
            ? c
            : { ...c, evidencias: [...c.evidencias, { id: crypto.randomUUID(), nombre: file.name, archivo: reader.result as string }] }
        );
      };
      reader.readAsDataURL(file);
    });

    if (evidFileInputRef.current) evidFileInputRef.current.value = "";
  }

  function quitarEvidencia(id: string) {
    setCaso((c) => ({ ...c, evidencias: c.evidencias.filter((ev) => ev.id !== id) }));
  }

  function agregarNota() {
    if (!notaNueva.trim()) return;
    setCaso((c) => ({ ...c, bitacora: [...c.bitacora, eventoNCVacio(notaNueva.trim(), autorNota.trim() || "Sin especificar")] }));
    setNotaNueva("");
  }

  function quitarNota(id: string) {
    setCaso((c) => ({ ...c, bitacora: c.bitacora.filter((b) => b.id !== id) }));
  }

  async function guardar() {
    if (!caso.productoId && !caso.productoNombre.trim()) {
      setError("Indicá el producto afectado.");
      setPaso(0);
      return;
    }
    if (!caso.descripcion.trim()) {
      setError("Ingresá la descripción de la no conformidad.");
      setPaso(0);
      return;
    }
    setError(null);
    setSaving(true);
    const producto = productos.find((p) => p.id === caso.productoId);
    const cliente = clientes.find((cl) => cl.id === caso.clienteId);
    const registrado: NoConformidad = {
      ...caso,
      productoNombre: producto?.nombre ?? caso.productoNombre,
      clienteNombre: cliente?.razonSocial ?? caso.clienteNombre,
    };
    const actualizados = [...casos.filter((c) => c.id !== caso.id), registrado];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setCasos(actualizados);
    limpiar();
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    setSaving(true);
    const actualizados = casos.filter((c) => c.id !== id);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setCasos(actualizados);
    if (caso.id === id) limpiar();
    setSaving(false);
  }

  const pasoActual = PASOS[paso];
  const productoValorMostrado = caso.productoId ? (productos.find((p) => p.id === caso.productoId)?.nombre ?? caso.productoNombre) : caso.productoNombre;
  const indiceEstado = Math.max(0, ESTADOS_NC.indexOf(caso.estado));
  const costoCaso = costoTotalNC(caso);
  const costoSegmentos = [
    { label: "Reproceso", valor: caso.costoReproceso || 0, color: "#F59E0B" },
    { label: "Desperdicio", valor: caso.costoDesperdicio || 0, color: "#EF4444" },
    { label: "Devolución", valor: caso.costoDevolucion || 0, color: "#8B5CF6" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Gestión Operativa
        </Link>
        <div className="flex gap-2">
          <Link
            href={`${basePath}/no_conformidades/matriz`}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-lg hover:opacity-90"
            style={{ backgroundColor: ACENTO }}
          >
            <BarChart3 size={14} /> Ver matriz
          </Link>
          <Link
            href={`${basePath}/no_conformidades/grafico`}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-lg hover:opacity-90"
            style={{ backgroundColor: "#1A1A1A" }}
          >
            <LineChart size={14} /> Ver gráfico
          </Link>
        </div>
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
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: tema.isLight ? ACENTO : "#FDBA74" }}>
            Producto no conforme · ISO 9001 cl. 8.7
          </p>
          <h1 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: tema.textPrimary }}>No Conformidades</h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: tema.textMuted }}>
            Identificación, disposición, verificación de la corrección y acción correctiva — de punta a punta.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="rounded-xl p-3.5" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <ClipboardList size={16} style={{ color: tema.isLight ? ACENTO : "#FDBA74" }} className="mb-1.5" />
              <p className="text-xl font-bold" style={{ color: tema.textPrimary }}>{casos.length}</p>
              <p className="text-[11px] mt-0.5" style={{ color: tema.textMuted }}>Casos totales</p>
            </div>
            <div className="rounded-xl p-3.5" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <Flame size={16} style={{ color: "#EF4444" }} className="mb-1.5" />
              <p className="text-xl font-bold" style={{ color: abiertos > 0 ? "#EF4444" : tema.textPrimary }}>{abiertos}</p>
              <p className="text-[11px] mt-0.5" style={{ color: tema.textMuted }}>Casos abiertos</p>
            </div>
            <div className="rounded-xl p-3.5" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <DollarSign size={16} style={{ color: "#22C55E" }} className="mb-1.5" />
              <p className="text-xl font-bold truncate" style={{ color: tema.textPrimary }}>{costoTotal > 0 ? formatoMontoNC(costoTotal) : "—"}</p>
              <p className="text-[11px] mt-0.5" style={{ color: tema.textMuted }}>Costo de no calidad</p>
            </div>
            <div className="rounded-xl p-3.5" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <Timer size={16} style={{ color: "#38BDF8" }} className="mb-1.5" />
              <p className="text-xl font-bold" style={{ color: tema.textPrimary }}>{tiempoPromedio !== null ? `${tiempoPromedio}d` : "—"}</p>
              <p className="text-[11px] mt-0.5" style={{ color: tema.textMuted }}>Tiempo promedio de cierre</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${tema.cardBorder}` }}>
            <Search size={14} style={{ color: tasaVerificacion === null ? "#9CA3AF" : tasaVerificacion >= 80 ? "#22C55E" : tasaVerificacion >= 50 ? "#F5A623" : "#EF4444" }} />
            <AnilloProgreso
              valor={tasaVerificacion}
              color={tasaVerificacion === null ? "#9CA3AF" : tasaVerificacion >= 80 ? "#22C55E" : tasaVerificacion >= 50 ? "#F5A623" : "#EF4444"}
              label="Verificaciones de corrección completadas"
              textColor={tema.textPrimary}
              trackColor={tema.cardBorder}
              labelColor={tema.textMuted}
            />
          </div>
        </div>
      </div>

      {/* Distribución por etapa */}
      {resumenEtapa.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={15} style={{ color: ACENTO }} />
            <h2 className="text-sm font-bold text-[#1A1A1A]">Distribución por etapa de detección</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {resumenEtapa.map((r) => (
              <button
                key={r.etapa}
                onClick={() => setFiltroEtapa(filtroEtapa === r.etapa ? "" : r.etapa)}
                className="rounded-xl p-3 border-2 text-center transition-all"
                style={
                  filtroEtapa === r.etapa
                    ? { backgroundColor: ACENTO, borderColor: ACENTO }
                    : { backgroundColor: `${ACENTO}0A`, borderColor: `${ACENTO}25` }
                }
              >
                <p className="text-xl font-bold" style={{ color: filtroEtapa === r.etapa ? "#fff" : "#1A1A1A" }}>{r.cantidad}</p>
                <p className="text-[10px] uppercase tracking-wide font-bold mt-0.5" style={{ color: filtroEtapa === r.etapa ? "rgba(255,255,255,0.9)" : "#9CA3AF" }}>{r.etapa}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ranking por producto */}
      {ranking.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={15} style={{ color: ACENTO }} />
            <h2 className="text-sm font-bold text-[#1A1A1A]">Productos con más no conformidades</h2>
          </div>
          <div className="space-y-2">
            {ranking.map((r, i) => (
              <div key={r.productoId} className="flex items-center gap-3 bg-[#FAFAFA] rounded-lg p-3 border border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{r.productoNombre}</p>
                  <p className="text-xs text-gray-500">{r.cantidad} caso{r.cantidad !== 1 ? "s" : ""}</p>
                </div>
                <p className="text-sm font-bold text-[#1A1A1A] whitespace-nowrap">{r.costo > 0 ? formatoMontoNC(r.costo) : "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {productos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Package size={28} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
          <p className="text-gray-500 text-sm mb-4">Necesitás tener al menos un producto dado de alta para registrar una no conformidad.</p>
          <Link href={`${basePath}/inscripcion_productos`} className="inline-flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-lg hover:opacity-90 text-sm" style={{ backgroundColor: ACENTO }}>
            Dar de alta un producto
          </Link>
        </div>
      ) : (
        <>
          {/* Wizard */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 sm:px-8 pt-6 pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: ACENTO }}>
                  {editando ? `Editando ${caso.radicado}` : `Nuevo caso · ${caso.radicado}`}
                </span>
                {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
                {success && <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><Check size={13} /> Guardado</span>}
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
                          className="h-0.5 flex-1 min-w-[12px] mx-1"
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
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}><span className="text-red-500">*</span> Producto afectado</label>
                      <input
                        value={productoValorMostrado}
                        onChange={(e) => onProductoChange(e.target.value)}
                        list="productos-existentes"
                        placeholder="Escribí o elegí un producto existente"
                        className={inputClass}
                      />
                      <datalist id="productos-existentes">
                        {productos.map((p) => <option key={p.id} value={p.nombre} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className={labelClass}>Etapa de detección</label>
                      <select value={caso.etapaDeteccion} onChange={(e) => campo("etapaDeteccion", e.target.value)} className={inputClass}>
                        {ETAPAS_DETECCION_NC.map((et) => <option key={et} value={et}>{et}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Cantidad afectada</label>
                      <input
                        type="number"
                        min={0}
                        value={caso.cantidadAfectada || ""}
                        onChange={(e) => campo("cantidadAfectada", Math.max(0, Number(e.target.value) || 0))}
                        onWheel={(e) => e.currentTarget.blur()}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Unidad de medida</label>
                      <input value={caso.unidadMedida} onChange={(e) => campo("unidadMedida", e.target.value)} placeholder="Ej: unidades, Kg" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Lote / Nº de serie</label>
                      <input value={caso.loteONumeroSerie} onChange={(e) => campo("loteONumeroSerie", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Fecha de detección</label>
                      <input type="date" value={caso.fechaDeteccion} onChange={(e) => campo("fechaDeteccion", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Detectado por</label>
                      <input value={caso.detectadoPor} onChange={(e) => campo("detectadoPor", e.target.value)} className={inputClass} />
                    </div>
                    {caso.etapaDeteccion === "Post-entrega (cliente)" && (
                      <div>
                        <label className={labelClass}>Cliente</label>
                        <select value={caso.clienteId} onChange={(e) => campo("clienteId", e.target.value)} className={inputClass}>
                          <option value="">Seleccioná</option>
                          {clientes.map((cl) => <option key={cl.id} value={cl.id}>{cl.razonSocial}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}><span className="text-red-500">*</span> Descripción de la no conformidad</label>
                    <textarea value={caso.descripcion} onChange={(e) => campo("descripcion", e.target.value)} rows={3} className={`${inputClass} resize-y`} />
                  </div>
                  <div>
                    <label className={labelClass}>Requisito / especificación incumplida</label>
                    <input value={caso.requisitoIncumplido} onChange={(e) => campo("requisitoIncumplido", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Evidencia (foto / documento) — hasta {MAX_EVIDENCIAS_NC} archivos</label>
                    <div className="flex items-center gap-2.5 mb-2">
                      <button
                        type="button"
                        onClick={() => evidFileInputRef.current?.click()}
                        disabled={caso.evidencias.length >= MAX_EVIDENCIAS_NC}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#EA580C]/50 disabled:opacity-40"
                      >
                        <Paperclip size={13} /> Subir archivo(s)
                      </button>
                      <input ref={evidFileInputRef} type="file" accept="image/*,.pdf" multiple onChange={handleEvidencia} className="hidden" />
                      <span className="text-xs text-gray-400">{caso.evidencias.length}/{MAX_EVIDENCIAS_NC}</span>
                    </div>
                    {caso.evidencias.length > 0 && (
                      <div className="space-y-1.5">
                        {caso.evidencias.map((ev) => (
                          <div key={ev.id} className="flex items-center justify-between gap-2 bg-[#FAFAFA] border border-gray-100 rounded-lg px-3 py-1.5">
                            <span className="text-xs text-gray-600 truncate">{ev.nombre}</span>
                            <button type="button" onClick={() => quitarEvidencia(ev.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0">
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paso: Clasificación */}
              {pasoActual.key === "clasificacion" && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Severidad</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {SEVERIDADES_NC.map((s) => {
                        const Icono = ICONOS_SEVERIDAD[s] ?? Info;
                        const color = colorSeveridadNC(s);
                        const activa = caso.severidad === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => campo("severidad", s)}
                            className="relative flex items-center gap-2.5 rounded-xl border-2 p-3.5 text-left transition-all"
                            style={{
                              backgroundColor: activa ? color : `${color}12`,
                              borderColor: activa ? color : `${color}35`,
                              transform: activa ? "scale(1.02)" : undefined,
                              boxShadow: activa ? `0 8px 20px -6px ${color}80` : undefined,
                            }}
                          >
                            <Icono size={18} color={activa ? "#fff" : color} className="flex-shrink-0" />
                            <span className="text-sm font-bold" style={{ color: activa ? "#fff" : color }}>{s}</span>
                            {activa && <Check size={13} className="absolute top-2 right-2 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Causa aparente</label>
                    <select value={caso.causaAparente} onChange={(e) => campo("causaAparente", e.target.value)} className={inputClass}>
                      <option value="">Seleccioná</option>
                      {CAUSAS_APARENTES_NC.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Paso: Disposición */}
              {pasoActual.key === "disposicion" && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Disposición (ISO 9001 · 8.7.1 a-d) — podés marcar más de una</label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {DISPOSICIONES_NC.map((d) => {
                        const activa = caso.disposiciones.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDisposicion(d)}
                            className="relative flex items-center gap-2.5 rounded-xl border-2 p-3 text-left text-xs font-semibold transition-all"
                            style={{
                              backgroundColor: activa ? ACENTO : `${ACENTO}0A`,
                              borderColor: activa ? ACENTO : `${ACENTO}30`,
                              color: activa ? "#fff" : "#1A1A1A",
                            }}
                          >
                            <span
                              className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border"
                              style={{ borderColor: activa ? "#fff" : `${ACENTO}60`, backgroundColor: activa ? "rgba(255,255,255,0.2)" : "transparent" }}
                            >
                              {activa && <Check size={11} />}
                            </span>
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Detalle de la disposición</label>
                    <textarea value={caso.detalleDisposicion} onChange={(e) => campo("detalleDisposicion", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
                  </div>
                  {caso.disposiciones.includes("Concesión (aceptación con autorización)") && (
                    <div className="grid sm:grid-cols-2 gap-3 rounded-xl p-3.5 border-2" style={{ backgroundColor: "#FFF8E8", borderColor: "#F5A62340" }}>
                      <div>
                        <label className={labelClass}>Concesión autorizada por</label>
                        <input value={caso.concesionAutorizadoPor} onChange={(e) => campo("concesionAutorizadoPor", e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Condiciones de la concesión</label>
                        <input value={caso.concesionCondiciones} onChange={(e) => campo("concesionCondiciones", e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Paso: Verificación */}
              {pasoActual.key === "verificacion" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => campo("requiereVerificacion", true)}
                      className="text-sm font-bold py-2.5 rounded-lg border-2 transition-all"
                      style={caso.requiereVerificacion ? { backgroundColor: ACENTO, borderColor: ACENTO, color: "#fff" } : { borderColor: "#E5E7EB", color: "#9CA3AF" }}
                    >
                      Requiere verificación
                    </button>
                    <button
                      type="button"
                      onClick={() => campo("requiereVerificacion", false)}
                      className="text-sm font-bold py-2.5 rounded-lg border-2 transition-all"
                      style={!caso.requiereVerificacion ? { backgroundColor: "#1A1A1A", borderColor: "#1A1A1A", color: "#fff" } : { borderColor: "#E5E7EB", color: "#9CA3AF" }}
                    >
                      No aplica
                    </button>
                  </div>
                  {caso.requiereVerificacion && (
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Fecha de verificación</label>
                          <input type="date" value={caso.fechaVerificacion} onChange={(e) => campo("fechaVerificacion", e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Responsable</label>
                          <input value={caso.responsableVerificacion} onChange={(e) => campo("responsableVerificacion", e.target.value)} className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Resultado</label>
                        <div className="grid grid-cols-3 gap-2">
                          {RESULTADOS_VERIFICACION_NC.map((r) => {
                            const activo = caso.resultadoVerificacion === r;
                            const color = r === "Conforme" ? "#22C55E" : r === "No conforme" ? "#EF4444" : "#9CA3AF";
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
                </div>
              )}

              {/* Paso: Costo */}
              {pasoActual.key === "costo" && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-4 gap-3">
                    <div>
                      <label className={labelClass}>Reproceso</label>
                      <input type="number" min={0} value={caso.costoReproceso || ""} onChange={(e) => campo("costoReproceso", Math.max(0, Number(e.target.value) || 0))} onWheel={(e) => e.currentTarget.blur()} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Desperdicio / scrap</label>
                      <input type="number" min={0} value={caso.costoDesperdicio || ""} onChange={(e) => campo("costoDesperdicio", Math.max(0, Number(e.target.value) || 0))} onWheel={(e) => e.currentTarget.blur()} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Devolución</label>
                      <input type="number" min={0} value={caso.costoDevolucion || ""} onChange={(e) => campo("costoDevolucion", Math.max(0, Number(e.target.value) || 0))} onWheel={(e) => e.currentTarget.blur()} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Moneda</label>
                      <select value={caso.moneda} onChange={(e) => campo("moneda", e.target.value)} className={inputClass}>
                        {MONEDAS_NC.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

                  {costoCaso > 0 && (
                    <div className="bg-[#1A1A1A] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Costo total del caso</p>
                        <p className="text-lg font-extrabold text-white">{formatoMontoNC(costoCaso)} <span className="text-xs text-gray-400 font-normal">{caso.moneda}</span></p>
                      </div>
                      <div className="flex w-full h-3 rounded-full overflow-hidden bg-white/10">
                        {costoSegmentos.filter((s) => s.valor > 0).map((s) => (
                          <div key={s.label} style={{ width: `${(s.valor / costoCaso) * 100}%`, backgroundColor: s.color }} title={`${s.label}: ${formatoMontoNC(s.valor)}`} />
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                        {costoSegmentos.filter((s) => s.valor > 0).map((s) => (
                          <div key={s.label} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                            <span className="text-[10px] text-gray-400">{s.label} · {formatoMontoNC(s.valor)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Paso: Acción correctiva */}
              {pasoActual.key === "accion" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => campo("requiereAccionCorrectiva", true)}
                      className="text-sm font-bold py-2.5 rounded-lg border-2 transition-all"
                      style={caso.requiereAccionCorrectiva ? { backgroundColor: ACENTO, borderColor: ACENTO, color: "#fff" } : { borderColor: "#E5E7EB", color: "#9CA3AF" }}
                    >
                      Requiere acción correctiva
                    </button>
                    <button
                      type="button"
                      onClick={() => campo("requiereAccionCorrectiva", false)}
                      className="text-sm font-bold py-2.5 rounded-lg border-2 transition-all"
                      style={!caso.requiereAccionCorrectiva ? { backgroundColor: "#1A1A1A", borderColor: "#1A1A1A", color: "#fff" } : { borderColor: "#E5E7EB", color: "#9CA3AF" }}
                    >
                      No aplica
                    </button>
                  </div>
                  {caso.requiereAccionCorrectiva && (
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>Análisis de causa raíz</label>
                        <textarea value={caso.analisisCausaRaiz} onChange={(e) => campo("analisisCausaRaiz", e.target.value)} rows={3} placeholder="Ej: 5 Por qués, Ishikawa, etc." className={`${inputClass} resize-y`} />
                      </div>
                      <div>
                        <label className={labelClass}>Plan de acción</label>
                        <textarea value={caso.planAccion} onChange={(e) => campo("planAccion", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Responsable de la acción</label>
                          <input value={caso.responsableAccion} onChange={(e) => campo("responsableAccion", e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Fecha compromiso</label>
                          <input type="date" value={caso.fechaCompromiso} onChange={(e) => campo("fechaCompromiso", e.target.value)} className={inputClass} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Paso: Seguimiento */}
              {pasoActual.key === "seguimiento" && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-4">Estado del caso — nivel de avance en la resolución.</p>
                    <div className="flex items-center">
                      {ESTADOS_NC.map((e, i) => {
                        const color = colorEstadoNC(e);
                        const activo = i === indiceEstado;
                        const pasado = i < indiceEstado;
                        return (
                          <Fragment key={e}>
                            {i > 0 && (
                              <div className="h-0.5 flex-1 min-w-[12px]" style={{ backgroundColor: pasado || activo ? color : "#E5E7EB" }} />
                            )}
                            <button
                              type="button"
                              onClick={() => campo("estado", e)}
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
                                {pasado ? <Check size={13} /> : <Flag size={13} />}
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

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Responsable del caso</label>
                      <input value={caso.responsableCaso} onChange={(e) => campo("responsableCaso", e.target.value)} className={inputClass} />
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
                        {[...caso.bitacora].reverse().map((b: EventoNC) => (
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
                  {editando ? "Nuevo en blanco" : "Limpiar"}
                </button>
                <button onClick={guardar} disabled={saving} className="text-white font-bold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-60 text-sm" style={{ backgroundColor: ACENTO }}>
                  {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar caso"}
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
          <KanbanNoConformidades casos={casos} filtroEtapa={filtroEtapa} onLimpiarFiltro={() => setFiltroEtapa("")} onEditar={editar} onEliminar={eliminar} />
        </>
      )}
    </div>
  );
}

function KanbanNoConformidades({
  casos,
  filtroEtapa,
  onLimpiarFiltro,
  onEditar,
  onEliminar,
}: {
  casos: NoConformidad[];
  filtroEtapa: string;
  onLimpiarFiltro: () => void;
  onEditar: (c: NoConformidad) => void;
  onEliminar: (id: string) => void;
}) {
  if (casos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <ClipboardList size={28} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
        <p className="text-gray-500 text-sm">Todavía no hay casos de no conformidad registrados.</p>
      </div>
    );
  }

  const filtrados = filtroEtapa ? casos.filter((c) => c.etapaDeteccion === filtroEtapa) : casos;

  const columnas = ESTADOS_NC.map((estado) => ({
    estado,
    color: colorEstadoNC(estado),
    items: filtrados
      .filter((c) => c.estado === estado)
      .sort((a, b) => (b.fechaDeteccion || "").localeCompare(a.fechaDeteccion || "")),
  })).filter((col) => col.items.length > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <NotebookPen size={16} style={{ color: ACENTO }} />
        <h2 className="text-sm font-bold text-[#1A1A1A]">Registro de Casos</h2>
        <span className="text-xs text-gray-400">· tablero por estado</span>
        {filtroEtapa && (
          <button onClick={onLimpiarFiltro} className="text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-gray-300">
            ✕ Etapa: {filtroEtapa}
          </button>
        )}
      </div>
      {columnas.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">No hay casos que coincidan con el filtro.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columnas.map((col) => (
            <div key={col.estado} className="flex-shrink-0 w-64">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{col.estado}</p>
                <span className="text-[10px] font-bold text-white rounded-full px-1.5" style={{ backgroundColor: col.color }}>{col.items.length}</span>
              </div>
              <div className="space-y-2">
                {col.items.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-gray-100 border-l-4 p-3 hover:shadow-md transition-all"
                    style={{ borderLeftColor: colorSeveridadNC(c.severidad) }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] text-gray-400">{c.radicado}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: colorSeveridadNC(c.severidad) }}>
                        {c.severidad}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A1A] mt-1.5 line-clamp-2">{c.productoNombre || "Sin producto"}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{c.etapaDeteccion}</p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400">
                        {estaAbiertaNC(c.estado) ? `${diasAbiertaNC(c)}d abierta` : "Cerrada"}
                        {costoTotalNC(c) > 0 && ` · ${formatoMontoNC(costoTotalNC(c))}`}
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
