"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parsePersonal } from "@/lib/personal";
import { parseProveedores } from "@/lib/proveedores";
import { parseOrdenesCompra, ordenCompraVacia, itemOrdenVacio } from "@/lib/ordenesCompra";
import {
  parseRequisiciones,
  requisicionVacia,
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
  type Requisicion,
  type Cotizacion,
  type EtapaRequisicion,
} from "@/lib/requisicionPedidos";

const ITEM_KEY_REQ = "requisiciones_pedidos_lista";
const ITEM_KEY_ORDENES = "ordenes_compra_lista";
const NARANJA = "#F5A623";
const MAX_ARCHIVO_BYTES = 2_500_000;

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";
const celdaInput = "w-full text-[11px] bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#F5A623]";

export default function RequisicionPedidosPage() {
  const { user } = useDashboardUser();
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
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [mostrarRechazadas, setMostrarRechazadas] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const requisiciones = draft ?? guardadas;

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
  }

  function eliminar(id: string) {
    if (!confirm("¿Eliminar esta requisición?")) return;
    setDraft(requisiciones.filter((r) => r.id !== id));
  }

  async function mover(id: string, nuevaEtapa: EtapaRequisicion, nota = "") {
    const actualizadas = requisiciones.map((r) => (r.id === id ? moverEtapaRequisicion(r, nuevaEtapa, nota) : r));
    setDraft(actualizadas);
    await persistir(actualizadas);
  }

  function rechazar(id: string) {
    const motivo = prompt("¿Motivo del rechazo?") ?? "";
    mover(id, "Rechazada", `Rechazada: ${motivo}`);
    actualizar(id, { motivoRechazo: motivo });
  }

  async function generarOrdenCompra(req: Requisicion) {
    const ganadora = req.cotizaciones.find((c) => c.id === req.cotizacionGanadoraId);
    if (!ganadora) {
      alert("Seleccioná primero la cotización ganadora.");
      return;
    }
    if (!confirm(`¿Generar la Orden de Compra para "${req.descripcion}" con ${ganadora.proveedorNombre || "el proveedor seleccionado"}?`)) return;

    const nuevaOrden = {
      ...ordenCompraVacia(),
      proveedorId: ganadora.proveedorId ?? "",
      moneda: ganadora.moneda,
      formaPago: ganadora.condicionesPago,
      fechaEntregaEsperada: ganadora.plazoEntrega,
      items: [{ ...itemOrdenVacio(), descripcion: req.descripcion, cantidad: req.cantidad, unidad: req.unidad, precioUnitario: ganadora.precio }],
      observaciones: `Generada desde requisición ${req.codigo}.`,
    };

    const reqActualizada = moverEtapaRequisicion({ ...req, ordenCompraId: nuevaOrden.id }, "Compra", `Orden de Compra ${nuevaOrden.numero || nuevaOrden.id.slice(0, 8)} generada`);
    const requisicionesActualizadas = requisiciones.map((r) => (r.id === req.id ? reqActualizada : r));

    await persistir(requisicionesActualizadas, [...ordenesCompra, nuevaOrden]);
  }

  const filtradas = requisiciones.filter((r) => !filtroTipo || r.tipo === filtroTipo);
  const activas = filtradas.filter((r) => r.etapa !== "Rechazada");
  const rechazadas = filtradas.filter((r) => r.etapa === "Rechazada");
  const resumen = resumenPorEtapaRequisicion(requisiciones);
  const tiempoProm = tiempoPromedioCiclo(requisiciones);

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

      {/* KPIs */}
      {requisiciones.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
            <span className="text-lg font-bold text-[#1A1A1A]">{requisiciones.length}</span>
            <span className="text-xs text-gray-500 ml-1.5">requisiciones</span>
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
        <div className="flex gap-3" style={{ minWidth: ETAPAS_PIPELINE_COMPRAS.length * 280 }}>
          {ETAPAS_PIPELINE_COMPRAS.map((etapa) => {
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
                      onMover={(nuevaEtapa, nota) => mover(r.id, nuevaEtapa, nota)}
                      onGenerarOrden={() => generarOrdenCompra(r)}
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

      {requisiciones.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-2">Todavía no hay requisiciones cargadas.</p>
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
                  <p className="text-sm font-semibold text-[#1A1A1A]">{r.codigo} — {r.descripcion || "Sin descripción"}</p>
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
  onToggleExpandir,
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
  onToggleExpandir: () => void;
  onDragStart: () => void;
  onActualizar: (cambios: Partial<Requisicion>) => void;
  onEliminar: () => void;
  onRechazar: () => void;
  onMover: (etapa: EtapaRequisicion, nota?: string) => void;
  onGenerarOrden: () => void;
  personal: ReturnType<typeof parsePersonal>;
  proveedores: ReturnType<typeof parseProveedores>;
  ordenesCompra: ReturnType<typeof parseOrdenesCompra>;
  basePath: string;
}) {
  return (
    <div draggable onDragStart={onDragStart} className="bg-white rounded-xl border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing overflow-hidden" style={{ borderTop: `3px solid ${color}` }}>
      <div className="p-3 cursor-pointer" onClick={onToggleExpandir}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-gray-400">{req.codigo}</span>
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: colorPrioridad(req.prioridad) }}>
            {req.prioridad}
          </span>
        </div>
        <p className="text-xs font-semibold text-[#1A1A1A] mt-1 truncate">{req.descripcion || "Sin descripción"}</p>
        <p className="text-[10px] text-gray-400">{req.tipo} · {req.solicitante || "Sin solicitante"}</p>
      </div>

      {expandido && (
        <div className="p-3 pt-0 border-t border-gray-50" onClick={(e) => e.stopPropagation()}>
          {req.etapa === "Solicitud" && <FormSolicitud req={req} onActualizar={onActualizar} personal={personal} onMover={onMover} />}
          {req.etapa === "Autorización" && <FormAutorizacion req={req} onActualizar={onActualizar} personal={personal} onMover={onMover} onRechazar={onRechazar} />}
          {req.etapa === "Cotización" && <FormCotizacion req={req} onActualizar={onActualizar} proveedores={proveedores} onMover={onMover} />}
          {req.etapa === "Selección" && <FormSeleccion req={req} onActualizar={onActualizar} onMover={onMover} />}
          {req.etapa === "Compra" && <FormCompra req={req} onGenerarOrden={onGenerarOrden} ordenesCompra={ordenesCompra} basePath={basePath} />}
          {req.etapa === "Rechazada" && (
            <p className="text-xs text-gray-500 pt-2">Motivo: {req.motivoRechazo || "Sin motivo registrado"}</p>
          )}

          <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
            <p className="text-[9px] text-gray-300">{req.bitacora.length} evento{req.bitacora.length !== 1 ? "s" : ""} en bitácora</p>
            <button onClick={onEliminar} className="text-[10px] text-gray-300 hover:text-red-500">
              Eliminar
            </button>
          </div>
        </div>
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
    if (!req.descripcion.trim() || !req.solicitante.trim()) {
      alert("Completá al menos la descripción y el solicitante.");
      return;
    }
    onMover("Autorización", `Enviada a autorización por ${req.solicitante}`);
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
      <textarea value={req.descripcion} onChange={(e) => onActualizar({ descripcion: e.target.value })} placeholder="¿Qué producto, servicio o capacitación se solicita?" rows={2} className={celdaInput + " resize-y"} />
      <div className="grid grid-cols-[1fr_1fr] gap-2">
        <input
          type="number"
          min={1}
          value={req.cantidad}
          onChange={(e) => onActualizar({ cantidad: Math.max(1, Number(e.target.value) || 1) })}
          onWheel={(e) => e.currentTarget.blur()}
          placeholder="Cantidad"
          className={celdaInput}
        />
        <input value={req.unidad} onChange={(e) => onActualizar({ unidad: e.target.value })} placeholder="Unidad" className={celdaInput} />
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
  onMover: (etapa: EtapaRequisicion, nota?: string) => void;
  onRechazar: () => void;
}) {
  function aprobar() {
    if (!req.aprobador.trim()) {
      alert("Indicá quién aprueba.");
      return;
    }
    onActualizar({ fechaAprobacion: new Date().toISOString().slice(0, 10) });
    onMover("Cotización", `Aprobada por ${req.aprobador}`);
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="bg-[#FAFAFA] rounded-lg p-2 space-y-1 text-[11px] text-gray-600">
        <p><strong className="text-[#1A1A1A]">{req.cantidad} {req.unidad}</strong> — {req.descripcion}</p>
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
  onGenerarOrden,
  ordenesCompra,
  basePath,
}: {
  req: Requisicion;
  onGenerarOrden: () => void;
  ordenesCompra: ReturnType<typeof parseOrdenesCompra>;
  basePath: string;
}) {
  const ganadora = req.cotizaciones.find((c) => c.id === req.cotizacionGanadoraId);
  const ordenExiste = req.ordenCompraId && ordenesCompra.some((o) => o.id === req.ordenCompraId);

  return (
    <div className="space-y-2 pt-2">
      {ganadora && (
        <div className="bg-[#FAFAFA] rounded-lg p-2 text-[11px] text-gray-600 space-y-0.5">
          <p><strong className="text-[#1A1A1A]">{ganadora.proveedorNombre}</strong></p>
          <p>{ganadora.precio.toLocaleString("es")} {ganadora.moneda} · {ganadora.plazoEntrega || "sin plazo"}</p>
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
    </div>
  );
}
