"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import { parseProveedores } from "@/lib/proveedores";
import {
  parseOrdenesCompra,
  ordenCompraVacia,
  itemOrdenVacio,
  totalOrden,
  formatoMonto,
  colorEstadoOrden,
  ESTADOS_ORDEN_COMPRA,
  MONEDAS_ORDEN,
  type OrdenCompra,
} from "@/lib/ordenesCompra";

const ITEM_KEY = "ordenes_compra_lista";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function fechaLegible(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function OrdenesCompraPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-compras`;

  const { docs, loading, save } = useGestionDocumentos("compras", user?.id ?? null);

  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [orden, setOrden] = useState<OrdenCompra>(ordenCompraVacia());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) setOrdenes(parseOrdenesCompra(docs[ITEM_KEY] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const proveedores = parseProveedores(docs["proveedores_lista"] ?? "");
  const editando = ordenes.some((o) => o.id === orden.id);

  function limpiar() {
    setOrden(ordenCompraVacia());
    setError(null);
  }

  function editar(o: OrdenCompra) {
    setOrden({ ...o, items: o.items.map((i) => ({ ...i })) });
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function campo<K extends keyof OrdenCompra>(key: K, value: OrdenCompra[K]) {
    setOrden((o) => ({ ...o, [key]: value }));
  }

  function campoItem(id: string, key: keyof OrdenCompra["items"][number], value: string | number) {
    setOrden((o) => ({ ...o, items: o.items.map((i) => (i.id === id ? { ...i, [key]: value } : i)) }));
  }

  function agregarItem() {
    setOrden((o) => ({ ...o, items: [...o.items, itemOrdenVacio()] }));
  }

  function quitarItem(id: string) {
    setOrden((o) => ({ ...o, items: o.items.length > 1 ? o.items.filter((i) => i.id !== id) : o.items }));
  }

  async function guardar() {
    if (!orden.proveedorId) {
      setError("Seleccioná el proveedor de esta orden.");
      return;
    }
    if (!orden.items.some((i) => i.descripcion.trim())) {
      setError("Agregá al menos un ítem con descripción.");
      return;
    }
    setError(null);
    setSaving(true);
    const actualizadas = [...ordenes.filter((o) => o.id !== orden.id), orden];
    await save(ITEM_KEY, JSON.stringify(actualizadas));
    setOrdenes(actualizadas);
    setOrden(ordenCompraVacia());
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    setSaving(true);
    const actualizadas = ordenes.filter((o) => o.id !== id);
    await save(ITEM_KEY, JSON.stringify(actualizadas));
    setOrdenes(actualizadas);
    if (orden.id === id) limpiar();
    setSaving(false);
  }

  const ordenesOrdenadas = [...ordenes].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Compras
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Órdenes de Compra</h1>
        <p className="text-gray-500 text-sm mt-1">Registro y seguimiento de las compras realizadas a tus proveedores.</p>
      </div>

      {proveedores.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Necesitás tener al menos un proveedor inscripto para generar una orden de compra.</p>
          <Link href={`${basePath}/inscripcion_proveedores`} className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm">
            Inscribir proveedor
          </Link>
        </div>
      ) : (
        <>
          <Seccion icono="🧾" titulo={editando ? "Editando orden de compra" : "Nueva orden de compra"}>
            <div className="space-y-4">
              {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
              {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Orden guardada</div>}

              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Número de orden</label>
                  <input value={orden.numero} onChange={(e) => campo("numero", e.target.value)} placeholder="Ej: OC-0001" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><span className="text-red-500">*</span> Proveedor</label>
                  <select value={orden.proveedorId} onChange={(e) => campo("proveedorId", e.target.value)} className={inputClass}>
                    <option value="">Seleccioná</option>
                    {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Fecha</label>
                  <input type="date" value={orden.fecha} onChange={(e) => campo("fecha", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha de entrega esperada</label>
                  <input type="date" value={orden.fechaEntregaEsperada} onChange={(e) => campo("fechaEntregaEsperada", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Moneda</label>
                  <select value={orden.moneda} onChange={(e) => campo("moneda", e.target.value)} className={inputClass}>
                    {MONEDAS_ORDEN.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Estado</label>
                  <select value={orden.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                    {ESTADOS_ORDEN_COMPRA.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Forma de pago</label>
                  <input value={orden.formaPago} onChange={(e) => campo("formaPago", e.target.value)} placeholder="Ej: Crédito 30 días" className={inputClass} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">Ítems de la orden</p>
                  <button onClick={agregarItem} type="button" className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410]">+ Agregar ítem</button>
                </div>
                <div className="space-y-2">
                  {orden.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end bg-[#FAFAFA] rounded-lg p-2.5 border border-gray-100">
                      <div className="col-span-5">
                        <label className="block text-[10px] text-gray-400 mb-0.5">Descripción</label>
                        <input value={item.descripcion} onChange={(e) => campoItem(item.id, "descripcion", e.target.value)} className={inputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-gray-400 mb-0.5">Cantidad</label>
                        <input type="number" min={0} value={item.cantidad} onChange={(e) => campoItem(item.id, "cantidad", Number(e.target.value))} className={inputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-gray-400 mb-0.5">Unidad</label>
                        <input value={item.unidad} onChange={(e) => campoItem(item.id, "unidad", e.target.value)} className={inputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-gray-400 mb-0.5">Precio unit.</label>
                        <input type="number" min={0} value={item.precioUnitario} onChange={(e) => campoItem(item.id, "precioUnitario", Number(e.target.value))} className={inputClass} />
                      </div>
                      <div className="col-span-1 flex justify-end pb-1.5">
                        <button onClick={() => quitarItem(item.id)} type="button" className="text-gray-300 hover:text-red-500 text-sm">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-xl p-4 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Total de la orden</p>
                <p className="text-lg font-extrabold text-white">{formatoMonto(totalOrden(orden))} <span className="text-xs text-gray-400 font-normal">{orden.moneda}</span></p>
              </div>

              <div>
                <label className={labelClass}>Observaciones</label>
                <textarea value={orden.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button onClick={guardar} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
                  {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar orden"}
                </button>
                <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                  {editando ? "Nueva orden en blanco" : "Limpiar"}
                </button>
              </div>
            </div>
          </Seccion>

          <Seccion icono="📋" titulo="Órdenes registradas">
            {ordenesOrdenadas.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Todavía no cargaste ninguna orden de compra.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[700px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="p-2.5 font-semibold border-b border-gray-100">N°</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Proveedor</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Fecha</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Entrega esperada</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Total</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Estado</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesOrdenadas.map((o) => {
                      const proveedor = proveedores.find((p) => p.id === o.proveedorId);
                      return (
                        <tr key={o.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                          <td className="p-2.5 font-semibold text-[#1A1A1A] whitespace-nowrap">{o.numero || "—"}</td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">{proveedor?.razonSocial || "—"}</td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaLegible(o.fecha)}</td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaLegible(o.fechaEntregaEsperada)}</td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">{formatoMonto(totalOrden(o))} {o.moneda.split(" ")[0]}</td>
                          <td className="p-2.5">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                              style={{ backgroundColor: colorEstadoOrden(o.estado) }}
                            >
                              {o.estado}
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <button onClick={() => editar(o)} className="text-[#F5A623] font-semibold hover:text-[#e09410] mr-3">Editar</button>
                            <button onClick={() => eliminar(o.id)} className="text-gray-300 hover:text-red-500">Eliminar</button>
                          </td>
                        </tr>
                      );
                    })}
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
