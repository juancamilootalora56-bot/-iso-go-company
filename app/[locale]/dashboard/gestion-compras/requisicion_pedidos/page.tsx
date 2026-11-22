"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { etapasPermitidas } from "@/lib/colaboradoresCliente";
import { parsePersonal } from "@/lib/personal";
import { parseProveedores } from "@/lib/proveedores";
import { parseOrdenesCompra, ordenCompraVacia, itemOrdenVacio } from "@/lib/ordenesCompra";
import {
  parseRequisiciones,
  requisicionVacia,
  itemRequisicionVacio,
  estadoAprobacionItem,
  colorEstadoAprobacionItem,
  labelEstadoAprobacionItem,
  siguienteCodigo,
  numeroDeCodigo,
  moverEtapaRequisicion,
  cotizacionVacia,
  cotizacionesMinimasRequeridas,
  cotizacionesCompletas,
  mejorCotizacionSugerida,
  resumenPorEtapaRequisicion,
  tiempoPromedioCiclo,
  colorEtapaRequisicion,
  colorPrioridad,
  ICONO_ETAPA_REQ,
  ETAPAS_PIPELINE_COMPRAS,
  TIPOS_REQUISICION,
  PRIORIDADES_REQUISICION,
  MONEDAS_COTIZACION,
  mesDeFecha,
  mesActual,
  nombreMes,
  mesAnterior,
  mesSiguiente,
  mesesConRequisiciones,
  type Requisicion,
  type Cotizacion,
  type EtapaRequisicion,
  type ItemRequisicion,
} from "@/lib/requisicionPedidos";

const ITEM_KEY_REQ = "requisiciones_pedidos_lista";
const ITEM_KEY_ORDENES = "ordenes_compra_lista";
const NARANJA = "#F5A623";
const MAX_ARCHIVO_BYTES = 2_500_000;

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";
const celdaInput = "w-full text-[11px] bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#F5A623]";

// Resumen legible de los ítems de una solicitud: "Tóner, Resmas de papel
// +2 más" — se usa en las tarjetas y listados donde antes se mostraba
// una sola descripción.
function resumenItemsRequisicion(req: Requisicion): string {
  const nombres = req.items.map((i) => i.descripcion).filter(Boolean);
  if (nombres.length === 0) return "Sin descripción";
  if (nombres.length <= 2) return nombres.join(", ");
  return `${nombres.slice(0, 2).join(", ")} +${nombres.length - 2} más`;
}

export default function RequisicionPedidosPage() {
  const { user, colaborador } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-compras`;

  const { docs, loading, save } = useGestionDocumentos("compras", user?.id ?? null);
  const { docs: docsTH, loading: loadingTH } = useGestionDocumentos("talento_humano", user?.id ?? null);

  const guardadas = useMemo(() => parseRequisiciones(docs[ITEM_KEY_REQ] ?? ""), [docs]);
  const proveedores = useMemo(() => parseProveedores(docs["proveedores_lista"] ?? ""), [docs]);
  const ordenesCompra = useMemo(() => parseOrdenesCompra(docs[ITEM_KEY_ORDENES] ?? ""), [docs]);
  const personal = useMemo(() => parsePersonal(docsTH["personal_lista"] ?? ""), [docsTH]);

  const [draft, setDraft] = useState<Requisicion[] | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [idAmpliado, setIdAmpliado] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [mostrarRechazadas, setMostrarRechazadas] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [mes, setMes] = useState(mesActual());
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const requisiciones = draft ?? guardadas;
  const meses = mesesConRequisiciones(requisiciones);

  if (loading || loadingTH) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  function mostrarMensaje(texto: string) {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 2500);
  }

  async function persistir(nuevas: Requisicion[], nuevasOrdenes?: typeof ordenesCompra) {
    setGuardando(true);
    await save(ITEM_KEY_REQ, JSON.stringify(nuevas));
    if (nuevasOrdenes) {
      await save(ITEM_KEY_ORDENES, JSON.stringify(nuevasOrdenes));
    }
    setDraft(null);
    setGuardando(false);
    mostrarMensaje("Guardado ✓");
  }

  function actualizar(id: string, cambios: Partial<Requisicion>) {
    setDraft(requisiciones.map((r) => (r.id === id ? { ...r, ...cambios } : r)));
    setMensaje("");
  }

  function nueva() {
    const codigo = siguienteCodigo(requisiciones.map((r) => numeroDeCodigo(r.codigo)));
    const nuevaReq = requisicionVacia(codigo);
    setDraft([...requisiciones, nuevaReq]);
    setExpandidoId(nuevaReq.id);
    setMes(mesActual());
  }

  function eliminar(id: string) {
    if (!confirm("¿Eliminar esta requisición?")) return;
    setDraft(requisiciones.filter((r) => r.id !== id));
  }

  async function mover(id: string, nuevaEtapa: EtapaRequisicion, nota = "", extra?: Partial<Requisicion>) {
    const actualizadas = requisiciones.map((r) => (r.id === id ? { ...moverEtapaRequisicion(r, nuevaEtapa, nota), ...extra } : r));
    setDraft(actualizadas);
    await persistir(actualizadas);
  }

  function rechazar(id: string) {
    const motivo = prompt("¿Motivo del rechazo?") ?? "";
    mover(id, "Rechazada", `Rechazada: ${motivo}`, { motivoRechazo: motivo });
  }

  async function generarOrdenCompra(req: Requisicion) {
    const ganadora = req.cotizaciones.find((c) => c.id === req.cotizacionGanadoraId);
    if (!ganadora) {
      alert("Seleccioná primero la cotización ganadora.");
      return;
    }
    const resumenItems = req.items.map((i) => i.descripcion).filter(Boolean).join(", ") || req.codigo;
    if (!confirm(`¿Generar la Orden de Compra para "${resumenItems}" con ${ganadora.proveedorNombre || "el proveedor seleccionado"}?`)) return;

    // La cotización hoy tiene un único precio por todo el lote (no por ítem
    // todavía) — se reparte en partes iguales entre los ítems solicitados.
    // Esto se va a precisar cuando trabajemos Cotización/Selección por ítem.
    const precioPorItem = req.items.length > 0 ? ganadora.precio / req.items.length : ganadora.precio;
    const nuevaOrden = {
      ...ordenCompraVacia(),
      proveedorId: ganadora.proveedorId ?? "",
      moneda: ganadora.moneda,
      formaPago: ganadora.condicionesPago,
      fechaEntregaEsperada: ganadora.plazoEntrega,
      items: req.items.map((i) => ({
        ...itemOrdenVacio(),
        descripcion: i.descripcion,
        cantidad: i.cantidad,
        unidad: i.unidad,
        precioUnitario: precioPorItem,
      })),
      observaciones: `Generada desde requisición ${req.codigo}.`,
    };

    const reqActualizada = moverEtapaRequisicion({ ...req, ordenCompraId: nuevaOrden.id }, "Compra", `Orden de Compra ${nuevaOrden.numero || nuevaOrden.id.slice(0, 8)} generada`);
    const requisicionesActualizadas = requisiciones.map((r) => (r.id === req.id ? reqActualizada : r));

    await persistir(requisicionesActualizadas, [...ordenesCompra, nuevaOrden]);
  }

  // Un colaborador puede tener acceso restringido a solo algunas etapas del
  // pipeline (ej. solo "Solicitud"). null = acceso completo (dueño, o
  // colaborador con la actividad completa habilitada).
  const etapasVisibles = colaborador ? etapasPermitidas(colaborador.permisos, "compras", "requisicion_pedidos") : null;
  const etapasPipelineVisibles = etapasVisibles === null ? ETAPAS_PIPELINE_COMPRAS : ETAPAS_PIPELINE_COMPRAS.filter((e) => etapasVisibles.includes(e));

  const requisicionesDelMes = requisiciones.filter((r) => mesDeFecha(r.fechaAlta) === mes);
  const filtradas = requisicionesDelMes.filter((r) => !filtroTipo || r.tipo === filtroTipo);
  const activas = filtradas.filter((r) => r.etapa !== "Rechazada" && (etapasVisibles === null || etapasVisibles.includes(r.etapa)));
  const rechazadas = etapasVisibles === null ? filtradas.filter((r) => r.etapa === "Rechazada") : [];
  const resumen = resumenPorEtapaRequisicion(requisicionesDelMes).filter((r) => etapasPipelineVisibles.includes(r.etapa as EtapaRequisicion));
  const tiempoProm = etapasVisibles === null ? tiempoPromedioCiclo(requisicionesDelMes) : null;
  const indiceMes = meses.indexOf(mes);
  const hayMesAnterior = indiceMes > 0;
  const hayMesSiguiente = indiceMes >= 0 && indiceMes < meses.length - 1;

  function onDragStart(id: string) {
    setDraggedId(id);
  }
  function onDrop(etapa: EtapaRequisicion) {
    if (draggedId) {
      mover(draggedId, etapa);
      setDraggedId(null);
    }
  }

  return (
    <div className="max-w-full space-y-4 pb-16">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Compras
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Requisición de Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-xl">
            Pipeline de compras: solicitud, autorización, cotización, selección del mejor proveedor y compra.
          </p>
        </div>
        <button onClick={nueva} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm flex-shrink-0">
          + Nueva requisición
        </button>
      </div>

      {/* Navegador de mes */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2 w-fit">
        <button
          onClick={() => setMes(mesAnterior(mes))}
          disabled={!hayMesAnterior}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-[#1A1A1A] capitalize min-w-[140px] text-center">{nombreMes(mes)}</span>
        <button
          onClick={() => setMes(mesSiguiente(mes))}
          disabled={!hayMesSiguiente}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Mes siguiente"
        >
          ›
        </button>
        {mes !== mesActual() && (
          <button onClick={() => setMes(mesActual())} className="text-[11px] font-semibold ml-1 hover:opacity-80" style={{ color: NARANJA }}>
            Hoy
          </button>
        )}
      </div>

      {/* KPIs */}
      {requisicionesDelMes.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
            <span className="text-lg font-bold text-[#1A1A1A]">{requisicionesDelMes.length}</span>
            <span className="text-xs text-gray-500 ml-1.5">requisiciones este mes</span>
          </div>
          {resumen.filter((r) => r.cantidad > 0).map((r) => (
            <div key={r.etapa} className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-sm font-bold text-[#1A1A1A]">{r.cantidad}</span>
              <span className="text-xs text-gray-500">{r.etapa}</span>
            </div>
          ))}
          {tiempoProm !== null && (
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
              <span className="text-lg font-bold text-[#1A1A1A]">{tiempoProm}</span>
              <span className="text-xs text-gray-500 ml-1.5">días promedio del ciclo</span>
            </div>
          )}
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623] ml-auto">
            <option value="">Todos los tipos</option>
            {TIPOS_REQUISICION.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pipeline Kanban */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3" style={{ minWidth: etapasPipelineVisibles.length * 280 }}>
          {etapasPipelineVisibles.map((etapa) => {
            const columna = activas.filter((r) => r.etapa === etapa);
            const color = colorEtapaRequisicion(etapa);
            return (
              <div key={etapa} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(etapa)} className="flex-1 min-w-[270px] bg-[#FAFAFA] rounded-2xl border border-gray-100 flex flex-col">
                <div className="px-3 py-3 flex items-center gap-2 rounded-t-2xl" style={{ backgroundColor: `${color}18`, borderBottom: `2px solid ${color}` }}>
                  <span>{ICONO_ETAPA_REQ[etapa]}</span>
                  <span className="text-xs font-bold uppercase tracking-wide flex-1" style={{ color }}>
                    {etapa}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                    {columna.length}
                  </span>
                </div>
                <div className="p-2.5 space-y-2.5 flex-1 min-h-[120px]">
                  {columna.map((r) => (
                    <TarjetaRequisicion
                      key={r.id}
                      req={r}
                      color={color}
                      expandido={expandidoId === r.id}
                      onToggleExpandir={() => setExpandidoId(expandidoId === r.id ? null : r.id)}
                      onDragStart={() => onDragStart(r.id)}
                      onActualizar={(cambios) => actualizar(r.id, cambios)}
                      onEliminar={() => eliminar(r.id)}
                      onRechazar={() => rechazar(r.id)}
                      onMover={(nuevaEtapa, nota, extra) => mover(r.id, nuevaEtapa, nota, extra)}
                      onGenerarOrden={() => generarOrdenCompra(r)}
                      onAbrirAmpliada={() => setIdAmpliado(r.id)}
                      personal={personal}
                      proveedores={proveedores}
                      ordenesCompra={ordenesCompra}
                      basePath={basePath}
                    />
                  ))}
                  {columna.length === 0 && <p className="text-[11px] text-gray-300 text-center py-4">Sin requisiciones</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vista ampliada: la misma tarjeta, pero grande y legible, para leer
          con calma antes de decidir (ej. aprobar cantidades por ítem). */}
      {idAmpliado && (() => {
        const r = requisiciones.find((x) => x.id === idAmpliado);
        if (!r) return null;
        const color = colorEtapaRequisicion(r.etapa);
        return (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto"
            onClick={() => setIdAmpliado(null)}
          >
            <style jsx global>{`
              .vista-ampliada input,
              .vista-ampliada select,
              .vista-ampliada textarea,
              .vista-ampliada button {
                font-size: 16px !important;
                padding-top: 11px !important;
                padding-bottom: 11px !important;
              }
              .vista-ampliada p,
              .vista-ampliada span,
              .vista-ampliada label {
                font-size: 15px !important;
                line-height: 1.5 !important;
              }
              .vista-ampliada input[type="checkbox"],
              .vista-ampliada input[type="radio"] {
                width: 18px !important;
                height: 18px !important;
                padding: 0 !important;
              }
            `}</style>
            <div
              className="vista-ampliada bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <span className="text-sm font-bold uppercase tracking-wide" style={{ color }}>
                  {ICONO_ETAPA_REQ[r.etapa]} {r.etapa} — {r.codigo}
                </span>
                <button
                  onClick={() => setIdAmpliado(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#1A1A1A] text-lg"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <TarjetaRequisicion
                  req={r}
                  color={color}
                  expandido
                  vistaAmpliada
                  onToggleExpandir={() => {}}
                  onDragStart={() => {}}
                  onActualizar={(cambios) => actualizar(r.id, cambios)}
                  onEliminar={() => {
                    eliminar(r.id);
                    setIdAmpliado(null);
                  }}
                  onRechazar={() => rechazar(r.id)}
                  onMover={(nuevaEtapa, nota, extra) => mover(r.id, nuevaEtapa, nota, extra)}
                  onGenerarOrden={() => generarOrdenCompra(r)}
                  personal={personal}
                  proveedores={proveedores}
                  ordenesCompra={ordenesCompra}
                  basePath={basePath}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {requisicionesDelMes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-2">
            {requisiciones.length === 0 ? "Todavía no hay requisiciones cargadas." : `No hay requisiciones en ${nombreMes(mes)}.`}
          </p>
          <button onClick={nueva} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
            Crear la primera →
          </button>
        </div>
      )}

      {/* Rechazadas */}
      {rechazadas.length > 0 && (
        <div>
          <button onClick={() => setMostrarRechazadas(!mostrarRechazadas)} className="text-xs font-semibold text-gray-400 hover:text-[#1A1A1A]">
            {mostrarRechazadas ? "▲" : "▼"} Rechazadas ({rechazadas.length})
          </button>
          {mostrarRechazadas && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
              {rechazadas.map((r) => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-3 opacity-70">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{r.codigo} — {resumenItemsRequisicion(r)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.motivoRechazo || "Sin motivo registrado"}</p>
                  <button onClick={() => mover(r.id, "Solicitud", "Reabierta")} className="text-[11px] font-semibold mt-2 hover:opacity-80" style={{ color: NARANJA }}>
                    ↺ Reabrir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {mensaje && <span className="text-xs text-green-600 font-semibold">{mensaje}</span>}
        <button onClick={() => persistir(requisiciones)} disabled={guardando} className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50">
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

function TarjetaRequisicion({
  req,
  color,
  expandido,
  vistaAmpliada,
  onToggleExpandir,
  onAbrirAmpliada,
  onDragStart,
  onActualizar,
  onEliminar,
  onRechazar,
  onMover,
  onGenerarOrden,
  personal,
  proveedores,
  ordenesCompra,
  basePath,
}: {
  req: Requisicion;
  color: string;
  expandido: boolean;
  vistaAmpliada?: boolean;
  onToggleExpandir: () => void;
  onAbrirAmpliada?: () => void;
  onDragStart: () => void;
  onActualizar: (cambios: Partial<Requisicion>) => void;
  onEliminar: () => void;
  onRechazar: () => void;
  onMover: (etapa: EtapaRequisicion, nota?: string, extra?: Partial<Requisicion>) => void;
  onGenerarOrden: () => void;
  personal: ReturnType<typeof parsePersonal>;
  proveedores: ReturnType<typeof parseProveedores>;
  ordenesCompra: ReturnType<typeof parseOrdenesCompra>;
  basePath: string;
}) {
  return (
    <div
      draggable={!vistaAmpliada}
      onDragStart={onDragStart}
      className={vistaAmpliada ? "" : "bg-white rounded-xl border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing overflow-hidden"}
      style={vistaAmpliada ? undefined : { borderTop: `3px solid ${color}` }}
    >
      {!vistaAmpliada && (
        <div className="p-3 cursor-pointer" onClick={onToggleExpandir}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-gray-400">{req.codigo}</span>
            <div className="flex items-center gap-1.5">
              {onAbrirAmpliada && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAbrirAmpliada();
                  }}
                  title="Ver en grande"
                  className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-[#1A1A1A] hover:bg-gray-100 text-xs flex-shrink-0"
                >
                  ⛶
                </button>
              )}
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: colorPrioridad(req.prioridad) }}>
                {req.prioridad}
              </span>
            </div>
          </div>
          <p className="text-xs font-semibold text-[#1A1A1A] mt-1 truncate">{resumenItemsRequisicion(req)}</p>
          <p className="text-[10px] text-gray-400">{req.tipo} · {req.solicitante || "Sin solicitante"}</p>
        </div>
      )}

      {expandido && (
        <div className={vistaAmpliada ? "" : "p-3 pt-0 border-t border-gray-50"} onClick={(e) => e.stopPropagation()}>
          {vistaAmpliada && (
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4 pb-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-[#1A1A1A]">{resumenItemsRequisicion(req)}</p>
                <p className="text-gray-400">{req.tipo} · {req.solicitante || "Sin solicitante"}</p>
              </div>
              <span className="font-bold uppercase px-2.5 py-1 rounded-full text-white flex-shrink-0" style={{ backgroundColor: colorPrioridad(req.prioridad) }}>
                {req.prioridad}
              </span>
            </div>
          )}
          {req.etapa === "Solicitud" && <FormSolicitud req={req} onActualizar={onActualizar} personal={personal} onMover={onMover} />}
          {req.etapa === "Autorización" && <FormAutorizacion req={req} onActualizar={onActualizar} personal={personal} onMover={onMover} onRechazar={onRechazar} />}
          {req.etapa === "Cotización" && <FormCotizacion req={req} onActualizar={onActualizar} proveedores={proveedores} onMover={onMover} />}
          {req.etapa === "Selección" && <FormSeleccion req={req} onActualizar={onActualizar} onMover={onMover} />}
          {req.etapa === "Compra" && <FormCompra req={req} onActualizar={onActualizar} onGenerarOrden={onGenerarOrden} ordenesCompra={ordenesCompra} basePath={basePath} />}
          {req.etapa === "Rechazada" && (
            <p className="text-xs text-gray-500 pt-2">Motivo: {req.motivoRechazo || "Sin motivo registrado"}</p>
          )}

          <BitacoraRequisicion req={req} />

          <div className="flex items-center justify-end pt-2 mt-1">
            <button onClick={onEliminar} className="text-[10px] text-gray-300 hover:text-red-500">
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BitacoraRequisicion({ req }: { req: Requisicion }) {
  const [abierta, setAbierta] = useState(false);
  const eventos = [...req.bitacora].reverse();

  return (
    <div className="pt-2 mt-2 border-t border-gray-100">
      <button onClick={() => setAbierta(!abierta)} className="text-[9px] font-semibold text-gray-400 hover:text-[#1A1A1A]">
        {abierta ? "▲" : "▼"} {req.bitacora.length} evento{req.bitacora.length !== 1 ? "s" : ""} en bitácora — trazabilidad completa
      </button>
      {abierta && (
        <ul className="mt-1.5 space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {eventos.map((ev) => (
            <li key={ev.id} className="text-[10px] text-gray-500 flex gap-2">
              <span className="text-gray-300 whitespace-nowrap flex-shrink-0">{ev.fecha}</span>
              <span>
                {ev.nota}
                {ev.etapaDesde && ev.etapaHasta && (
                  <span className="text-gray-300"> ({ev.etapaDesde} → {ev.etapaHasta})</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Etapa 1: Solicitud ---

function FormSolicitud({
  req,
  onActualizar,
  personal,
  onMover,
}: {
  req: Requisicion;
  onActualizar: (c: Partial<Requisicion>) => void;
  personal: ReturnType<typeof parsePersonal>;
  onMover: (etapa: EtapaRequisicion, nota?: string) => void;
}) {
  function enviar() {
    const hayAlMenosUnItem = req.items.some((i) => i.descripcion.trim());
    if (!hayAlMenosUnItem || !req.solicitante.trim()) {
      alert("Completá al menos un ítem con descripción y el solicitante.");
      return;
    }
    onMover("Autorización", `Enviada a autorización por ${req.solicitante}`);
  }

  function actualizarItem(itemId: string, cambios: Partial<ItemRequisicion>) {
    // Mientras la solicitud todavía no se envió a autorización, la cantidad
    // autorizada "sigue" a la cantidad pedida — recién se vuelve
    // independiente cuando el aprobador la ajusta en la etapa siguiente.
    const conSincronizacion = "cantidad" in cambios ? { ...cambios, cantidadAprobada: cambios.cantidad } : cambios;
    onActualizar({ items: req.items.map((i) => (i.id === itemId ? { ...i, ...conSincronizacion } : i)) });
  }

  function agregarItem() {
    onActualizar({ items: [...req.items, itemRequisicionVacio()] });
  }

  function quitarItem(itemId: string) {
    onActualizar({ items: req.items.length > 1 ? req.items.filter((i) => i.id !== itemId) : req.items });
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="grid grid-cols-2 gap-2">
        <select value={req.tipo} onChange={(e) => onActualizar({ tipo: e.target.value as Requisicion["tipo"] })} className={celdaInput}>
          {TIPOS_REQUISICION.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={req.prioridad} onChange={(e) => onActualizar({ prioridad: e.target.value })} className={celdaInput}>
          {PRIORIDADES_REQUISICION.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Ítems solicitados</p>
        {req.items.map((item, i) => (
          <div key={item.id} className="flex items-start gap-1.5 bg-[#FAFAFA] border border-gray-100 rounded-lg p-1.5">
            <span className="text-[10px] font-bold text-gray-300 mt-1.5 w-3 flex-shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0 space-y-1">
              <textarea
                value={item.descripcion}
                onChange={(e) => actualizarItem(item.id, { descripcion: e.target.value })}
                placeholder="¿Qué producto, servicio o capacitación se solicita?"
                rows={1}
                className={celdaInput + " resize-y bg-white"}
              />
              <div className="grid grid-cols-[1fr_1fr] gap-1.5">
                <input
                  type="number"
                  min={1}
                  value={item.cantidad}
                  onChange={(e) => actualizarItem(item.id, { cantidad: Math.max(1, Number(e.target.value) || 1) })}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Cantidad"
                  className={celdaInput + " bg-white"}
                />
                <input
                  value={item.unidad}
                  onChange={(e) => actualizarItem(item.id, { unidad: e.target.value })}
                  placeholder="Unidad"
                  className={celdaInput + " bg-white"}
                />
              </div>
            </div>
            {req.items.length > 1 && (
              <button
                type="button"
                onClick={() => quitarItem(item.id)}
                className="text-gray-300 hover:text-red-500 flex-shrink-0 mt-1.5 text-xs"
                title="Quitar este ítem"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={agregarItem}
          className="w-full text-[11px] font-semibold py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] transition-colors"
        >
          + Agregar ítem
        </button>
      </div>

      <input value={req.area} onChange={(e) => onActualizar({ area: e.target.value })} placeholder="Área / centro de costo" className={celdaInput} />
      <select value={req.solicitante} onChange={(e) => onActualizar({ solicitante: e.target.value })} className={celdaInput}>
        <option value="">Solicitante...</option>
        {personal.map((p) => (
          <option key={p.id} value={`${p.nombre} ${p.apellido}`}>
            {p.nombre} {p.apellido} {p.cargo ? `(${p.cargo})` : ""}
          </option>
        ))}
      </select>
      <input type="date" value={req.fechaNecesaria} onChange={(e) => onActualizar({ fechaNecesaria: e.target.value })} className={celdaInput} />
      <textarea value={req.justificacion} onChange={(e) => onActualizar({ justificacion: e.target.value })} placeholder="Justificación de la solicitud..." rows={2} className={celdaInput + " resize-y"} />
      <button onClick={enviar} className="w-full text-xs font-bold py-2 rounded-lg text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: "#3B82F6" }}>
        Enviar a autorización →
      </button>
    </div>
  );
}

// --- Etapa 2: Autorización ---

function FormAutorizacion({
  req,
  onActualizar,
  personal,
  onMover,
  onRechazar,
}: {
  req: Requisicion;
  onActualizar: (c: Partial<Requisicion>) => void;
  personal: ReturnType<typeof parsePersonal>;
  onMover: (etapa: EtapaRequisicion, nota?: string, extra?: Partial<Requisicion>) => void;
  onRechazar: () => void;
}) {
  function actualizarItem(itemId: string, cambios: Partial<ItemRequisicion>) {
    onActualizar({ items: req.items.map((i) => (i.id === itemId ? { ...i, ...cambios } : i)) });
  }

  function aprobar() {
    if (!req.aprobador.trim()) {
      alert("Indicá quién aprueba.");
      return;
    }
    if (!req.items.some((i) => i.cantidadAprobada > 0)) {
      alert("Autorizá al menos un ítem antes de aprobar.");
      return;
    }
    const todosCompletos = req.items.every((i) => estadoAprobacionItem(i) === "completo");
    const nota = todosCompletos
      ? `Aprobada por ${req.aprobador}`
      : `Aprobada parcialmente por ${req.aprobador} (${req.items.filter((i) => i.cantidadAprobada > 0).length}/${req.items.length} ítems)`;
    onMover("Cotización", nota, { fechaAprobacion: new Date().toISOString().slice(0, 10) });
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Decidir autorización por ítem</p>
        {req.items.map((item) => {
          const estado = estadoAprobacionItem(item);
          return (
            <div key={item.id} className="bg-[#FAFAFA] border border-gray-100 rounded-lg p-2 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-[#1A1A1A] font-semibold flex-1 min-w-0 truncate">{item.descripcion || "Sin descripción"}</p>
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                  style={{ backgroundColor: colorEstadoAprobacionItem(estado) }}
                >
                  {labelEstadoAprobacionItem(estado)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="flex-shrink-0">Pedido: {item.cantidad} {item.unidad} — Autorizar:</span>
                <input
                  type="number"
                  min={0}
                  max={item.cantidad}
                  value={item.cantidadAprobada}
                  onChange={(e) => actualizarItem(item.id, { cantidadAprobada: Math.max(0, Math.min(item.cantidad, Number(e.target.value) || 0)) })}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-16 bg-white border border-gray-200 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:border-[#F5A623]"
                />
                <button type="button" onClick={() => actualizarItem(item.id, { cantidadAprobada: item.cantidad })} className="text-[10px] font-semibold text-green-600 hover:opacity-70 flex-shrink-0">
                  Todo
                </button>
                <button type="button" onClick={() => actualizarItem(item.id, { cantidadAprobada: 0 })} className="text-[10px] font-semibold text-gray-400 hover:opacity-70 flex-shrink-0">
                  Nada
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#FAFAFA] rounded-lg p-2 space-y-1 text-[11px] text-gray-600">
        <p>Área: {req.area || "—"} · Necesario para: {req.fechaNecesaria || "—"}</p>
        <p>Solicitado por {req.solicitante || "—"}</p>
        {req.justificacion && <p className="italic">"{req.justificacion}"</p>}
      </div>
      <select value={req.aprobador} onChange={(e) => onActualizar({ aprobador: e.target.value })} className={celdaInput}>
        <option value="">Aprobador...</option>
        {personal.map((p) => (
          <option key={p.id} value={`${p.nombre} ${p.apellido}`}>
            {p.nombre} {p.apellido} {p.cargo ? `(${p.cargo})` : ""}
          </option>
        ))}
      </select>
      <textarea value={req.comentarioAprobacion} onChange={(e) => onActualizar({ comentarioAprobacion: e.target.value })} placeholder="Comentario (opcional)..." rows={2} className={celdaInput + " resize-y"} />
      <div className="grid grid-cols-2 gap-2">
        <button onClick={aprobar} className="text-xs font-bold py-2 rounded-lg text-white hover:opacity-90" style={{ backgroundColor: "#22C55E" }}>
          ✓ Aprobar
        </button>
        <button onClick={onRechazar} className="text-xs font-bold py-2 rounded-lg text-white hover:opacity-90 bg-red-500">
          ✕ Rechazar
        </button>
      </div>
    </div>
  );
}

// --- Etapa 3: Cotización ---

function FormCotizacion({
  req,
  onActualizar,
  proveedores,
  onMover,
}: {
  req: Requisicion;
  onActualizar: (c: Partial<Requisicion>) => void;
  proveedores: ReturnType<typeof parseProveedores>;
  onMover: (etapa: EtapaRequisicion, nota?: string) => void;
}) {
  const minimas = cotizacionesMinimasRequeridas(req);
  const completas = cotizacionesCompletas(req);

  function agregarCotizacion() {
    onActualizar({ cotizaciones: [...req.cotizaciones, cotizacionVacia()] });
  }

  function actualizarCotizacion(id: string, cambios: Partial<Cotizacion>) {
    onActualizar({ cotizaciones: req.cotizaciones.map((c) => (c.id === id ? { ...c, ...cambios } : c)) });
  }

  function eliminarCotizacion(id: string) {
    onActualizar({ cotizaciones: req.cotizaciones.filter((c) => c.id !== id) });
  }

  function continuar() {
    if (!completas) {
      alert(`Necesitás al menos ${minimas} cotización${minimas !== 1 ? "es" : ""} cargada${minimas !== 1 ? "s" : ""}.`);
      return;
    }
    onMover("Selección", `${req.cotizaciones.length} cotizaciones cargadas`);
  }

  return (
    <div className="space-y-2 pt-2">
      <label className="flex items-center gap-2 text-[11px] text-gray-600 bg-[#FAFAFA] rounded-lg p-2">
        <input type="checkbox" checked={req.proveedorConocido} onChange={(e) => onActualizar({ proveedorConocido: e.target.checked })} />
        Ya tengo proveedor conocido para esto (1 cotización). Si no, se piden 3.
      </label>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (req.cotizaciones.length / minimas) * 100)}%`, backgroundColor: completas ? "#22C55E" : "#F5A623" }} />
        </div>
        <span className="text-[10px] text-gray-400 whitespace-nowrap">{req.cotizaciones.length}/{minimas}</span>
      </div>

      {req.cotizaciones.map((c, i) => (
        <TarjetaCotizacion key={c.id} indice={i + 1} cotizacion={c} proveedores={proveedores} onActualizar={(cambios) => actualizarCotizacion(c.id, cambios)} onEliminar={() => eliminarCotizacion(c.id)} />
      ))}

      <button onClick={agregarCotizacion} className="text-[11px] font-semibold hover:opacity-80" style={{ color: NARANJA }}>
        + Agregar cotización
      </button>

      <button onClick={continuar} disabled={!completas} className="w-full text-xs font-bold py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-40 transition-opacity" style={{ backgroundColor: "#14B8A6" }}>
        Pasar a selección →
      </button>
    </div>
  );
}

function TarjetaCotizacion({
  indice,
  cotizacion,
  proveedores,
  onActualizar,
  onEliminar,
}: {
  indice: number;
  cotizacion: Cotizacion;
  proveedores: ReturnType<typeof parseProveedores>;
  onActualizar: (c: Partial<Cotizacion>) => void;
  onEliminar: () => void;
}) {
  const archivoRef = useRef<HTMLInputElement>(null);

  function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ARCHIVO_BYTES) {
      alert("El archivo es muy pesado (máx. 2.5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onActualizar({ archivo: reader.result as string, archivoNombre: file.name });
    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-[#FFF6E5]/50 border border-[#F5A623]/20 rounded-lg p-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#1A1A1A]">Cotización {indice}</span>
        <button onClick={onEliminar} className="text-[10px] text-red-300 hover:text-red-600">
          ✕
        </button>
      </div>
      {proveedores.length > 0 ? (
        <select
          value={cotizacion.proveedorId ?? ""}
          onChange={(e) => {
            const prov = proveedores.find((p) => p.id === e.target.value);
            onActualizar({ proveedorId: e.target.value || null, proveedorNombre: prov ? prov.razonSocial : cotizacion.proveedorNombre });
          }}
          className={celdaInput}
        >
          <option value="">Proveedor nuevo (texto libre abajo)</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.razonSocial}
            </option>
          ))}
        </select>
      ) : null}
      {!cotizacion.proveedorId && (
        <input value={cotizacion.proveedorNombre} onChange={(e) => onActualizar({ proveedorNombre: e.target.value })} placeholder="Nombre del proveedor" className={celdaInput} />
      )}
      <div className="grid grid-cols-[1fr_1fr] gap-1.5">
        <input
          type="number"
          min={0}
          value={cotizacion.precio}
          onChange={(e) => onActualizar({ precio: Math.max(0, Number(e.target.value) || 0) })}
          onWheel={(e) => e.currentTarget.blur()}
          placeholder="Precio"
          className={celdaInput}
        />
        <select value={cotizacion.moneda} onChange={(e) => onActualizar({ moneda: e.target.value })} className={celdaInput}>
          {MONEDAS_COTIZACION.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <input value={cotizacion.plazoEntrega} onChange={(e) => onActualizar({ plazoEntrega: e.target.value })} placeholder="Plazo de entrega" className={celdaInput} />
        <input value={cotizacion.condicionesPago} onChange={(e) => onActualizar({ condicionesPago: e.target.value })} placeholder="Condiciones de pago" className={celdaInput} />
      </div>
      <input value={cotizacion.calidadObservada} onChange={(e) => onActualizar({ calidadObservada: e.target.value })} placeholder="Observaciones de calidad" className={celdaInput} />
      <div className="flex items-center gap-2">
        <input ref={archivoRef} type="file" onChange={handleArchivo} className="hidden" />
        <button onClick={() => archivoRef.current?.click()} className="text-[10px] font-semibold px-2 py-1 rounded border border-gray-200 hover:border-[#F5A623]">
          📎 {cotizacion.archivoNombre ? "Cambiar" : "Adjuntar"}
        </button>
        {cotizacion.archivoNombre && (
          <a href={cotizacion.archivo ?? "#"} download={cotizacion.archivoNombre} className="text-[10px] hover:opacity-80 truncate" style={{ color: NARANJA }}>
            {cotizacion.archivoNombre}
          </a>
        )}
      </div>
    </div>
  );
}

// --- Etapa 4: Selección ---

function FormSeleccion({ req, onActualizar, onMover }: { req: Requisicion; onActualizar: (c: Partial<Requisicion>) => void; onMover: (etapa: EtapaRequisicion, nota?: string) => void }) {
  const sugerida = mejorCotizacionSugerida(req);

  function confirmar() {
    if (!req.cotizacionGanadoraId) {
      alert("Elegí la cotización ganadora.");
      return;
    }
    onMover("Compra", "Cotización ganadora seleccionada");
  }

  return (
    <div className="space-y-2 pt-2">
      {sugerida && <p className="text-[10px] text-gray-400">💡 La de menor precio es {sugerida.proveedorNombre || "sin nombre"} ({sugerida.precio.toLocaleString("es")}).</p>}
      <div className="space-y-1.5">
        {req.cotizaciones.map((c) => (
          <label
            key={c.id}
            className={`flex items-start gap-2 rounded-lg p-2 border cursor-pointer ${req.cotizacionGanadoraId === c.id ? "border-[#14B8A6] bg-[#14B8A6]/5" : "border-gray-200 bg-[#FAFAFA]"}`}
          >
            <input type="radio" checked={req.cotizacionGanadoraId === c.id} onChange={() => onActualizar({ cotizacionGanadoraId: c.id })} className="mt-0.5" />
            <div className="min-w-0 flex-1 text-[11px]">
              <p className="font-semibold text-[#1A1A1A] truncate">{c.proveedorNombre || "Sin nombre"}</p>
              <p className="text-gray-500">{c.precio.toLocaleString("es")} {c.moneda} · {c.plazoEntrega || "sin plazo"} · {c.condicionesPago || "sin condiciones"}</p>
              {c.calidadObservada && <p className="text-gray-400 italic">{c.calidadObservada}</p>}
            </div>
          </label>
        ))}
      </div>
      <textarea value={req.criterioSeleccion} onChange={(e) => onActualizar({ criterioSeleccion: e.target.value })} placeholder="Criterio de selección (precio, calidad, tiempos...)" rows={2} className={celdaInput + " resize-y"} />
      <button onClick={confirmar} className="w-full text-xs font-bold py-2 rounded-lg text-white hover:opacity-90" style={{ backgroundColor: "#22C55E" }}>
        Confirmar selección →
      </button>
    </div>
  );
}

// --- Etapa 5: Compra ---

function FormCompra({
  req,
  onActualizar,
  onGenerarOrden,
  ordenesCompra,
  basePath,
}: {
  req: Requisicion;
  onActualizar: (c: Partial<Requisicion>) => void;
  onGenerarOrden: () => void;
  ordenesCompra: ReturnType<typeof parseOrdenesCompra>;
  basePath: string;
}) {
  const ordenExiste = req.ordenCompraId && ordenesCompra.some((o) => o.id === req.ordenCompraId);
  const archivoRef = useRef<HTMLInputElement>(null);

  function handleArchivoPropio(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ARCHIVO_BYTES) {
      alert("El archivo es muy pesado (máx. 2.5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onActualizar({ archivoOrdenCompra: reader.result as string, archivoOrdenCompraNombre: file.name });
    reader.readAsDataURL(file);
  }

  function quitarArchivoPropio() {
    onActualizar({ archivoOrdenCompra: null, archivoOrdenCompraNombre: "" });
  }

  return (
    <div className="space-y-2 pt-2">
      {req.cotizaciones.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Cotización{req.cotizaciones.length !== 1 ? "es" : ""} recibida{req.cotizaciones.length !== 1 ? "s" : ""} ({req.cotizaciones.length})
          </p>
          {req.cotizaciones.map((c) => {
            const esGanadora = c.id === req.cotizacionGanadoraId;
            return (
              <div
                key={c.id}
                className={`rounded-lg p-2 text-[11px] space-y-0.5 border ${esGanadora ? "border-[#22C55E] bg-[#22C55E]/5" : "border-gray-200 bg-[#FAFAFA]"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-[#1A1A1A]">{c.proveedorNombre || "Sin nombre"}</strong>
                  {esGanadora && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white bg-[#22C55E] flex-shrink-0">
                      ✓ Ganadora
                    </span>
                  )}
                </div>
                <p className="text-gray-600">
                  {c.precio.toLocaleString("es")} {c.moneda} · {c.plazoEntrega || "sin plazo"} · {c.condicionesPago || "sin condiciones"}
                </p>
                {c.calidadObservada && <p className="text-gray-400 italic">{c.calidadObservada}</p>}
                {c.archivoNombre && (
                  <a href={c.archivo ?? "#"} download={c.archivoNombre} className="inline-block text-[10px] hover:opacity-80" style={{ color: NARANJA }}>
                    📎 {c.archivoNombre}
                  </a>
                )}
              </div>
            );
          })}
          {req.criterioSeleccion && (
            <p className="text-[10px] text-gray-400 italic">Criterio de selección: {req.criterioSeleccion}</p>
          )}
        </div>
      )}
      {ordenExiste ? (
        <Link href={`${basePath}/ordenes_compra`} className="block text-center text-xs font-bold py-2 rounded-lg text-white hover:opacity-90" style={{ backgroundColor: "#22C55E" }}>
          ✓ Orden de Compra generada — Ver →
        </Link>
      ) : (
        <button onClick={onGenerarOrden} className="w-full text-xs font-bold py-2 rounded-lg text-white hover:opacity-90" style={{ backgroundColor: "#22C55E" }}>
          🛒 Generar Orden de Compra
        </button>
      )}

      <div className="bg-[#FAFAFA] rounded-lg p-2 space-y-1.5">
        <p className="text-[10px] text-gray-500">¿La empresa ya tiene su propia Orden de Compra? Adjuntala acá.</p>
        <input ref={archivoRef} type="file" onChange={handleArchivoPropio} className="hidden" />
        <div className="flex items-center gap-2">
          <button onClick={() => archivoRef.current?.click()} className="text-[10px] font-semibold px-2 py-1 rounded border border-gray-200 hover:border-[#F5A623]">
            📎 {req.archivoOrdenCompraNombre ? "Cambiar" : "Adjuntar"} Orden de Compra
          </button>
          {req.archivoOrdenCompraNombre && (
            <>
              <a href={req.archivoOrdenCompra ?? "#"} download={req.archivoOrdenCompraNombre} className="text-[10px] hover:opacity-80 truncate" style={{ color: NARANJA }}>
                {req.archivoOrdenCompraNombre}
              </a>
              <button onClick={quitarArchivoPropio} className="text-[10px] text-red-300 hover:text-red-600 flex-shrink-0">
                ✕
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
