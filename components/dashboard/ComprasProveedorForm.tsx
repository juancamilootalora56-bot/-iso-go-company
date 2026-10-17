"use client";

import { useMemo, useRef, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { Proveedor } from "@/lib/proveedores";
import {
  parseComprasProveedor,
  compraVacia,
  verificacionVacia,
  verificacionCompleta,
  formatoMontoCompra,
  totalCompras,
  resumenVerificacion,
  mesDeCompra,
  mesActualCompra,
  nombreMesCompra,
  mesAnteriorCompra,
  mesSiguienteCompra,
  mesesConCompras,
  colorEstadoCompra,
  colorResultadoVerificacion,
  TIPOS_COMPRA_PROVEEDOR,
  ESTADOS_COMPRA_PROVEEDOR,
  MONEDAS_COMPRA_PROVEEDOR,
  RESULTADOS_VERIFICACION,
  ESTADOS_EMBALAJE,
  type CompraProveedor,
  type VerificacionCompra,
} from "@/lib/comprasProveedor";

const MAX_ARCHIVO_BYTES = 2_500_000;
const NARANJA = "#F5A623";

const celdaInput =
  "w-full text-[12px] bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F5A623]";
const labelMini = "block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1";

function fechaLegible(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function ComprasProveedorForm({ userId, proveedor }: { userId: string | null; proveedor: Proveedor }) {
  const itemKey = `compras_proveedor_${proveedor.id}`;
  const { docs, loading, save } = useGestionDocumentos("compras", userId);

  const guardadas = useMemo(() => parseComprasProveedor(docs[itemKey] ?? ""), [docs, itemKey]);
  const [draft, setDraft] = useState<CompraProveedor[] | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [mes, setMes] = useState(mesActualCompra());
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  if (loading) {
    return <p className="text-gray-400 text-sm py-6 text-center">Cargando...</p>;
  }

  const compras = draft ?? guardadas;
  const meses = mesesConCompras(compras);

  async function persistir(nuevas: CompraProveedor[]) {
    setGuardando(true);
    await save(itemKey, JSON.stringify(nuevas));
    setDraft(null);
    setGuardando(false);
    setMensaje("Guardado ✓");
    setTimeout(() => setMensaje(""), 2500);
  }

  function actualizar(id: string, cambios: Partial<CompraProveedor>) {
    setDraft(compras.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  }

  function actualizarVerificacion(id: string, cambios: Partial<VerificacionCompra>) {
    setDraft(compras.map((c) => (c.id === id ? { ...c, verificacion: { ...c.verificacion, ...cambios } } : c)));
  }

  function nueva() {
    const nuevaCompra = compraVacia();
    setDraft([...compras, nuevaCompra]);
    setExpandidoId(nuevaCompra.id);
    setMes(mesActualCompra());
  }

  function eliminar(id: string) {
    if (!confirm("¿Eliminar este registro de compra?")) return;
    const actualizadas = compras.filter((c) => c.id !== id);
    setDraft(actualizadas);
    persistir(actualizadas);
  }

  const comprasDelMes = compras.filter((c) => mesDeCompra(c.fecha) === mes);
  const indiceMes = meses.indexOf(mes);
  const hayMesAnterior = indiceMes > 0;
  const hayMesSiguiente = indiceMes >= 0 && indiceMes < meses.length - 1;
  const resumenVerif = resumenVerificacion(comprasDelMes);
  const montoDelMes = totalCompras(comprasDelMes);

  const comprasOrdenadas = [...comprasDelMes].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  return (
    <div className="space-y-4">
      <Seccion icono="🛒" titulo="Historial de Compras">
        <p className="text-xs text-gray-500 mb-4">
          Todo lo comprado a {proveedor.razonSocial}, mes a mes: Orden de Compra, factura y la verificación de lo
          recibido.
        </p>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 bg-[#FAFAFA] rounded-xl border border-gray-100 px-3 py-2 w-fit">
            <button
              onClick={() => setMes(mesAnteriorCompra(mes))}
              disabled={!hayMesAnterior}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Mes anterior"
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-[#1A1A1A] capitalize min-w-[140px] text-center">{nombreMesCompra(mes)}</span>
            <button
              onClick={() => setMes(mesSiguienteCompra(mes))}
              disabled={!hayMesSiguiente}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Mes siguiente"
            >
              ›
            </button>
            {mes !== mesActualCompra() && (
              <button onClick={() => setMes(mesActualCompra())} className="text-[11px] font-semibold ml-1 hover:opacity-80" style={{ color: NARANJA }}>
                Hoy
              </button>
            )}
          </div>
          <button onClick={nueva} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-4 py-2 rounded-lg hover:bg-[#e09410] transition-colors text-xs flex-shrink-0">
            + Nueva compra
          </button>
        </div>

        {comprasDelMes.length > 0 && (
          <div className="flex items-center gap-2.5 flex-wrap mb-4">
            <div className="bg-[#1A1A1A] rounded-xl px-3.5 py-2">
              <span className="text-sm font-extrabold text-white">{comprasDelMes.length}</span>
              <span className="text-[11px] text-gray-400 ml-1.5">compra{comprasDelMes.length !== 1 ? "s" : ""} este mes</span>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl px-3.5 py-2">
              <span className="text-sm font-extrabold text-white">{formatoMontoCompra(montoDelMes)}</span>
              <span className="text-[11px] text-gray-400 ml-1.5">monto total</span>
            </div>
            {resumenVerif.map((r) => (
              <div key={r.resultado} className="bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-xs font-bold text-[#1A1A1A]">{r.cantidad}</span>
                <span className="text-[11px] text-gray-500">{r.resultado}</span>
              </div>
            ))}
          </div>
        )}

        {comprasOrdenadas.length === 0 ? (
          <div className="bg-[#FAFAFA] rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm mb-2">
              {compras.length === 0 ? "Todavía no hay compras registradas a este proveedor." : `No hay compras en ${nombreMesCompra(mes)}.`}
            </p>
            <button onClick={nueva} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
              Registrar la primera →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {comprasOrdenadas.map((c) => (
              <TarjetaCompra
                key={c.id}
                compra={c}
                expandido={expandidoId === c.id}
                onToggle={() => setExpandidoId(expandidoId === c.id ? null : c.id)}
                onActualizar={(cambios) => actualizar(c.id, cambios)}
                onActualizarVerificacion={(cambios) => actualizarVerificacion(c.id, cambios)}
                onEliminar={() => eliminar(c.id)}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
          {mensaje && <span className="text-xs text-green-600 font-semibold">{mensaje}</span>}
          <button
            onClick={() => persistir(compras)}
            disabled={guardando || draft === null}
            className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-40"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </Seccion>
    </div>
  );
}

function TarjetaCompra({
  compra,
  expandido,
  onToggle,
  onActualizar,
  onActualizarVerificacion,
  onEliminar,
}: {
  compra: CompraProveedor;
  expandido: boolean;
  onToggle: () => void;
  onActualizar: (c: Partial<CompraProveedor>) => void;
  onActualizarVerificacion: (c: Partial<VerificacionCompra>) => void;
  onEliminar: () => void;
}) {
  const ordenRef = useRef<HTMLInputElement>(null);
  const facturaRef = useRef<HTMLInputElement>(null);
  const evidenciaRef = useRef<HTMLInputElement>(null);
  const v = compra.verificacion;

  function handleArchivo(file: File | undefined, onOk: (dataUrl: string, nombre: string) => void) {
    if (!file) return;
    if (file.size > MAX_ARCHIVO_BYTES) {
      alert("El archivo es muy pesado (máx. 2.5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onOk(reader.result as string, file.name);
    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ borderTop: `3px solid ${colorEstadoCompra(compra.estado)}` }}>
      <div className="p-3 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white bg-[#1A1A1A]/80 flex-shrink-0">
                {compra.tipo === "Producto" ? "📦" : "🛠️"} {compra.tipo}
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: colorEstadoCompra(compra.estado) }}>
                {compra.estado}
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: colorResultadoVerificacion(v.resultado) }}>
                {v.resultado === "Pendiente" ? "Verificación pendiente" : v.resultado}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#1A1A1A] mt-1.5 truncate">{compra.descripcion || "Sin descripción"}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {fechaLegible(compra.fecha)} · {compra.cantidad} {compra.unidad} · {formatoMontoCompra(compra.montoTotal)} {compra.moneda.split(" ")[0]}
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0">{expandido ? "▲" : "▼"}</span>
        </div>
      </div>

      {expandido && (
        <div className="p-3 pt-0 border-t border-gray-50 space-y-4" onClick={(e) => e.stopPropagation()}>
          {/* Datos de la compra */}
          <div className="space-y-2 pt-3">
            <div className="grid sm:grid-cols-2 gap-2">
              <div>
                <label className={labelMini}>Tipo</label>
                <select value={compra.tipo} onChange={(e) => onActualizar({ tipo: e.target.value as CompraProveedor["tipo"] })} className={celdaInput}>
                  {TIPOS_COMPRA_PROVEEDOR.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelMini}>Estado</label>
                <select value={compra.estado} onChange={(e) => onActualizar({ estado: e.target.value })} className={celdaInput}>
                  {ESTADOS_COMPRA_PROVEEDOR.map((e2) => (
                    <option key={e2} value={e2}>{e2}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelMini}>Descripción de lo comprado</label>
              <textarea value={compra.descripcion} onChange={(e) => onActualizar({ descripcion: e.target.value })} rows={2} className={celdaInput + " resize-y"} placeholder="¿Qué producto o servicio se compró?" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className={labelMini}>Cantidad</label>
                <input type="number" min={0} value={compra.cantidad} onChange={(e) => onActualizar({ cantidad: Math.max(0, Number(e.target.value) || 0) })} onWheel={(e) => e.currentTarget.blur()} className={celdaInput} />
              </div>
              <div>
                <label className={labelMini}>Unidad</label>
                <input value={compra.unidad} onChange={(e) => onActualizar({ unidad: e.target.value })} className={celdaInput} />
              </div>
              <div>
                <label className={labelMini}>Monto total</label>
                <input type="number" min={0} value={compra.montoTotal} onChange={(e) => onActualizar({ montoTotal: Math.max(0, Number(e.target.value) || 0) })} onWheel={(e) => e.currentTarget.blur()} className={celdaInput} />
              </div>
              <div>
                <label className={labelMini}>Moneda</label>
                <select value={compra.moneda} onChange={(e) => onActualizar({ moneda: e.target.value })} className={celdaInput}>
                  {MONEDAS_COMPRA_PROVEEDOR.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelMini}>Fecha de la compra</label>
              <input type="date" value={compra.fecha} onChange={(e) => onActualizar({ fecha: e.target.value })} className={celdaInput} />
            </div>
          </div>

          {/* Orden de compra y factura */}
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div className="bg-[#FAFAFA] rounded-lg p-2.5 space-y-1.5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Orden de Compra</p>
              <input value={compra.numeroOrdenCompra} onChange={(e) => onActualizar({ numeroOrdenCompra: e.target.value })} placeholder="N° de orden" className={celdaInput} />
              <input ref={ordenRef} type="file" className="hidden" onChange={(e) => handleArchivo(e.target.files?.[0], (dataUrl, nombre) => onActualizar({ archivoOrdenCompra: dataUrl, archivoOrdenCompraNombre: nombre }))} />
              <div className="flex items-center gap-2">
                <button onClick={() => ordenRef.current?.click()} className="text-[10px] font-semibold px-2 py-1 rounded border border-gray-200 hover:border-[#F5A623] bg-white">
                  📎 {compra.archivoOrdenCompraNombre ? "Cambiar" : "Adjuntar"}
                </button>
                {compra.archivoOrdenCompraNombre && (
                  <a href={compra.archivoOrdenCompra ?? "#"} download={compra.archivoOrdenCompraNombre} className="text-[10px] hover:opacity-80 truncate" style={{ color: NARANJA }}>
                    {compra.archivoOrdenCompraNombre}
                  </a>
                )}
              </div>
            </div>
            <div className="bg-[#FAFAFA] rounded-lg p-2.5 space-y-1.5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Factura</p>
              <div className="grid grid-cols-2 gap-1.5">
                <input value={compra.numeroFactura} onChange={(e) => onActualizar({ numeroFactura: e.target.value })} placeholder="N° de factura" className={celdaInput} />
                <input type="date" value={compra.fechaFactura} onChange={(e) => onActualizar({ fechaFactura: e.target.value })} className={celdaInput} />
              </div>
              <input ref={facturaRef} type="file" className="hidden" onChange={(e) => handleArchivo(e.target.files?.[0], (dataUrl, nombre) => onActualizar({ archivoFactura: dataUrl, archivoFacturaNombre: nombre }))} />
              <div className="flex items-center gap-2">
                <button onClick={() => facturaRef.current?.click()} className="text-[10px] font-semibold px-2 py-1 rounded border border-gray-200 hover:border-[#F5A623] bg-white">
                  📎 {compra.archivoFacturaNombre ? "Cambiar" : "Adjuntar"}
                </button>
                {compra.archivoFacturaNombre && (
                  <a href={compra.archivoFactura ?? "#"} download={compra.archivoFacturaNombre} className="text-[10px] hover:opacity-80 truncate" style={{ color: NARANJA }}>
                    {compra.archivoFacturaNombre}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className={labelMini}>Observaciones de la compra</label>
            <textarea value={compra.observaciones} onChange={(e) => onActualizar({ observaciones: e.target.value })} rows={2} className={celdaInput + " resize-y"} />
          </div>

          {/* Verificación */}
          <div className="rounded-xl border p-3 space-y-2.5" style={{ borderColor: `${colorResultadoVerificacion(v.resultado)}40`, backgroundColor: `${colorResultadoVerificacion(v.resultado)}08` }}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wide">
                ✓ {compra.tipo === "Producto" ? "Verificación de lo recibido" : "Verificación del servicio"}
              </p>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: colorResultadoVerificacion(v.resultado) }}>
                {v.resultado}
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-2">
              <div>
                <label className={labelMini}>Fecha de verificación</label>
                <input type="date" value={v.fecha} onChange={(e) => onActualizarVerificacion({ fecha: e.target.value })} className={celdaInput} />
              </div>
              <div>
                <label className={labelMini}>Responsable</label>
                <input value={v.responsable} onChange={(e) => onActualizarVerificacion({ responsable: e.target.value })} placeholder="Quién verificó" className={celdaInput} />
              </div>
              <div>
                <label className={labelMini}>Resultado</label>
                <select value={v.resultado} onChange={(e) => onActualizarVerificacion({ resultado: e.target.value })} className={celdaInput}>
                  {RESULTADOS_VERIFICACION.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {compra.tipo === "Producto" ? (
              <div className="grid sm:grid-cols-2 gap-2 bg-white/60 rounded-lg p-2.5">
                <div>
                  <label className={labelMini}>Cantidad recibida</label>
                  <input type="number" min={0} value={v.cantidadRecibida} onChange={(e) => onActualizarVerificacion({ cantidadRecibida: Math.max(0, Number(e.target.value) || 0) })} onWheel={(e) => e.currentTarget.blur()} className={celdaInput} />
                </div>
                <div>
                  <label className={labelMini}>Estado del embalaje</label>
                  <select value={v.estadoEmbalaje} onChange={(e) => onActualizarVerificacion({ estadoEmbalaje: e.target.value })} className={celdaInput}>
                    {ESTADOS_EMBALAJE.map((es) => (
                      <option key={es} value={es}>{es}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <input type="checkbox" checked={v.coincideConOrden} onChange={(e) => onActualizarVerificacion({ coincideConOrden: e.target.checked })} />
                  Coincide con lo pedido en la orden
                </label>
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <input type="checkbox" checked={v.fichaTecnicaRecibida} onChange={(e) => onActualizarVerificacion({ fichaTecnicaRecibida: e.target.checked })} />
                  Ficha técnica / manual recibido
                </label>
                <label className="flex items-center gap-2 text-[11px] text-gray-600 sm:col-span-2">
                  <input type="checkbox" checked={v.certificadoCalidadRecibido} onChange={(e) => onActualizarVerificacion({ certificadoCalidadRecibido: e.target.checked })} />
                  Certificado de calidad / garantía recibido
                </label>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2 bg-white/60 rounded-lg p-2.5">
                <div>
                  <label className={labelMini}>Fecha de inicio del servicio</label>
                  <input type="date" value={v.fechaInicioServicio} onChange={(e) => onActualizarVerificacion({ fechaInicioServicio: e.target.value })} className={celdaInput} />
                </div>
                <div>
                  <label className={labelMini}>Fecha de fin del servicio</label>
                  <input type="date" value={v.fechaFinServicio} onChange={(e) => onActualizarVerificacion({ fechaFinServicio: e.target.value })} className={celdaInput} />
                </div>
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <input type="checkbox" checked={v.cumpleAlcanceAcordado} onChange={(e) => onActualizarVerificacion({ cumpleAlcanceAcordado: e.target.checked })} />
                  Cumple el alcance acordado
                </label>
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <input type="checkbox" checked={v.cumpleTiemposAcordados} onChange={(e) => onActualizarVerificacion({ cumpleTiemposAcordados: e.target.checked })} />
                  Cumple los tiempos acordados
                </label>
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <input type="checkbox" checked={v.informeOEvidenciaRecibida} onChange={(e) => onActualizarVerificacion({ informeOEvidenciaRecibida: e.target.checked })} />
                  Informe / evidencia del servicio recibida
                </label>
                <div>
                  <label className={labelMini}>Satisfacción (0-5)</label>
                  <input type="number" min={0} max={5} value={v.satisfaccion} onChange={(e) => onActualizarVerificacion({ satisfaccion: Math.min(5, Math.max(0, Number(e.target.value) || 0)) })} onWheel={(e) => e.currentTarget.blur()} className={celdaInput} />
                </div>
              </div>
            )}

            <div>
              <label className={labelMini}>Observaciones de la verificación</label>
              <textarea value={v.observaciones} onChange={(e) => onActualizarVerificacion({ observaciones: e.target.value })} rows={2} className={celdaInput + " resize-y bg-white"} placeholder="Hallazgos, no conformidades, detalles..." />
            </div>

            <input ref={evidenciaRef} type="file" className="hidden" onChange={(e) => handleArchivo(e.target.files?.[0], (dataUrl, nombre) => onActualizarVerificacion({ archivoEvidencia: dataUrl, archivoEvidenciaNombre: nombre }))} />
            <div className="flex items-center gap-2">
              <button onClick={() => evidenciaRef.current?.click()} className="text-[10px] font-semibold px-2 py-1 rounded border border-gray-200 hover:border-[#F5A623] bg-white">
                📎 {v.archivoEvidenciaNombre ? "Cambiar evidencia" : "Adjuntar evidencia"}
              </button>
              {v.archivoEvidenciaNombre && (
                <a href={v.archivoEvidencia ?? "#"} download={v.archivoEvidenciaNombre} className="text-[10px] hover:opacity-80 truncate" style={{ color: NARANJA }}>
                  {v.archivoEvidenciaNombre}
                </a>
              )}
            </div>

            {!verificacionCompleta(v) && (
              <p className="text-[10px] text-gray-400 italic">Completá fecha, responsable y resultado para cerrar la verificación.</p>
            )}
          </div>

          <div className="flex items-center justify-end pt-1">
            <button onClick={onEliminar} className="text-[10px] text-gray-300 hover:text-red-500">
              Eliminar registro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
