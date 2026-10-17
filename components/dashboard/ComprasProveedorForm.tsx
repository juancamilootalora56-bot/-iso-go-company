"use client";

import { useEffect, useRef, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { Proveedor } from "@/lib/proveedores";
import {
  parseComprasProveedor,
  compraVacia,
  verificacionCompleta,
  formatoMontoCompra,
  colorEstadoCompra,
  colorResultadoVerificacion,
  TIPOS_COMPRA_PROVEEDOR,
  ESTADOS_COMPRA_PROVEEDOR,
  MONEDAS_COMPRA_PROVEEDOR,
  RESULTADOS_VERIFICACION,
  ESTADOS_EMBALAJE,
  type CompraProveedor,
} from "@/lib/comprasProveedor";

const MAX_ARCHIVO_BYTES = 2_500_000;
const NARANJA = "#F5A623";

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

function fechaLegible(iso?: string) {
  if (!iso) return undefined;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function ComprasProveedorForm({ userId, proveedor }: { userId: string | null; proveedor: Proveedor }) {
  const itemKey = `compras_proveedor_${proveedor.id}`;
  const { docs, loading, save } = useGestionDocumentos("compras", userId);

  const [compras, setCompras] = useState<CompraProveedor[]>([]);
  const [formCompra, setFormCompra] = useState<CompraProveedor>(compraVacia());
  const [viendoCompra, setViendoCompra] = useState<CompraProveedor | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const ordenRef = useRef<HTMLInputElement>(null);
  const facturaRef = useRef<HTMLInputElement>(null);
  const evidenciaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) setCompras(parseComprasProveedor(docs[itemKey] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm py-6 text-center">Cargando...</p>;
  }

  const editando = compras.some((c) => c.id === formCompra.id);
  const comprasOrdenadas = [...compras].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  const v = formCompra.verificacion;

  function campo<K extends keyof CompraProveedor>(key: K, value: CompraProveedor[K]) {
    setFormCompra((f) => ({ ...f, [key]: value }));
  }

  function campoVerificacion<K extends keyof CompraProveedor["verificacion"]>(key: K, value: CompraProveedor["verificacion"][K]) {
    setFormCompra((f) => ({ ...f, verificacion: { ...f.verificacion, [key]: value } }));
  }

  function handleArchivo(file: File | undefined, onOk: (dataUrl: string, nombre: string) => void) {
    if (!file) return;
    if (file.size > MAX_ARCHIVO_BYTES) {
      setError("El archivo es muy pesado (máx. 2.5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onOk(reader.result as string, file.name);
    reader.readAsDataURL(file);
  }

  function handleArchivoOrden(file: File | undefined) {
    handleArchivo(file, (dataUrl, nombre) => setFormCompra((f) => ({ ...f, archivoOrdenCompra: dataUrl, archivoOrdenCompraNombre: nombre })));
  }

  function handleArchivoFactura(file: File | undefined) {
    handleArchivo(file, (dataUrl, nombre) => setFormCompra((f) => ({ ...f, archivoFactura: dataUrl, archivoFacturaNombre: nombre })));
  }

  function handleArchivoEvidencia(file: File | undefined) {
    handleArchivo(file, (dataUrl, nombre) =>
      setFormCompra((f) => ({ ...f, verificacion: { ...f.verificacion, archivoEvidencia: dataUrl, archivoEvidenciaNombre: nombre } }))
    );
  }

  async function persistir(actualizadas: CompraProveedor[]) {
    setSaving(true);
    await save(itemKey, JSON.stringify(actualizadas));
    setCompras(actualizadas);
    setSaving(false);
  }

  function limpiarFormulario() {
    setError(null);
    setFormCompra(compraVacia());
  }

  function abrirEditar(c: CompraProveedor) {
    setError(null);
    setViendoCompra(null);
    setFormCompra({ ...c, verificacion: { ...c.verificacion } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function abrirInforme(c: CompraProveedor) {
    setViendoCompra(c);
  }

  async function guardarCompra() {
    if (!formCompra.descripcion.trim()) {
      setError("Describí qué se compró.");
      return;
    }
    if (!formCompra.fecha) {
      setError("La fecha de la compra es obligatoria.");
      return;
    }
    setError(null);
    const actualizadas = editando ? compras.map((c) => (c.id === formCompra.id ? formCompra : c)) : [...compras, formCompra];
    await persistir(actualizadas);
    setFormCompra(compraVacia());
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminarCompra(id: string) {
    if (!confirm("¿Eliminar este registro de compra?")) return;
    await persistir(compras.filter((c) => c.id !== id));
    if (formCompra.id === id) limpiarFormulario();
    if (viendoCompra?.id === id) setViendoCompra(null);
  }

  return (
    <div className="space-y-4">
      {/* Formulario permanente */}
      <Seccion icono="🛒" titulo="Historial de Compras">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-500">
              {editando ? `Editando compra de ${fechaLegible(formCompra.fecha)}.` : `Nueva compra a ${proveedor.razonSocial}.`}
            </p>
            {editando && (
              <button onClick={limpiarFormulario} className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410] whitespace-nowrap">
                + Nueva compra en blanco
              </button>
            )}
          </div>

          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Compra guardada</div>}

          <div>
            <SubHeader icono="📦" titulo="Datos de la compra" />
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div>
                <label className={labelClass}>Tipo</label>
                <select value={formCompra.tipo} onChange={(e) => campo("tipo", e.target.value as CompraProveedor["tipo"])} className={inputClass}>
                  {TIPOS_COMPRA_PROVEEDOR.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <select value={formCompra.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                  {ESTADOS_COMPRA_PROVEEDOR.map((e2) => (
                    <option key={e2} value={e2}>{e2}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  <span className="text-red-500">*</span> Descripción de lo comprado
                </label>
                <textarea value={formCompra.descripcion} onChange={(e) => campo("descripcion", e.target.value)} rows={2} className={`${inputClass} resize-y`} placeholder="¿Qué producto o servicio se compró?" />
              </div>
              <div>
                <label className={labelClass}>Cantidad</label>
                <input type="number" min={0} value={formCompra.cantidad} onChange={(e) => campo("cantidad", Math.max(0, Number(e.target.value) || 0))} onWheel={(e) => e.currentTarget.blur()} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Unidad</label>
                <input value={formCompra.unidad} onChange={(e) => campo("unidad", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Monto total</label>
                <input type="number" min={0} value={formCompra.montoTotal} onChange={(e) => campo("montoTotal", Math.max(0, Number(e.target.value) || 0))} onWheel={(e) => e.currentTarget.blur()} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Moneda</label>
                <select value={formCompra.moneda} onChange={(e) => campo("moneda", e.target.value)} className={inputClass}>
                  {MONEDAS_COMPRA_PROVEEDOR.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  <span className="text-red-500">*</span> Fecha de la compra
                </label>
                <input type="date" value={formCompra.fecha} onChange={(e) => campo("fecha", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <SubHeader icono="🧾" titulo="Orden de Compra y Factura" />
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div className="bg-[#FAFAFA] rounded-lg p-3 space-y-2 border border-gray-100">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Orden de Compra</p>
                <input value={formCompra.numeroOrdenCompra} onChange={(e) => campo("numeroOrdenCompra", e.target.value)} placeholder="N° de orden" className={inputClass} />
                <input ref={ordenRef} type="file" className="hidden" onChange={(e) => handleArchivoOrden(e.target.files?.[0])} />
                <div className="flex items-center gap-2">
                  <button onClick={() => ordenRef.current?.click()} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-[#F5A623] bg-white">
                    📎 {formCompra.archivoOrdenCompraNombre ? "Cambiar" : "Adjuntar"}
                  </button>
                  {formCompra.archivoOrdenCompraNombre && (
                    <a href={formCompra.archivoOrdenCompra ?? "#"} download={formCompra.archivoOrdenCompraNombre} className="text-xs hover:opacity-80 truncate" style={{ color: NARANJA }}>
                      {formCompra.archivoOrdenCompraNombre}
                    </a>
                  )}
                </div>
              </div>
              <div className="bg-[#FAFAFA] rounded-lg p-3 space-y-2 border border-gray-100">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Factura</p>
                <div className="grid grid-cols-2 gap-2">
                  <input value={formCompra.numeroFactura} onChange={(e) => campo("numeroFactura", e.target.value)} placeholder="N° de factura" className={inputClass} />
                  <input type="date" value={formCompra.fechaFactura} onChange={(e) => campo("fechaFactura", e.target.value)} className={inputClass} />
                </div>
                <input ref={facturaRef} type="file" className="hidden" onChange={(e) => handleArchivoFactura(e.target.files?.[0])} />
                <div className="flex items-center gap-2">
                  <button onClick={() => facturaRef.current?.click()} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-[#F5A623] bg-white">
                    📎 {formCompra.archivoFacturaNombre ? "Cambiar" : "Adjuntar"}
                  </button>
                  {formCompra.archivoFacturaNombre && (
                    <a href={formCompra.archivoFactura ?? "#"} download={formCompra.archivoFacturaNombre} className="text-xs hover:opacity-80 truncate" style={{ color: NARANJA }}>
                      {formCompra.archivoFacturaNombre}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <SubHeader icono="📝" titulo="Observaciones de la compra" />
            <textarea value={formCompra.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          {/* Verificación */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SubHeader icono="✓" titulo={formCompra.tipo === "Producto" ? "Verificación de lo recibido" : "Verificación del servicio"} />
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ml-3 flex-shrink-0" style={{ backgroundColor: colorResultadoVerificacion(v.resultado) }}>
                {v.resultado}
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5 mb-2.5">
              <div>
                <label className={labelClass}>Fecha de verificación</label>
                <input type="date" value={v.fecha} onChange={(e) => campoVerificacion("fecha", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Responsable</label>
                <input value={v.responsable} onChange={(e) => campoVerificacion("responsable", e.target.value)} placeholder="Quién verificó" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Resultado</label>
                <select value={v.resultado} onChange={(e) => campoVerificacion("resultado", e.target.value)} className={inputClass}>
                  {RESULTADOS_VERIFICACION.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {formCompra.tipo === "Producto" ? (
              <div className="grid sm:grid-cols-2 gap-2.5 bg-[#FAFAFA] rounded-lg p-3 border border-gray-100 mb-2.5">
                <div>
                  <label className={labelClass}>Cantidad recibida</label>
                  <input type="number" min={0} value={v.cantidadRecibida} onChange={(e) => campoVerificacion("cantidadRecibida", Math.max(0, Number(e.target.value) || 0))} onWheel={(e) => e.currentTarget.blur()} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Estado del embalaje</label>
                  <select value={v.estadoEmbalaje} onChange={(e) => campoVerificacion("estadoEmbalaje", e.target.value)} className={inputClass}>
                    {ESTADOS_EMBALAJE.map((es) => (
                      <option key={es} value={es}>{es}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input type="checkbox" checked={v.coincideConOrden} onChange={(e) => campoVerificacion("coincideConOrden", e.target.checked)} className="accent-[#F5A623]" />
                  Coincide con lo pedido en la orden
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input type="checkbox" checked={v.fichaTecnicaRecibida} onChange={(e) => campoVerificacion("fichaTecnicaRecibida", e.target.checked)} className="accent-[#F5A623]" />
                  Ficha técnica / manual recibido
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-600 sm:col-span-2">
                  <input type="checkbox" checked={v.certificadoCalidadRecibido} onChange={(e) => campoVerificacion("certificadoCalidadRecibido", e.target.checked)} className="accent-[#F5A623]" />
                  Certificado de calidad / garantía recibido
                </label>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2.5 bg-[#FAFAFA] rounded-lg p-3 border border-gray-100 mb-2.5">
                <div>
                  <label className={labelClass}>Fecha de inicio del servicio</label>
                  <input type="date" value={v.fechaInicioServicio} onChange={(e) => campoVerificacion("fechaInicioServicio", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha de fin del servicio</label>
                  <input type="date" value={v.fechaFinServicio} onChange={(e) => campoVerificacion("fechaFinServicio", e.target.value)} className={inputClass} />
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input type="checkbox" checked={v.cumpleAlcanceAcordado} onChange={(e) => campoVerificacion("cumpleAlcanceAcordado", e.target.checked)} className="accent-[#F5A623]" />
                  Cumple el alcance acordado
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input type="checkbox" checked={v.cumpleTiemposAcordados} onChange={(e) => campoVerificacion("cumpleTiemposAcordados", e.target.checked)} className="accent-[#F5A623]" />
                  Cumple los tiempos acordados
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input type="checkbox" checked={v.informeOEvidenciaRecibida} onChange={(e) => campoVerificacion("informeOEvidenciaRecibida", e.target.checked)} className="accent-[#F5A623]" />
                  Informe / evidencia del servicio recibida
                </label>
                <div>
                  <label className={labelClass}>Satisfacción (0-5)</label>
                  <input type="number" min={0} max={5} value={v.satisfaccion} onChange={(e) => campoVerificacion("satisfaccion", Math.min(5, Math.max(0, Number(e.target.value) || 0)))} onWheel={(e) => e.currentTarget.blur()} className={inputClass} />
                </div>
              </div>
            )}

            <div className="mb-2.5">
              <label className={labelClass}>Observaciones de la verificación</label>
              <textarea value={v.observaciones} onChange={(e) => campoVerificacion("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} placeholder="Hallazgos, no conformidades, detalles..." />
            </div>

            <input ref={evidenciaRef} type="file" className="hidden" onChange={(e) => handleArchivoEvidencia(e.target.files?.[0])} />
            <div className="flex items-center gap-2">
              <button onClick={() => evidenciaRef.current?.click()} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-[#F5A623] bg-white">
                📎 {v.archivoEvidenciaNombre ? "Cambiar evidencia" : "Adjuntar evidencia"}
              </button>
              {v.archivoEvidenciaNombre && (
                <a href={v.archivoEvidencia ?? "#"} download={v.archivoEvidenciaNombre} className="text-xs hover:opacity-80 truncate" style={{ color: NARANJA }}>
                  {v.archivoEvidenciaNombre}
                </a>
              )}
            </div>
            {!verificacionCompleta(v) && (
              <p className="text-[11px] text-gray-400 italic mt-2">Completá fecha, responsable y resultado para cerrar la verificación.</p>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-3">
              <button onClick={guardarCompra} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
                {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar compra"}
              </button>
              <button onClick={limpiarFormulario} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                Limpiar
              </button>
            </div>
            {editando && (
              <button onClick={() => eliminarCompra(formCompra.id)} className="text-xs text-red-400 hover:text-red-600">
                Eliminar esta compra
              </button>
            )}
          </div>
        </div>
      </Seccion>

      {/* Historial */}
      <Seccion icono="🗂️" titulo="Historial de Compras">
        {comprasOrdenadas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no hay compras registradas a este proveedor.</p>
        ) : (
          <div className="space-y-2.5">
            {comprasOrdenadas.map((c) => (
              <button
                key={c.id}
                onClick={() => abrirInforme(c)}
                className="w-full text-left bg-[#FAFAFA] rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white bg-[#1A1A1A]/80">
                        {c.tipo === "Producto" ? "📦" : "🛠️"} {c.tipo}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoCompra(c.estado) }}>
                        {c.estado}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{c.descripcion || "Sin descripción"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fechaLegible(c.fecha)} · {c.cantidad} {c.unidad} · {formatoMontoCompra(c.montoTotal)} {c.moneda.split(" ")[0]}
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                    style={{ backgroundColor: colorResultadoVerificacion(c.verificacion.resultado) }}
                  >
                    {c.verificacion.resultado}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Seccion>

      {/* Informe de lectura */}
      {viendoCompra && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-[#1A1A1A] p-6 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="relative flex items-start justify-between gap-3 flex-wrap">
              <div>
                <span className="inline-block bg-[#F5A623] text-[#1A1A1A] text-[10px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
                  {viendoCompra.tipo === "Producto" ? "📦 Producto" : "🛠️ Servicio"}
                </span>
                <h2 className="text-white text-xl font-extrabold">{viendoCompra.descripcion || "Sin descripción"}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {fechaLegible(viendoCompra.fecha)} · {viendoCompra.cantidad} {viendoCompra.unidad}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-extrabold px-4 py-2 rounded-xl text-white" style={{ backgroundColor: colorEstadoCompra(viendoCompra.estado) }}>
                  {formatoMontoCompra(viendoCompra.montoTotal)}
                </div>
                <p className="text-gray-400 text-[11px] mt-1 uppercase tracking-wide font-bold">{viendoCompra.moneda} · {viendoCompra.estado}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Orden de Compra y Factura</h3>
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div className="bg-[#FAFAFA] rounded-lg p-3">
                  <p className="text-xs text-gray-500">N° de orden: <span className="text-[#1A1A1A] font-semibold">{viendoCompra.numeroOrdenCompra || "—"}</span></p>
                  {viendoCompra.archivoOrdenCompraNombre ? (
                    <a href={viendoCompra.archivoOrdenCompra ?? "#"} download={viendoCompra.archivoOrdenCompraNombre} className="text-xs hover:opacity-80 block mt-1" style={{ color: NARANJA }}>
                      📎 {viendoCompra.archivoOrdenCompraNombre}
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Sin archivo adjunto</p>
                  )}
                </div>
                <div className="bg-[#FAFAFA] rounded-lg p-3">
                  <p className="text-xs text-gray-500">
                    N° de factura: <span className="text-[#1A1A1A] font-semibold">{viendoCompra.numeroFactura || "—"}</span>
                    {viendoCompra.fechaFactura && <> · {fechaLegible(viendoCompra.fechaFactura)}</>}
                  </p>
                  {viendoCompra.archivoFacturaNombre ? (
                    <a href={viendoCompra.archivoFactura ?? "#"} download={viendoCompra.archivoFacturaNombre} className="text-xs hover:opacity-80 block mt-1" style={{ color: NARANJA }}>
                      📎 {viendoCompra.archivoFacturaNombre}
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Sin archivo adjunto</p>
                  )}
                </div>
              </div>
            </div>

            {viendoCompra.observaciones && (
              <div>
                <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Observaciones de la compra</p>
                <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendoCompra.observaciones}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Verificación {viendoCompra.tipo === "Producto" ? "de lo recibido" : "del servicio"}
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorResultadoVerificacion(viendoCompra.verificacion.resultado) }}>
                  {viendoCompra.verificacion.resultado}
                </span>
              </div>
              <div className="bg-[#FAFAFA] rounded-lg p-3 space-y-2 text-xs text-gray-600">
                <p>
                  {viendoCompra.verificacion.fecha ? fechaLegible(viendoCompra.verificacion.fecha) : "Sin fecha"}
                  {viendoCompra.verificacion.responsable && <> · Verificado por {viendoCompra.verificacion.responsable}</>}
                </p>
                {viendoCompra.tipo === "Producto" ? (
                  <ul className="space-y-1">
                    <li>Cantidad recibida: <strong className="text-[#1A1A1A]">{viendoCompra.verificacion.cantidadRecibida}</strong></li>
                    <li>Estado del embalaje: <strong className="text-[#1A1A1A]">{viendoCompra.verificacion.estadoEmbalaje}</strong></li>
                    <li>{viendoCompra.verificacion.coincideConOrden ? "✓" : "✕"} Coincide con lo pedido en la orden</li>
                    <li>{viendoCompra.verificacion.fichaTecnicaRecibida ? "✓" : "✕"} Ficha técnica / manual recibido</li>
                    <li>{viendoCompra.verificacion.certificadoCalidadRecibido ? "✓" : "✕"} Certificado de calidad / garantía recibido</li>
                  </ul>
                ) : (
                  <ul className="space-y-1">
                    <li>Período: <strong className="text-[#1A1A1A]">{fechaLegible(viendoCompra.verificacion.fechaInicioServicio) || "—"} a {fechaLegible(viendoCompra.verificacion.fechaFinServicio) || "—"}</strong></li>
                    <li>{viendoCompra.verificacion.cumpleAlcanceAcordado ? "✓" : "✕"} Cumple el alcance acordado</li>
                    <li>{viendoCompra.verificacion.cumpleTiemposAcordados ? "✓" : "✕"} Cumple los tiempos acordados</li>
                    <li>{viendoCompra.verificacion.informeOEvidenciaRecibida ? "✓" : "✕"} Informe / evidencia del servicio recibida</li>
                    <li>Satisfacción: <strong className="text-[#1A1A1A]">{viendoCompra.verificacion.satisfaccion}/5</strong></li>
                  </ul>
                )}
                {viendoCompra.verificacion.observaciones && (
                  <p className="pt-2 border-t border-gray-200 whitespace-pre-wrap">{viendoCompra.verificacion.observaciones}</p>
                )}
                {viendoCompra.verificacion.archivoEvidenciaNombre && (
                  <a href={viendoCompra.verificacion.archivoEvidencia ?? "#"} download={viendoCompra.verificacion.archivoEvidenciaNombre} className="inline-block hover:opacity-80" style={{ color: NARANJA }}>
                    📎 {viendoCompra.verificacion.archivoEvidenciaNombre}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <button onClick={() => abrirEditar(viendoCompra)} className="text-sm font-semibold text-[#F5A623] hover:text-[#e09410]">
              ✎ Editar compra
            </button>
            <button onClick={() => setViendoCompra(null)} className="text-sm text-gray-400 hover:text-gray-600">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
