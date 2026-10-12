"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import { parseClientes } from "@/lib/clientes";
import {
  parseVentas,
  parseMetas,
  ventaVacia,
  metaVacia,
  periodoActual,
  periodoDe,
  etiquetaPeriodo,
  totalPeriodo,
  metaDe,
  cumplimiento,
  colorCumplimiento,
  ticketPromedio,
  periodosConDatos,
  topClientes,
  formatoMonto,
  MONEDAS_VENTA,
  type Venta,
  type MetaVenta,
} from "@/lib/seguimientoVentas";

const ITEM_VENTAS = "ventas_registro";
const ITEM_METAS = "ventas_metas";

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

function capitalizar(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SeguimientoVentasPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-comercial`;

  const { docs, loading, save } = useGestionDocumentos("comercial", user?.id ?? null);

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [metas, setMetas] = useState<MetaVenta[]>([]);
  const [venta, setVenta] = useState<Venta>(ventaVacia());
  const [meta, setMeta] = useState<MetaVenta>(metaVacia());
  const [savingVenta, setSavingVenta] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [errorVenta, setErrorVenta] = useState<string | null>(null);
  const [okVenta, setOkVenta] = useState(false);
  const [okMeta, setOkMeta] = useState(false);

  useEffect(() => {
    if (!loading) {
      setVentas(parseVentas(docs[ITEM_VENTAS] ?? ""));
      setMetas(parseMetas(docs[ITEM_METAS] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const clientes = parseClientes(docs["clientes_lista"] ?? "");
  const periodo = periodoActual();
  const totalActual = totalPeriodo(ventas, periodo);
  const metaActual = metaDe(metas, periodo);
  const pctActual = cumplimiento(totalActual, metaActual?.monto ?? 0);
  const ticketProm = ticketPromedio(ventas, periodo);
  const ranking = topClientes(ventas, periodo, 1);
  const editandoVenta = ventas.some((v) => v.id === venta.id);
  const editandoMeta = metas.some((m) => m.id === meta.id);

  function campoVenta<K extends keyof Venta>(key: K, value: Venta[K]) {
    setVenta((v) => ({ ...v, [key]: value }));
  }

  function campoMeta<K extends keyof MetaVenta>(key: K, value: MetaVenta[K]) {
    setMeta((m) => ({ ...m, [key]: value }));
  }

  function limpiarVenta() {
    setVenta(ventaVacia());
    setErrorVenta(null);
  }

  function editarVenta(v: Venta) {
    setVenta({ ...v });
    setErrorVenta(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editarMeta(m: MetaVenta) {
    setMeta({ ...m });
  }

  async function guardarVenta() {
    if (!venta.clienteId) {
      setErrorVenta("Seleccioná el cliente de esta venta.");
      return;
    }
    if (!venta.monto) {
      setErrorVenta("Ingresá el monto de la venta.");
      return;
    }
    setErrorVenta(null);
    setSavingVenta(true);
    const cliente = clientes.find((c) => c.id === venta.clienteId);
    const registrada: Venta = { ...venta, clienteNombre: cliente?.razonSocial ?? venta.clienteNombre };
    const actualizadas = [...ventas.filter((v) => v.id !== venta.id), registrada];
    await save(ITEM_VENTAS, JSON.stringify(actualizadas));
    setVentas(actualizadas);
    setVenta(ventaVacia());
    setSavingVenta(false);
    setOkVenta(true);
    setTimeout(() => setOkVenta(false), 2000);
  }

  async function eliminarVenta(id: string) {
    setSavingVenta(true);
    const actualizadas = ventas.filter((v) => v.id !== id);
    await save(ITEM_VENTAS, JSON.stringify(actualizadas));
    setVentas(actualizadas);
    if (venta.id === id) limpiarVenta();
    setSavingVenta(false);
  }

  async function guardarMeta() {
    if (!meta.periodo || !meta.monto) return;
    setSavingMeta(true);
    const existente = metas.find((m) => m.periodo === meta.periodo);
    const actualizadas = [...metas.filter((m) => m.periodo !== meta.periodo), { ...meta, id: existente?.id ?? meta.id }];
    await save(ITEM_METAS, JSON.stringify(actualizadas));
    setMetas(actualizadas);
    setSavingMeta(false);
    setOkMeta(true);
    setTimeout(() => setOkMeta(false), 2000);
  }

  async function eliminarMeta(periodo: string) {
    setSavingMeta(true);
    const actualizadas = metas.filter((m) => m.periodo !== periodo);
    await save(ITEM_METAS, JSON.stringify(actualizadas));
    setMetas(actualizadas);
    if (meta.periodo === periodo) setMeta(metaVacia());
    setSavingMeta(false);
  }

  const ventasOrdenadas = [...ventas].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  const periodos = periodosConDatos(ventas, metas);
  const rankingGeneral = topClientes(ventas, undefined, 5);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión Comercial
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Seguimiento de Ventas</h1>
        <p className="text-gray-500 text-sm mt-1">Metas comerciales, ventas registradas y cumplimiento por período.</p>
      </div>

      {/* KPIs del período actual */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">💰</p>
          <p className="text-lg font-bold text-[#1A1A1A] truncate">{formatoMonto(totalActual)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Vendido en {capitalizar(etiquetaPeriodo(periodo))}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🎯</p>
          <p className="text-lg font-bold text-[#1A1A1A] truncate">{metaActual ? formatoMonto(metaActual.monto) : "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">Meta del período</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">✅</p>
          <p className="text-lg font-bold" style={{ color: colorCumplimiento(pctActual) }}>{pctActual !== null ? `${pctActual}%` : "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">Cumplimiento de meta</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🧾</p>
          <p className="text-lg font-bold text-[#1A1A1A] truncate">{ticketProm !== null ? formatoMonto(ticketProm) : "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">Ticket promedio</p>
        </div>
      </div>
      {ranking.length > 0 && (
        <p className="text-xs text-gray-500 -mt-1">🏆 Cliente top del período: <strong className="text-[#1A1A1A]">{ranking[0].clienteNombre}</strong> ({formatoMonto(ranking[0].total)})</p>
      )}

      {clientes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Necesitás tener al menos un cliente registrado para cargar ventas.</p>
          <Link href={`${basePath}/inscripcion_clientes`} className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm">
            Registrar cliente
          </Link>
        </div>
      ) : (
        <>
          {/* Meta de ventas */}
          <Seccion icono="🎯" titulo={editandoMeta ? "Editando meta de período" : "Meta de ventas"}>
            <div className="space-y-3">
              {okMeta && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Meta guardada</div>}
              <div className="grid sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={labelClass}>Período</label>
                  <input type="month" value={meta.periodo} onChange={(e) => campoMeta("periodo", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Monto meta</label>
                  <input type="number" min={0} value={meta.monto} onChange={(e) => campoMeta("monto", Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Moneda</label>
                  <select value={meta.moneda} onChange={(e) => campoMeta("moneda", e.target.value)} className={inputClass}>
                    {MONEDAS_VENTA.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button onClick={guardarMeta} disabled={savingMeta} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
                  {savingMeta ? "Guardando..." : "Guardar meta"}
                </button>
                {metas.length > 0 && (
                  <button onClick={() => setMeta(metaVacia())} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                    Nueva meta
                  </button>
                )}
                {editandoMeta && (
                  <button onClick={() => eliminarMeta(meta.periodo)} className="text-sm text-gray-300 hover:text-red-500 ml-auto">
                    Eliminar meta
                  </button>
                )}
              </div>
            </div>
          </Seccion>

          {/* Registrar venta */}
          <Seccion icono="💵" titulo={editandoVenta ? "Editando venta" : "Registrar venta"}>
            <div className="space-y-3">
              {errorVenta && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{errorVenta}</div>}
              {okVenta && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Venta guardada</div>}
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}><span className="text-red-500">*</span> Cliente</label>
                  <select value={venta.clienteId} onChange={(e) => campoVenta("clienteId", e.target.value)} className={inputClass}>
                    <option value="">Seleccioná</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Fecha</label>
                  <input type="date" value={venta.fecha} onChange={(e) => campoVenta("fecha", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><span className="text-red-500">*</span> Monto</label>
                  <input type="number" min={0} value={venta.monto} onChange={(e) => campoVenta("monto", Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Moneda</label>
                  <select value={venta.moneda} onChange={(e) => campoVenta("moneda", e.target.value)} className={inputClass}>
                    {MONEDAS_VENTA.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Concepto</label>
                  <input value={venta.concepto} onChange={(e) => campoVenta("concepto", e.target.value)} placeholder="Ej: Consultoría ISO 9001" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Observaciones</label>
                <textarea value={venta.observaciones} onChange={(e) => campoVenta("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button onClick={guardarVenta} disabled={savingVenta} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
                  {savingVenta ? "Guardando..." : editandoVenta ? "Guardar cambios" : "Guardar venta"}
                </button>
                <button onClick={limpiarVenta} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                  {editandoVenta ? "Nueva venta en blanco" : "Limpiar"}
                </button>
              </div>
            </div>
          </Seccion>

          {/* Metas vs. real por período */}
          {periodos.length > 0 && (
            <Seccion icono="📊" titulo="Metas vs. Real por Período">
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[560px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="p-2.5 font-semibold border-b border-gray-100">Período</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Meta</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Vendido</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodos.map((p) => {
                      const m = metaDe(metas, p);
                      const total = totalPeriodo(ventas, p);
                      const pct = cumplimiento(total, m?.monto ?? 0);
                      return (
                        <tr key={p} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                          <td className="p-2.5 font-semibold text-[#1A1A1A] whitespace-nowrap">{capitalizar(etiquetaPeriodo(p))}</td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">
                            {m ? (
                              <button onClick={() => editarMeta(m)} className="hover:text-[#F5A623]">{formatoMonto(m.monto)}</button>
                            ) : "—"}
                          </td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">{formatoMonto(total)}</td>
                          <td className="p-2.5">
                            {pct !== null ? (
                              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap" style={{ backgroundColor: colorCumplimiento(pct) }}>
                                {pct}%
                              </span>
                            ) : <span className="text-gray-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Seccion>
          )}

          {/* Top clientes */}
          {rankingGeneral.length > 0 && (
            <Seccion icono="🏆" titulo="Clientes con Mayor Venta Acumulada">
              <div className="space-y-2">
                {rankingGeneral.map((r, i) => (
                  <div key={r.clienteId} className="flex items-center gap-3 bg-[#FAFAFA] rounded-lg p-3 border border-gray-100">
                    <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">{r.clienteNombre}</p>
                      <p className="text-xs text-gray-500">{r.cantidad} venta{r.cantidad !== 1 ? "s" : ""}</p>
                    </div>
                    <p className="text-sm font-bold text-[#1A1A1A] whitespace-nowrap">{formatoMonto(r.total)}</p>
                  </div>
                ))}
              </div>
            </Seccion>
          )}

          {/* Registro de ventas */}
          <Seccion icono="🗂️" titulo="Ventas Registradas">
            {ventasOrdenadas.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Todavía no registraste ninguna venta.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[700px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="p-2.5 font-semibold border-b border-gray-100">Cliente</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Concepto</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Fecha</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Monto</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasOrdenadas.map((v) => (
                      <tr key={v.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                        <td className="p-2.5 font-semibold text-[#1A1A1A] whitespace-nowrap">{v.clienteNombre}</td>
                        <td className="p-2.5 text-gray-600 max-w-[220px] truncate">{v.concepto || "—"}</td>
                        <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaLegible(v.fecha)}</td>
                        <td className="p-2.5 text-gray-600 whitespace-nowrap">{formatoMonto(v.monto)} {v.moneda.split(" ")[0]}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <button onClick={() => editarVenta(v)} className="text-[#F5A623] font-semibold hover:text-[#e09410] mr-3">Editar</button>
                          <button onClick={() => eliminarVenta(v.id)} className="text-gray-300 hover:text-red-500">Eliminar</button>
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
