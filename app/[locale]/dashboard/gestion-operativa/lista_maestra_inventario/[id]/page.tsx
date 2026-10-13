"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion, Dato } from "@/components/dashboard/SeccionDocumento";
import {
  parseInventario,
  eventoInventarioVacio,
  mantenimientoVacio,
  registroCalibracionVacio,
  colorEstadoItem,
  colorCriticidadItem,
  estadoMantenimiento,
  estadoCalibracion,
  colorEstadoAlerta,
  etiquetaEstadoAlerta,
  diasHastaProximoMantenimiento,
  diasHastaProximaCalibracion,
  formatoMonto,
  colorTipoMantenimiento,
  colorEstadoMantenimiento,
  estaVencidoMantenimiento,
  costoTotalMantenimientos,
  tiempoParadaTotalHoras,
  colorResultadoCalibracion,
  TIPOS_EVENTO_INVENTARIO,
  TIPOS_MANTENIMIENTO,
  ESTADOS_MANTENIMIENTO,
  RESULTADOS_CALIBRACION,
  type ItemInventario,
  type EventoInventario,
  type Mantenimiento,
  type RegistroCalibracion,
} from "@/lib/inventario";

const ITEM_KEY = "inventario_lista";
const MAX_CERT_BYTES = 1_500_000; // ~1.5MB

const TABS = [
  { key: "generales", label: "Datos Generales" },
  { key: "mantenimientos", label: "Mantenimientos" },
  { key: "calibracion", label: "Calibración" },
];

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function fechaLegible(iso?: string) {
  if (!iso) return undefined;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function fechaCorta(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function HojaDeVidaPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading, save } = useGestionDocumentos("operativa", user?.id ?? null);
  const [tab, setTab] = useState("generales");
  const [items, setItems] = useState<ItemInventario[]>([]);
  const [eventoNuevo, setEventoNuevo] = useState<EventoInventario>(eventoInventarioVacio());
  const [guardandoEvento, setGuardandoEvento] = useState(false);
  const [errorEvento, setErrorEvento] = useState<string | null>(null);
  const [mantenimiento, setMantenimiento] = useState<Mantenimiento>(mantenimientoVacio());
  const [guardandoMant, setGuardandoMant] = useState(false);
  const [errorMant, setErrorMant] = useState<string | null>(null);
  const [calibracion, setCalibracion] = useState<RegistroCalibracion>(registroCalibracionVacio());
  const [guardandoCal, setGuardandoCal] = useState(false);
  const [errorCal, setErrorCal] = useState<string | null>(null);
  const certFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) setItems(parseInventario(docs[ITEM_KEY] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const item = items.find((x) => x.id === id);

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`${basePath}/lista_maestra_inventario`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
          ← Lista Maestra de Inventario
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">No se encontró este ítem.</p>
        </div>
      </div>
    );
  }

  const alertaMant = estadoMantenimiento(item);
  const alertaCal = estadoCalibracion(item);
  const diasMant = diasHastaProximoMantenimiento(item);
  const diasCal = diasHastaProximaCalibracion(item);
  const bitacoraOrdenada = [...item.bitacora].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  const mantenimientosOrdenados = [...item.mantenimientos].sort((a, b) =>
    (b.fechaRealizada || b.fechaProgramada || "").localeCompare(a.fechaRealizada || a.fechaProgramada || "")
  );
  const editandoMant = item.mantenimientos.some((m) => m.id === mantenimiento.id);
  const preventivos = item.mantenimientos.filter((m) => m.tipo === "Preventivo").length;
  const correctivos = item.mantenimientos.filter((m) => m.tipo === "Correctivo").length;
  const costoTotalMant = costoTotalMantenimientos(item.mantenimientos);
  const tiempoParadaTotal = tiempoParadaTotalHoras(item.mantenimientos);
  const vencidosProgramados = item.mantenimientos.filter((m) => estaVencidoMantenimiento(m)).length;
  const calibracionesOrdenadas = [...item.calibraciones].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  const editandoCal = item.calibraciones.some((c) => c.id === calibracion.id);
  const ultimaCalReg = calibracionesOrdenadas[0];

  async function agregarEvento() {
    if (!item) return;
    if (!eventoNuevo.descripcion.trim()) {
      setErrorEvento("Ingresá una descripción del evento.");
      return;
    }
    setErrorEvento(null);
    setGuardandoEvento(true);
    const itemActualizado: ItemInventario = { ...item, bitacora: [...item.bitacora, eventoNuevo] };
    const actualizados = items.map((x) => (x.id === item.id ? itemActualizado : x));
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setItems(actualizados);
    setEventoNuevo(eventoInventarioVacio());
    setGuardandoEvento(false);
  }

  async function eliminarEvento(eventoId: string) {
    if (!item) return;
    setGuardandoEvento(true);
    const itemActualizado: ItemInventario = { ...item, bitacora: item.bitacora.filter((e) => e.id !== eventoId) };
    const actualizados = items.map((x) => (x.id === item.id ? itemActualizado : x));
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setItems(actualizados);
    setGuardandoEvento(false);
  }

  function campoMant<K extends keyof Mantenimiento>(key: K, value: Mantenimiento[K]) {
    setMantenimiento((m) => ({ ...m, [key]: value }));
  }

  function limpiarMant() {
    setMantenimiento(mantenimientoVacio());
    setErrorMant(null);
  }

  function editarMant(m: Mantenimiento) {
    setMantenimiento({ ...m });
    setErrorMant(null);
  }

  async function guardarMantenimiento() {
    if (!item) return;
    if (!mantenimiento.descripcion.trim()) {
      setErrorMant("Ingresá una descripción del mantenimiento.");
      return;
    }
    setErrorMant(null);
    setGuardandoMant(true);
    const mantenimientosActualizados = [
      ...item.mantenimientos.filter((m) => m.id !== mantenimiento.id),
      mantenimiento,
    ];
    const itemActualizado: ItemInventario = {
      ...item,
      mantenimientos: mantenimientosActualizados,
      ultimoMantenimiento:
        mantenimiento.estado === "Completado"
          ? mantenimiento.fechaRealizada || mantenimiento.fechaProgramada || item.ultimoMantenimiento
          : item.ultimoMantenimiento,
    };
    const actualizados = items.map((x) => (x.id === item.id ? itemActualizado : x));
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setItems(actualizados);
    setMantenimiento(mantenimientoVacio());
    setGuardandoMant(false);
  }

  async function eliminarMantenimiento(mantId: string) {
    if (!item) return;
    setGuardandoMant(true);
    const itemActualizado: ItemInventario = { ...item, mantenimientos: item.mantenimientos.filter((m) => m.id !== mantId) };
    const actualizados = items.map((x) => (x.id === item.id ? itemActualizado : x));
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setItems(actualizados);
    if (mantenimiento.id === mantId) limpiarMant();
    setGuardandoMant(false);
  }

  function campoCal<K extends keyof RegistroCalibracion>(key: K, value: RegistroCalibracion[K]) {
    setCalibracion((c) => ({ ...c, [key]: value }));
  }

  function limpiarCal() {
    setCalibracion(registroCalibracionVacio());
    setErrorCal(null);
    if (certFileInputRef.current) certFileInputRef.current.value = "";
  }

  function editarCal(c: RegistroCalibracion) {
    setCalibracion({ ...c });
    setErrorCal(null);
  }

  function handleCertificado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_CERT_BYTES) {
      setErrorCal("El archivo es muy pesado. Usá uno de menos de 1.5MB.");
      return;
    }
    setErrorCal(null);
    const reader = new FileReader();
    reader.onload = () => setCalibracion((c) => ({ ...c, certificado: reader.result as string, certificadoNombre: file.name }));
    reader.readAsDataURL(file);
  }

  async function guardarCalibracion() {
    if (!item) return;
    if (!calibracion.entidadCalibradora.trim()) {
      setErrorCal("Ingresá la entidad u organismo que realizó la calibración.");
      return;
    }
    setErrorCal(null);
    setGuardandoCal(true);
    const calibracionesActualizadas = [...item.calibraciones.filter((c) => c.id !== calibracion.id), calibracion];
    const itemActualizado: ItemInventario = {
      ...item,
      calibraciones: calibracionesActualizadas,
      ultimaCalibracion: calibracion.fecha || item.ultimaCalibracion,
      proximaCalibracion: calibracion.proximaCalibracion || item.proximaCalibracion,
    };
    const actualizados = items.map((x) => (x.id === item.id ? itemActualizado : x));
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setItems(actualizados);
    limpiarCal();
    setGuardandoCal(false);
  }

  async function eliminarCalibracion(calId: string) {
    if (!item) return;
    setGuardandoCal(true);
    const itemActualizado: ItemInventario = { ...item, calibraciones: item.calibraciones.filter((c) => c.id !== calId) };
    const actualizados = items.map((x) => (x.id === item.id ? itemActualizado : x));
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setItems(actualizados);
    if (calibracion.id === calId) limpiarCal();
    setGuardandoCal(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Link href={`${basePath}/lista_maestra_inventario`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Lista Maestra de Inventario
      </Link>

      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 overflow-hidden flex flex-col sm:flex-row sm:items-center gap-5">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />

        <div className="relative w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 flex-shrink-0 overflow-hidden mx-auto sm:mx-0 z-10 flex items-center justify-center">
          {item.imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">⚙️</span>
          )}
        </div>
        <div className="relative flex-1 min-w-0 text-center sm:text-left z-10">
          <h1 className="text-xl font-bold text-white">{item.nombre}</h1>
          <p className="text-[#F5A623] font-semibold text-sm">{item.codigo || "Sin código asignado"}</p>
          <div className="flex items-center justify-center sm:justify-start gap-x-4 gap-y-1 flex-wrap text-xs text-gray-400 mt-2">
            {item.tipo && <span>🏷️ {item.tipo}</span>}
            {item.marca && <span>🏭 {item.marca}{item.modelo ? ` · ${item.modelo}` : ""}</span>}
            {item.ubicacion && <span>📍 {item.ubicacion}</span>}
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap mt-2">
            {item.estado && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoItem(item.estado) }}>
                {item.estado}
              </span>
            )}
            {item.criticidad && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorCriticidadItem(item.criticidad) }}>
                Criticidad {item.criticidad}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`${basePath}/inscripcion_inventario`}
          className="relative z-10 text-xs font-semibold text-[#F5A623] hover:text-[#e09410] flex-shrink-0 self-center sm:self-start bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
        >
          ✎ Editar datos
        </Link>
      </div>

      {/* Alertas de mantenimiento / calibración */}
      {(alertaMant === "vencido" || alertaMant === "proximo" || alertaCal === "vencido" || alertaCal === "proximo") && (
        <div className="grid sm:grid-cols-2 gap-3">
          {(alertaMant === "vencido" || alertaMant === "proximo") && (
            <div className="rounded-xl p-3.5 border flex items-center gap-3" style={{ borderColor: colorEstadoAlerta(alertaMant), backgroundColor: `${colorEstadoAlerta(alertaMant)}0D` }}>
              <span className="text-xl">🛠️</span>
              <div>
                <p className="text-sm font-bold" style={{ color: colorEstadoAlerta(alertaMant) }}>
                  Mantenimiento {etiquetaEstadoAlerta(alertaMant).toLowerCase()}
                </p>
                <p className="text-xs text-gray-500">
                  {diasMant !== null && diasMant < 0 ? `Venció hace ${Math.abs(diasMant)} día(s)` : diasMant !== null ? `En ${diasMant} día(s)` : ""} · {fechaCorta(item.proximoMantenimiento)}
                </p>
              </div>
            </div>
          )}
          {(alertaCal === "vencido" || alertaCal === "proximo") && (
            <div className="rounded-xl p-3.5 border flex items-center gap-3" style={{ borderColor: colorEstadoAlerta(alertaCal), backgroundColor: `${colorEstadoAlerta(alertaCal)}0D` }}>
              <span className="text-xl">📏</span>
              <div>
                <p className="text-sm font-bold" style={{ color: colorEstadoAlerta(alertaCal) }}>
                  Calibración {alertaCal === "vencido" ? "vencida" : "próxima"}
                </p>
                <p className="text-xs text-gray-500">
                  {diasCal !== null && diasCal < 0 ? `Venció hace ${Math.abs(diasCal)} día(s)` : diasCal !== null ? `En ${diasCal} día(s)` : ""} · {fechaCorta(item.proximaCalibracion)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pestañas */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto sticky top-0 z-20">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? "border-[#F5A623] text-[#1A1A1A]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "generales" && (
      <div className="space-y-4">

      {/* Identificación */}
      <Seccion icono="🏷️" titulo="Identificación">
        <div className="grid sm:grid-cols-3 gap-3">
          <Dato icono="🪪" label="Código" valor={item.codigo} />
          <Dato icono="🏷️" label="Tipo" valor={item.tipo} />
          <Dato icono="🏭" label="Marca" valor={item.marca} />
          <Dato label="Modelo" valor={item.modelo} />
          <Dato label="Número de serie" valor={item.numeroSerie} />
          <Dato label="Fabricante" valor={item.fabricante} />
          <Dato label="Año de fabricación" valor={item.anioFabricacion} />
        </div>
      </Seccion>

      {/* Ubicación y responsable */}
      {(item.ubicacion || item.responsable || item.proveedor) && (
        <Seccion icono="📍" titulo="Ubicación y responsable">
          <div className="grid sm:grid-cols-3 gap-3">
            <Dato icono="📍" label="Ubicación" valor={item.ubicacion} />
            <Dato icono="👤" label="Responsable / custodio" valor={item.responsable} />
            <Dato icono="🤝" label="Proveedor" valor={item.proveedor} />
          </div>
        </Seccion>
      )}

      {/* Adquisición */}
      <Seccion icono="🧾" titulo="Adquisición">
        <div className="grid sm:grid-cols-3 gap-3">
          <Dato icono="📅" label="Fecha de adquisición" valor={fechaLegible(item.fechaAdquisicion)} />
          <Dato icono="💰" label="Valor de adquisición" valor={item.valorAdquisicion ? `${formatoMonto(item.valorAdquisicion)} ${item.moneda.split(" ")[0]}` : undefined} />
          <Dato label="Vida útil estimada" valor={item.vidaUtilAnios ? `${item.vidaUtilAnios} año(s)` : undefined} />
          <Dato label="Nº de factura / OC" valor={item.numeroFactura} />
          <Dato icono="🛡️" label="Garantía hasta" valor={fechaLegible(item.garantiaHasta)} />
        </div>
      </Seccion>

      {/* Especificaciones técnicas */}
      {(item.capacidadPotencia || item.voltaje || item.dimensiones || item.pesoKg || item.especificacionesTecnicas) && (
        <Seccion icono="⚙️" titulo="Especificaciones técnicas">
          <div className="grid sm:grid-cols-3 gap-3">
            <Dato label="Capacidad / Potencia" valor={item.capacidadPotencia} />
            <Dato label="Voltaje / Alimentación" valor={item.voltaje} />
            <Dato label="Dimensiones" valor={item.dimensiones} />
            <Dato label="Peso" valor={item.pesoKg ? `${item.pesoKg} Kg` : undefined} />
          </div>
          {item.especificacionesTecnicas && (
            <p className="text-sm text-gray-600 whitespace-pre-wrap mt-3 pt-3 border-t border-gray-100">{item.especificacionesTecnicas}</p>
          )}
        </Seccion>
      )}

      </div>
      )}

      {tab === "mantenimientos" && (
      <div className="space-y-4">
      {/* Sistema de mantenimientos */}
      <Seccion icono="🛠️" titulo="Sistema de Mantenimientos">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
            <p className="text-lg font-bold text-[#1A1A1A]">{item.mantenimientos.length}</p>
            <p className="text-[11px] text-gray-500">Registros totales</p>
          </div>
          <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
            <p className="text-lg font-bold text-blue-600">{preventivos}</p>
            <p className="text-[11px] text-gray-500">Preventivos</p>
          </div>
          <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
            <p className="text-lg font-bold text-red-500">{correctivos}</p>
            <p className="text-[11px] text-gray-500">Correctivos</p>
          </div>
          <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
            <p className="text-lg font-bold text-[#1A1A1A] truncate">{costoTotalMant > 0 ? formatoMonto(costoTotalMant) : "—"}</p>
            <p className="text-[11px] text-gray-500">Costo acumulado</p>
          </div>
          <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
            <p className={`text-lg font-bold ${vencidosProgramados > 0 ? "text-red-500" : "text-[#1A1A1A]"}`}>{vencidosProgramados}</p>
            <p className="text-[11px] text-gray-500">Programados vencidos</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
          <Dato label="Frecuencia planificada" valor={item.frecuenciaMantenimiento} />
          <Dato icono="📅" label="Último mantenimiento" valor={fechaLegible(item.ultimoMantenimiento)} />
          <Dato icono="📅" label="Próximo mantenimiento" valor={fechaLegible(item.proximoMantenimiento)} />
        </div>

        {errorMant && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs mb-3">{errorMant}</div>}

        {/* Formulario */}
        <div className="bg-[#FAFAFA] rounded-xl p-3.5 border border-gray-100 space-y-2.5 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
              {editandoMant ? "Editando registro" : "Nuevo registro de mantenimiento"}
            </p>
            <div className="flex gap-1.5">
              {TIPOS_MANTENIMIENTO.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => campoMant("tipo", t)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    mantenimiento.tipo === t ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200"
                  }`}
                  style={mantenimiento.tipo === t ? { backgroundColor: colorTipoMantenimiento(t) } : {}}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-2.5">
            <div>
              <label className={labelClass}>Estado</label>
              <select value={mantenimiento.estado} onChange={(e) => campoMant("estado", e.target.value)} className={inputClass}>
                {ESTADOS_MANTENIMIENTO.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fecha programada</label>
              <input type="date" value={mantenimiento.fechaProgramada} onChange={(e) => campoMant("fechaProgramada", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha realizada</label>
              <input type="date" value={mantenimiento.fechaRealizada} onChange={(e) => campoMant("fechaRealizada", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Responsable / técnico</label>
              <input value={mantenimiento.responsable} onChange={(e) => campoMant("responsable", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Descripción del trabajo</label>
            <input
              value={mantenimiento.descripcion}
              onChange={(e) => campoMant("descripcion", e.target.value)}
              placeholder={mantenimiento.tipo === "Correctivo" ? "Ej: Falla en rodamiento del eje principal" : "Ej: Lubricación y ajuste general"}
              className={inputClass}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-2.5">
            <div>
              <label className={labelClass}>Repuestos utilizados</label>
              <input value={mantenimiento.repuestos} onChange={(e) => campoMant("repuestos", e.target.value)} placeholder="Opcional" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tiempo de parada (horas)</label>
              <input
                type="number"
                min={0}
                value={mantenimiento.tiempoParadaHoras || ""}
                onChange={(e) => campoMant("tiempoParadaHoras", Math.max(0, Number(e.target.value) || 0))}
                onWheel={(e) => e.currentTarget.blur()}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Costo</label>
              <input
                type="number"
                min={0}
                value={mantenimiento.costo || ""}
                onChange={(e) => campoMant("costo", Math.max(0, Number(e.target.value) || 0))}
                onWheel={(e) => e.currentTarget.blur()}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea value={mantenimiento.observaciones} onChange={(e) => campoMant("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={guardarMantenimiento}
              disabled={guardandoMant}
              className="bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
            >
              {guardandoMant ? "Guardando..." : editandoMant ? "Guardar cambios" : "+ Registrar mantenimiento"}
            </button>
            {editandoMant && (
              <button type="button" onClick={limpiarMant} className="text-xs text-gray-400 hover:text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100">
                Nuevo registro en blanco
              </button>
            )}
          </div>
        </div>

        {/* Registro */}
        {mantenimientosOrdenados.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Todavía no hay mantenimientos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[720px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2.5 font-semibold border-b border-gray-100">Tipo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Estado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Fecha</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Descripción</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Responsable</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Costo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody>
                {mantenimientosOrdenados.map((m) => {
                  const vencido = estaVencidoMantenimiento(m);
                  return (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorTipoMantenimiento(m.tipo) }}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: vencido ? "#EF4444" : colorEstadoMantenimiento(m.estado) }}
                        >
                          {vencido ? "Vencido" : m.estado}
                        </span>
                      </td>
                      <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(m.fechaRealizada || m.fechaProgramada)}</td>
                      <td className="p-2.5 text-gray-600 max-w-[240px] truncate">{m.descripcion}</td>
                      <td className="p-2.5 text-gray-600 whitespace-nowrap">{m.responsable || "—"}</td>
                      <td className="p-2.5 text-gray-600 whitespace-nowrap">{m.costo > 0 ? formatoMonto(m.costo) : "—"}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <button type="button" onClick={() => editarMant(m)} className="text-[#F5A623] font-semibold hover:text-[#e09410] mr-2">Editar</button>
                        <button type="button" onClick={() => eliminarMantenimiento(m.id)} className="text-gray-300 hover:text-red-500">Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      {/* Bitácora / historial */}
      <Seccion icono="🧭" titulo="Bitácora / Historial">
        {errorEvento && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs mb-3">{errorEvento}</div>}

        {bitacoraOrdenada.length > 0 ? (
          <div className="space-y-0 mb-4 border-l-2 border-gray-100 ml-1.5 pl-4">
            {bitacoraOrdenada.map((e) => (
              <div key={e.id} className="relative pb-4 last:pb-0">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#1A1A1A]">{e.tipo}</span>
                  <span className="text-[11px] text-gray-400">{fechaCorta(e.fecha)}</span>
                  {e.responsable && <span className="text-[11px] text-gray-400">· {e.responsable}</span>}
                  {e.costo > 0 && <span className="text-[11px] text-gray-400">· {formatoMonto(e.costo)}</span>}
                  <button type="button" onClick={() => eliminarEvento(e.id)} className="text-gray-300 hover:text-red-500 ml-auto">✕</button>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{e.descripcion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-4">Todavía no hay entradas en la bitácora.</p>
        )}

        <div className="bg-[#FAFAFA] rounded-xl p-3.5 border border-gray-100 space-y-2.5">
          <div className="grid sm:grid-cols-3 gap-2.5">
            <div>
              <label className={labelClass}>Tipo de evento</label>
              <select value={eventoNuevo.tipo} onChange={(e) => setEventoNuevo((ev) => ({ ...ev, tipo: e.target.value }))} className={inputClass}>
                {TIPOS_EVENTO_INVENTARIO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={eventoNuevo.fecha} onChange={(e) => setEventoNuevo((ev) => ({ ...ev, fecha: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Responsable</label>
              <input value={eventoNuevo.responsable} onChange={(e) => setEventoNuevo((ev) => ({ ...ev, responsable: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input
              value={eventoNuevo.descripcion}
              onChange={(e) => setEventoNuevo((ev) => ({ ...ev, descripcion: e.target.value }))}
              placeholder="Ej: Cambio de rodamientos del eje principal"
              className={inputClass}
            />
          </div>
          <div className="flex items-end gap-2.5">
            <div className="w-40">
              <label className={labelClass}>Costo (opcional)</label>
              <input
                type="number"
                min={0}
                value={eventoNuevo.costo || ""}
                onChange={(e) => setEventoNuevo((ev) => ({ ...ev, costo: Math.max(0, Number(e.target.value) || 0) }))}
                onWheel={(e) => e.currentTarget.blur()}
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={agregarEvento}
              disabled={guardandoEvento}
              className="bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#e09410] disabled:opacity-60 whitespace-nowrap"
            >
              {guardandoEvento ? "Guardando..." : "+ Agregar a la bitácora"}
            </button>
          </div>
        </div>
      </Seccion>
      </div>
      )}

      {tab === "generales" && (
      <div className="space-y-4">
      {/* Observaciones */}
      {item.observaciones && (
        <Seccion icono="📝" titulo="Observaciones">
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.observaciones}</p>
        </Seccion>
      )}
      </div>
      )}

      {tab === "calibracion" && (
      <div className="space-y-4">
      <Seccion icono="📏" titulo="Calibración de Equipos">
        {!item.requiereCalibracion ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">⏭️</p>
            <p className="text-gray-500 text-sm mb-1">Este ítem está marcado como que no requiere calibración.</p>
            <p className="text-gray-400 text-xs">Si corresponde, activalo desde &ldquo;Editar datos&rdquo; → sección Calibración.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
                <p className="text-lg font-bold text-[#1A1A1A]">{item.calibraciones.length}</p>
                <p className="text-[11px] text-gray-500">Registros totales</p>
              </div>
              <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
                <p className="text-sm font-bold" style={{ color: ultimaCalReg ? colorResultadoCalibracion(ultimaCalReg.resultado) : "#9CA3AF" }}>
                  {ultimaCalReg ? ultimaCalReg.resultado : "—"}
                </p>
                <p className="text-[11px] text-gray-500">Último resultado</p>
              </div>
              <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
                <p className="text-sm font-bold text-[#1A1A1A]">{fechaLegible(item.ultimaCalibracion) || "—"}</p>
                <p className="text-[11px] text-gray-500">Última calibración</p>
              </div>
              <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
                <p className="text-sm font-bold" style={{ color: colorEstadoAlerta(alertaCal) }}>{fechaLegible(item.proximaCalibracion) || "—"}</p>
                <p className="text-[11px] text-gray-500">Próxima calibración</p>
              </div>
            </div>

            <div className="mb-4 pb-4 border-b border-gray-100">
              <Dato label="Frecuencia planificada" valor={item.frecuenciaCalibracion} />
            </div>

            {errorCal && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs mb-3">{errorCal}</div>}

            {/* Formulario */}
            <div className="bg-[#FAFAFA] rounded-xl p-3.5 border border-gray-100 space-y-2.5 mb-4">
              <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
                {editandoCal ? "Editando registro" : "Nuevo registro de calibración"}
              </p>

              <div className="grid sm:grid-cols-4 gap-2.5">
                <div>
                  <label className={labelClass}>Fecha de calibración</label>
                  <input type="date" value={calibracion.fecha} onChange={(e) => campoCal("fecha", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Resultado</label>
                  <select value={calibracion.resultado} onChange={(e) => campoCal("resultado", e.target.value)} className={inputClass}>
                    {RESULTADOS_CALIBRACION.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Próxima calibración</label>
                  <input type="date" value={calibracion.proximaCalibracion} onChange={(e) => campoCal("proximaCalibracion", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Responsable</label>
                  <input value={calibracion.responsable} onChange={(e) => campoCal("responsable", e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={labelClass}><span className="text-red-500">*</span> Entidad calibradora</label>
                  <input value={calibracion.entidadCalibradora} onChange={(e) => campoCal("entidadCalibradora", e.target.value)} placeholder="Ej: Laboratorio Acreditado XYZ" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Nº de certificado</label>
                  <input value={calibracion.numeroCertificado} onChange={(e) => campoCal("numeroCertificado", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Costo</label>
                  <input
                    type="number"
                    min={0}
                    value={calibracion.costo || ""}
                    onChange={(e) => campoCal("costo", Math.max(0, Number(e.target.value) || 0))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Certificado de calibración (opcional)</label>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => certFileInputRef.current?.click()}
                    className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410] bg-white border border-gray-200 px-3 py-1.5 rounded-lg"
                  >
                    📎 Subir archivo
                  </button>
                  <input ref={certFileInputRef} type="file" accept="image/*,.pdf" onChange={handleCertificado} className="hidden" />
                  {calibracion.certificado && (
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">{calibracion.certificadoNombre || "Archivo cargado"}</span>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Observaciones</label>
                <textarea value={calibracion.observaciones} onChange={(e) => campoCal("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={guardarCalibracion}
                  disabled={guardandoCal}
                  className="bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
                >
                  {guardandoCal ? "Guardando..." : editandoCal ? "Guardar cambios" : "+ Registrar calibración"}
                </button>
                {editandoCal && (
                  <button type="button" onClick={limpiarCal} className="text-xs text-gray-400 hover:text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100">
                    Nuevo registro en blanco
                  </button>
                )}
              </div>
            </div>

            {/* Registro */}
            {calibracionesOrdenadas.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Todavía no hay calibraciones registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[760px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="p-2.5 font-semibold border-b border-gray-100">Fecha</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Resultado</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Entidad calibradora</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Certificado</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Próxima</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Costo</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {calibracionesOrdenadas.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                        <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(c.fecha)}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorResultadoCalibracion(c.resultado) }}>
                            {c.resultado}
                          </span>
                        </td>
                        <td className="p-2.5 text-gray-600 max-w-[200px] truncate">{c.entidadCalibradora}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          {c.certificado ? (
                            <a href={c.certificado} download={c.certificadoNombre || "certificado"} className="text-[#F5A623] font-semibold hover:text-[#e09410]">
                              📎 Descargar
                            </a>
                          ) : "—"}
                        </td>
                        <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(c.proximaCalibracion)}</td>
                        <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.costo > 0 ? formatoMonto(c.costo) : "—"}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <button type="button" onClick={() => editarCal(c)} className="text-[#F5A623] font-semibold hover:text-[#e09410] mr-2">Editar</button>
                          <button type="button" onClick={() => eliminarCalibracion(c.id)} className="text-gray-300 hover:text-red-500">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Seccion>
      </div>
      )}
    </div>
  );
}
