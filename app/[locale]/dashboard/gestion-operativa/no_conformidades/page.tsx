"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import { parseProductos } from "@/lib/productosFabricados";
import { parseClientes } from "@/lib/clientes";
import {
  parseNoConformidades,
  noConformidadVacia,
  eventoNCVacio,
  siguienteRadicadoNC,
  numeroDeRadicadoNC,
  colorSeveridadNC,
  colorEstadoNC,
  colorResultadoVerificacionNC,
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
  type NoConformidad,
  type EventoNC,
} from "@/lib/noConformidades";

const ITEM_KEY = "no_conformidades_lista";
const MAX_EVID_BYTES = 1_500_000; // ~1.5MB

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function SubHeader({ icono, titulo }: { icono: string; titulo: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-wide px-3 py-2 rounded-lg mb-3">
      <span>{icono}</span>
      {titulo}
    </div>
  );
}

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

export default function NoConformidadesPage() {
  const { user } = useDashboardUser();
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
  const [filtroEstado, setFiltroEstado] = useState("");

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
  const vencidasVerificacion = casos.filter((c) => c.requiereVerificacion && c.resultadoVerificacion === "Pendiente" && estaAbiertaNC(c.estado)).length;

  function campo<K extends keyof NoConformidad>(key: K, value: NoConformidad[K]) {
    setCaso((c) => ({ ...c, [key]: value }));
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
    setNotaNueva("");
    setAutorNota("");
    if (evidFileInputRef.current) evidFileInputRef.current.value = "";
  }

  function editar(c: NoConformidad) {
    setCaso({ ...c, disposiciones: [...c.disposiciones], bitacora: c.bitacora.map((b) => ({ ...b })) });
    setError(null);
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
    reader.onload = () => setCaso((c) => ({ ...c, evidencia: reader.result as string, evidenciaNombre: file.name }));
    reader.readAsDataURL(file);
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
    if (!caso.productoId) {
      setError("Seleccioná el producto afectado.");
      return;
    }
    if (!caso.descripcion.trim()) {
      setError("Ingresá la descripción de la no conformidad.");
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

  const filtrados = casos.filter((c) => {
    if (filtroEtapa && c.etapaDeteccion !== filtroEtapa) return false;
    if (filtroEstado && c.estado !== filtroEstado) return false;
    return true;
  });
  const ordenados = [...filtrados].sort((a, b) => (b.fechaDeteccion || "").localeCompare(a.fechaDeteccion || ""));

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión Operativa
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">No Conformidades</h1>
        <p className="text-gray-500 text-sm mt-1">
          Control de producto no conforme (ISO 9001 · 8.7): identificación, disposición, verificación y acción correctiva.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">📋</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{casos.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Casos totales</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🔴</p>
          <p className={`text-lg font-bold ${abiertos > 0 ? "text-red-500" : "text-[#1A1A1A]"}`}>{abiertos}</p>
          <p className="text-xs text-gray-500 mt-0.5">Casos abiertos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">💰</p>
          <p className="text-lg font-bold text-[#1A1A1A] truncate">{costoTotal > 0 ? formatoMontoNC(costoTotal) : "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">Costo de no calidad</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">⏱️</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{tiempoPromedio !== null ? `${tiempoPromedio}d` : "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">Tiempo promedio de cierre</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🔍</p>
          <p className={`text-lg font-bold ${vencidasVerificacion > 0 ? "text-red-500" : "text-[#1A1A1A]"}`}>{vencidasVerificacion}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pendientes de verificación</p>
        </div>
      </div>

      {/* Distribución por etapa */}
      {resumenEtapa.length > 0 && (
        <Seccion icono="📍" titulo="Distribución por Etapa de Detección">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {resumenEtapa.map((r) => (
              <button
                key={r.etapa}
                onClick={() => setFiltroEtapa(filtroEtapa === r.etapa ? "" : r.etapa)}
                className={`rounded-xl p-3 border text-center transition-colors ${
                  filtroEtapa === r.etapa ? "border-transparent text-white bg-[#1A1A1A]" : "bg-[#FAFAFA] border-gray-100 text-[#1A1A1A] hover:border-gray-200"
                }`}
              >
                <p className="text-xl font-bold">{r.cantidad}</p>
                <p className={`text-[10px] uppercase tracking-wide font-bold mt-0.5 ${filtroEtapa === r.etapa ? "text-white/90" : "text-gray-400"}`}>{r.etapa}</p>
              </button>
            ))}
          </div>
        </Seccion>
      )}

      {/* Ranking por producto */}
      {ranking.length > 0 && (
        <Seccion icono="🏆" titulo="Productos con Más No Conformidades">
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
        </Seccion>
      )}

      {productos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Necesitás tener al menos un producto dado de alta para registrar una no conformidad.</p>
          <Link href={`${basePath}/inscripcion_productos`} className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm">
            Dar de alta un producto
          </Link>
        </div>
      ) : (
        <>
          {/* Formulario */}
          <Seccion icono="🧭" titulo={editando ? `Editando ${caso.radicado}` : `Nuevo caso — ${caso.radicado}`}>
            <div className="space-y-5">
              {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
              {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Caso guardado</div>}

              {/* Identificación */}
              <div>
                <SubHeader icono="🏷️" titulo="Identificación" />
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelClass}><span className="text-red-500">*</span> Producto afectado</label>
                    <select value={caso.productoId} onChange={(e) => campo("productoId", e.target.value)} className={inputClass}>
                      <option value="">Seleccioná</option>
                      {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
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
                  <div className="sm:col-span-2">
                    <label className={labelClass}><span className="text-red-500">*</span> Descripción de la no conformidad</label>
                    <textarea value={caso.descripcion} onChange={(e) => campo("descripcion", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Requisito / especificación incumplida</label>
                    <input value={caso.requisitoIncumplido} onChange={(e) => campo("requisitoIncumplido", e.target.value)} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Evidencia (foto / documento)</label>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => evidFileInputRef.current?.click()}
                        className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410] bg-white border border-gray-200 px-3 py-1.5 rounded-lg"
                      >
                        📎 Subir archivo
                      </button>
                      <input ref={evidFileInputRef} type="file" accept="image/*,.pdf" onChange={handleEvidencia} className="hidden" />
                      {caso.evidencia && <span className="text-xs text-gray-500 truncate max-w-[200px]">{caso.evidenciaNombre || "Archivo cargado"}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clasificación */}
              <div>
                <SubHeader icono="🚦" titulo="Clasificación" />
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelClass}>Severidad</label>
                    <div className="flex gap-1.5">
                      {SEVERIDADES_NC.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => campo("severidad", s)}
                          className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border ${caso.severidad === s ? "text-white border-transparent" : "border-gray-200 text-gray-500"}`}
                          style={caso.severidad === s ? { backgroundColor: colorSeveridadNC(s) } : {}}
                        >
                          {s}
                        </button>
                      ))}
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
              </div>

              {/* Disposición */}
              <div>
                <SubHeader icono="⚖️" titulo="Disposición (ISO 9001 · 8.7.1)" />
                <div className="grid sm:grid-cols-2 gap-1.5 mb-2.5">
                  {DISPOSICIONES_NC.map((d) => (
                    <label key={d} className="flex items-center gap-2 text-xs text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-lg px-3 py-2 cursor-pointer">
                      <input type="checkbox" checked={caso.disposiciones.includes(d)} onChange={() => toggleDisposicion(d)} className="accent-[#F5A623]" />
                      {d}
                    </label>
                  ))}
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className={labelClass}>Detalle de la disposición</label>
                    <textarea value={caso.detalleDisposicion} onChange={(e) => campo("detalleDisposicion", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
                  </div>
                  {caso.disposiciones.includes("Concesión (aceptación con autorización)") && (
                    <div className="grid sm:grid-cols-2 gap-2.5 bg-[#FFF8E8] rounded-lg p-3 border border-[#F5A623]/30">
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
              </div>

              {/* Verificación */}
              <div>
                <SubHeader icono="🔍" titulo="Verificación de la Corrección" />
                <div className="flex gap-1.5 mb-2.5">
                  <button type="button" onClick={() => campo("requiereVerificacion", true)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border ${caso.requiereVerificacion ? "bg-[#1A1A1A] text-white border-transparent" : "border-gray-200 text-gray-500"}`}>
                    Requiere verificación
                  </button>
                  <button type="button" onClick={() => campo("requiereVerificacion", false)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border ${!caso.requiereVerificacion ? "bg-[#1A1A1A] text-white border-transparent" : "border-gray-200 text-gray-500"}`}>
                    No aplica
                  </button>
                </div>
                {caso.requiereVerificacion && (
                  <div className="grid sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className={labelClass}>Fecha de verificación</label>
                      <input type="date" value={caso.fechaVerificacion} onChange={(e) => campo("fechaVerificacion", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Responsable</label>
                      <input value={caso.responsableVerificacion} onChange={(e) => campo("responsableVerificacion", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Resultado</label>
                      <select value={caso.resultadoVerificacion} onChange={(e) => campo("resultadoVerificacion", e.target.value)} className={inputClass}>
                        {RESULTADOS_VERIFICACION_NC.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Costo de no calidad */}
              <div>
                <SubHeader icono="💰" titulo="Costo de No Calidad" />
                <div className="grid sm:grid-cols-4 gap-2.5">
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
                {costoTotalNC(caso) > 0 && (
                  <div className="bg-[#1A1A1A] rounded-xl p-3 flex items-center justify-between mt-2.5">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Costo total del caso</p>
                    <p className="text-base font-extrabold text-white">{formatoMontoNC(costoTotalNC(caso))} <span className="text-xs text-gray-400 font-normal">{caso.moneda}</span></p>
                  </div>
                )}
              </div>

              {/* Acción correctiva */}
              <div>
                <SubHeader icono="🛠️" titulo="Acción Correctiva" />
                <div className="flex gap-1.5 mb-2.5">
                  <button type="button" onClick={() => campo("requiereAccionCorrectiva", true)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border ${caso.requiereAccionCorrectiva ? "bg-[#1A1A1A] text-white border-transparent" : "border-gray-200 text-gray-500"}`}>
                    Requiere acción correctiva
                  </button>
                  <button type="button" onClick={() => campo("requiereAccionCorrectiva", false)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border ${!caso.requiereAccionCorrectiva ? "bg-[#1A1A1A] text-white border-transparent" : "border-gray-200 text-gray-500"}`}>
                    No aplica
                  </button>
                </div>
                {caso.requiereAccionCorrectiva && (
                  <div className="space-y-2.5">
                    <div>
                      <label className={labelClass}>Análisis de causa raíz</label>
                      <textarea value={caso.analisisCausaRaiz} onChange={(e) => campo("analisisCausaRaiz", e.target.value)} rows={3} placeholder="Ej: 5 Por qués, Ishikawa, etc." className={`${inputClass} resize-y`} />
                    </div>
                    <div>
                      <label className={labelClass}>Plan de acción</label>
                      <textarea value={caso.planAccion} onChange={(e) => campo("planAccion", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2.5">
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

              {/* Estado */}
              <div>
                <SubHeader icono="📌" titulo="Estado del Caso" />
                <div className="flex items-center gap-2 flex-wrap mb-2.5">
                  {ESTADOS_NC.map((e) => {
                    const activo = caso.estado === e;
                    return (
                      <button
                        key={e}
                        type="button"
                        onClick={() => campo("estado", e)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${activo ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
                        style={activo ? { backgroundColor: colorEstadoNC(e) } : {}}
                      >
                        {e}
                      </button>
                    );
                  })}
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelClass}>Responsable del caso</label>
                    <input value={caso.responsableCaso} onChange={(e) => campo("responsableCaso", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Fecha de cierre</label>
                    <input type="date" value={caso.fechaCierre} onChange={(e) => campo("fechaCierre", e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Bitácora */}
              <div>
                <SubHeader icono="🧭" titulo="Bitácora de Seguimiento" />
                {caso.bitacora.length > 0 ? (
                  <div className="space-y-0 mb-3 border-l-2 border-gray-100 ml-1.5 pl-4">
                    {[...caso.bitacora].reverse().map((b: EventoNC) => (
                      <div key={b.id} className="relative pb-4 last:pb-0">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
                        <p className="text-sm text-[#1A1A1A]">{b.nota}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                          {fechaHoraLegible(b.fecha)} · {b.autor}
                          <button type="button" onClick={() => quitarNota(b.id)} className="text-gray-300 hover:text-red-500">✕</button>
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
                    <button type="button" onClick={agregarNota} className="flex-shrink-0 bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#e09410] whitespace-nowrap">
                      + Agregar
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Observaciones</label>
                <textarea value={caso.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button onClick={guardar} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
                  {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar caso"}
                </button>
                <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                  {editando ? "Nuevo caso en blanco" : "Limpiar"}
                </button>
              </div>
            </div>
          </Seccion>

          {/* Registro */}
          <Seccion icono="🗂️" titulo="Registro de Casos">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setFiltroEstado("")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroEstado === "" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-gray-200 text-gray-500"}`}
              >
                Todos los estados
              </button>
              {ESTADOS_NC.map((e) => (
                <button
                  key={e}
                  onClick={() => setFiltroEstado(filtroEstado === e ? "" : e)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroEstado === e ? "text-white border-transparent" : "border-gray-200 text-gray-500"}`}
                  style={filtroEstado === e ? { backgroundColor: colorEstadoNC(e) } : {}}
                >
                  {e}
                </button>
              ))}
              {filtroEtapa && (
                <button onClick={() => setFiltroEtapa("")} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-500">
                  ✕ Etapa: {filtroEtapa}
                </button>
              )}
            </div>

            {ordenados.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No hay casos que coincidan con el filtro.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[960px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="p-2.5 font-semibold border-b border-gray-100">Radicado</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Producto</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Severidad</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Etapa</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Estado</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Detección</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Días abierta</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Costo</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenados.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                        <td className="p-2.5 font-mono font-semibold text-[#1A1A1A] whitespace-nowrap">{c.radicado}</td>
                        <td className="p-2.5 text-gray-600 max-w-[180px] truncate">{c.productoNombre}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorSeveridadNC(c.severidad) }}>
                            {c.severidad}
                          </span>
                        </td>
                        <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.etapaDeteccion}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoNC(c.estado) }}>
                            {c.estado}
                          </span>
                        </td>
                        <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(c.fechaDeteccion)}</td>
                        <td className="p-2.5 text-gray-600 whitespace-nowrap">{estaAbiertaNC(c.estado) ? `${diasAbiertaNC(c)}d` : "—"}</td>
                        <td className="p-2.5 text-gray-600 whitespace-nowrap">{costoTotalNC(c) > 0 ? formatoMontoNC(costoTotalNC(c)) : "—"}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <button onClick={() => editar(c)} className="text-[#F5A623] font-semibold hover:text-[#e09410] mr-2">Editar</button>
                          <button onClick={() => eliminar(c.id)} className="text-gray-300 hover:text-red-500">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Seccion>
        </>
      )}
    </div>
  );
}
