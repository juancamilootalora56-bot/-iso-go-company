"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { ProductoFabricado } from "@/lib/productosFabricados";
import {
  parsePasos,
  pasoVacio,
  recursoVacio,
  reordenar,
  tiempoEnMinutos,
  tiempoTotalProceso,
  pctValorAgregado,
  formatoTiempo,
  costoPaso,
  costoRecursos,
  costoTotalProceso,
  formatoMonto,
  resumenPorTipo,
  pasoMasLargo,
  contarRecursos,
  colorTipoPaso,
  simboloTipoPaso,
  etiquetaTipoPaso,
  TIPOS_PASO,
  type PasoProceso,
  type RecursoPaso,
} from "@/lib/procesoOperativo";

type ClaveRecurso = "materiasPrimas" | "maquinarias" | "materiales" | "insumos";

const RECURSOS_CONFIG: { clave: ClaveRecurso; titulo: string; icono: string; placeholderUnidad: string }[] = [
  { clave: "materiasPrimas", titulo: "Materias primas", icono: "🌾", placeholderUnidad: "Kg" },
  { clave: "maquinarias", titulo: "Maquinaria", icono: "⚙️", placeholderUnidad: "horas" },
  { clave: "materiales", titulo: "Materiales", icono: "🧱", placeholderUnidad: "unidad" },
  { clave: "insumos", titulo: "Insumos", icono: "🧪", placeholderUnidad: "unidad" },
];

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function itemKeyProceso(productoId: string) {
  return `proceso_operativo_${productoId}`;
}

function TablaRecursos({ titulo, icono, recursos }: { titulo: string; icono: string; recursos: RecursoPaso[] }) {
  if (recursos.length === 0) return null;
  const total = costoRecursos(recursos);
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
        {icono} {titulo}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[420px]">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="py-1 pr-3 font-medium">Nombre</th>
              <th className="py-1 px-3 font-medium text-right">Cant.</th>
              <th className="py-1 px-3 font-medium">Unidad</th>
              <th className="py-1 px-3 font-medium text-right">Costo u.</th>
              <th className="py-1 pl-3 font-medium text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {recursos.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="py-1 pr-3 text-[#1A1A1A]">{r.nombre || "—"}</td>
                <td className="py-1 px-3 text-right text-gray-600">{r.cantidad}</td>
                <td className="py-1 px-3 text-gray-500">{r.unidad || "—"}</td>
                <td className="py-1 px-3 text-right text-gray-500">{r.costoUnitario ? formatoMonto(r.costoUnitario) : "—"}</td>
                <td className="py-1 pl-3 text-right font-semibold text-[#1A1A1A]">
                  {r.costoUnitario ? formatoMonto(r.cantidad * r.costoUnitario) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 0 && (
        <p className="text-right text-[11px] text-gray-500 mt-0.5">
          Subtotal: <strong className="text-[#1A1A1A]">{formatoMonto(total)}</strong>
        </p>
      )}
    </div>
  );
}

export default function ProcesoOperativoForm({ userId, producto }: { userId: string | null; producto: ProductoFabricado }) {
  const { docs, loading, save } = useGestionDocumentos("operativa", userId);
  const ITEM_KEY = itemKeyProceso(producto.id);

  const [pasos, setPasos] = useState<PasoProceso[]>([]);
  const [paso, setPaso] = useState<PasoProceso>(pasoVacio(1));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading) setPasos(parsePasos(docs[ITEM_KEY] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = pasos.some((p) => p.id === paso.id);
  const pasosOrdenados = [...pasos].sort((a, b) => a.orden - b.orden);
  const tiempoTotal = tiempoTotalProceso(pasos);
  const pctVA = pctValorAgregado(pasos);
  const costoTotal = costoTotalProceso(pasos);
  const resumen = resumenPorTipo(pasos);
  const cuelloDeBotella = pasoMasLargo(pasos);

  let acumuladoMin = 0;
  const pasosConAcumulado = pasosOrdenados.map((p) => {
    acumuladoMin += tiempoEnMinutos(p);
    return { paso: p, acumulado: acumuladoMin };
  });

  function toggleExpandido(id: string) {
    setExpandidos((e) => ({ ...e, [id]: !(e[id] !== false) }));
  }

  function expandirTodos() {
    const todos: Record<string, boolean> = {};
    pasosOrdenados.forEach((p) => (todos[p.id] = true));
    setExpandidos(todos);
  }

  function colapsarTodos() {
    const ninguno: Record<string, boolean> = {};
    pasosOrdenados.forEach((p) => (ninguno[p.id] = false));
    setExpandidos(ninguno);
  }

  function campo<K extends keyof PasoProceso>(key: K, value: PasoProceso[K]) {
    setPaso((p) => ({ ...p, [key]: value }));
  }

  function agregarRecurso(clave: ClaveRecurso) {
    setPaso((p) => ({ ...p, [clave]: [...p[clave], recursoVacio()] }));
  }

  function quitarRecurso(clave: ClaveRecurso, id: string) {
    setPaso((p) => ({ ...p, [clave]: p[clave].filter((r) => r.id !== id) }));
  }

  function campoRecurso(clave: ClaveRecurso, id: string, key: keyof RecursoPaso, value: string | number) {
    setPaso((p) => ({ ...p, [clave]: p[clave].map((r) => (r.id === id ? { ...r, [key]: value } : r)) }));
  }

  function limpiarPaso() {
    setPaso(pasoVacio(pasos.length + 1));
    setError(null);
  }

  function editarPaso(p: PasoProceso) {
    setPaso({
      ...p,
      materiasPrimas: p.materiasPrimas.map((r) => ({ ...r })),
      maquinarias: p.maquinarias.map((r) => ({ ...r })),
      materiales: p.materiales.map((r) => ({ ...r })),
      insumos: p.insumos.map((r) => ({ ...r })),
    });
    setError(null);
  }

  async function guardarPaso() {
    if (!paso.nombre.trim()) {
      setError("Ingresá el nombre del paso.");
      return;
    }
    setError(null);
    setSaving(true);
    const actualizados = [...pasos.filter((p) => p.id !== paso.id), paso].sort((a, b) => a.orden - b.orden);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setPasos(actualizados);
    setPaso(pasoVacio(actualizados.length + 1));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminarPaso(id: string) {
    setSaving(true);
    const restantes = pasos
      .filter((p) => p.id !== id)
      .sort((a, b) => a.orden - b.orden)
      .map((p, i) => ({ ...p, orden: i + 1 }));
    await save(ITEM_KEY, JSON.stringify(restantes));
    setPasos(restantes);
    if (paso.id === id) limpiarPaso();
    setSaving(false);
  }

  async function moverPaso(id: string, direccion: "arriba" | "abajo") {
    const reordenados = reordenar(pasos, id, direccion);
    if (reordenados === pasos) return;
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(reordenados));
    setPasos(reordenados);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🔢</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{pasos.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pasos del proceso</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">⏱️</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{formatoTiempo(tiempoTotal)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Tiempo total del proceso</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">💎</p>
          <p className="text-lg font-bold" style={{ color: pctVA === null ? "#9CA3AF" : pctVA >= 70 ? "#22C55E" : pctVA >= 40 ? "#F5A623" : "#EF4444" }}>
            {pctVA !== null ? `${pctVA}%` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Tiempo de valor agregado</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">💰</p>
          <p className="text-lg font-bold text-[#1A1A1A] truncate">{costoTotal > 0 ? formatoMonto(costoTotal) : "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">Costo estimado de producción</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🚧</p>
          <p className="text-sm font-bold text-[#1A1A1A] truncate">{cuelloDeBotella ? cuelloDeBotella.nombre : "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Cuello de botella {cuelloDeBotella ? `· ${formatoTiempo(tiempoEnMinutos(cuelloDeBotella))}` : ""}
          </p>
        </div>
      </div>

      {/* Diagrama visual del proceso */}
      {pasosOrdenados.length > 0 && (
        <Seccion icono="🗺️" titulo="Diagrama del Proceso">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-1 min-w-max">
              {pasosOrdenados.map((p, i) => (
                <div key={p.id} className="flex items-center gap-1">
                  <button
                    onClick={() => editarPaso(p)}
                    className="flex flex-col items-center gap-1.5 w-20 flex-shrink-0 group"
                    title={p.nombre}
                  >
                    <span
                      className={`w-9 h-9 flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform ${
                        p.tipo === "Operación" ? "rounded-full" : p.tipo === "Almacenaje" ? "" : p.tipo === "Combinado" ? "rotate-45" : "rounded-md"
                      }`}
                      style={{
                        backgroundColor: colorTipoPaso(p.tipo),
                        clipPath: p.tipo === "Almacenaje" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
                      }}
                    >
                      <span className={p.tipo === "Combinado" ? "-rotate-45" : ""}>{p.tipo !== "Almacenaje" ? simboloTipoPaso(p.tipo) : ""}</span>
                    </span>
                    <span className="text-[10px] text-gray-500 text-center leading-tight truncate w-full">{p.nombre}</span>
                    {!p.valorAgregado && <span className="text-[8px] text-red-400 font-bold uppercase">Sin VA</span>}
                  </button>
                  {i < pasosOrdenados.length - 1 && <span className="text-gray-300 flex-shrink-0">→</span>}
                </div>
              ))}
            </div>
          </div>
        </Seccion>
      )}

      {/* Resumen OPC por tipo */}
      {resumen.length > 0 && (
        <Seccion icono="📊" titulo="Resumen del Diagrama de Proceso">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {resumen.map((r) => (
              <div key={r.tipo} className="flex items-center gap-3 bg-[#FAFAFA] rounded-lg p-3 border border-gray-100">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: r.color }}>
                  {r.simbolo}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1A1A1A]">{r.cantidad} {etiquetaTipoPaso(r.tipo, r.cantidad)}</p>
                  <p className="text-xs text-gray-500">{formatoTiempo(r.tiempoMin)}</p>
                </div>
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {/* Formulario de paso */}
      <Seccion icono="🧭" titulo={editando ? `Editando paso ${paso.orden}` : "Nuevo paso del proceso"}>
        <div className="space-y-4">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Paso guardado</div>}

          <div>
            <label className={labelClass}><span className="text-red-500">*</span> Nombre del paso</label>
            <input value={paso.nombre} onChange={(e) => campo("nombre", e.target.value)} placeholder="Ej: Preparación de la mezcla" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div>
              <label className={labelClass}>Tipo</label>
              <select value={paso.tipo} onChange={(e) => campo("tipo", e.target.value)} className={inputClass}>
                {TIPOS_PASO.map((t) => <option key={t.tipo} value={t.tipo}>{t.simbolo} {t.tipo}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tiempo</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={100000}
                  value={paso.tiempo}
                  onChange={(e) => campo("tiempo", Math.max(0, Math.min(100000, Number(e.target.value) || 0)))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={`${inputClass} flex-1 min-w-[64px]`}
                />
                <select value={paso.unidadTiempo} onChange={(e) => campo("unidadTiempo", e.target.value as "min" | "hrs")} className={`${inputClass} w-20 flex-shrink-0`}>
                  <option value="min">min</option>
                  <option value="hrs">hrs</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>¿Agrega valor?</label>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => campo("valorAgregado", true)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border ${paso.valorAgregado ? "bg-green-500 text-white border-transparent" : "border-gray-200 text-gray-500"}`}>
                  Sí
                </button>
                <button type="button" onClick={() => campo("valorAgregado", false)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border ${!paso.valorAgregado ? "bg-red-500 text-white border-transparent" : "border-gray-200 text-gray-500"}`}>
                  No
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Responsable / mano de obra</label>
              <input value={paso.responsable} onChange={(e) => campo("responsable", e.target.value)} placeholder="Ej: Operario de planta" className={inputClass} />
            </div>
          </div>

          <p className="text-[11px] text-gray-400">{TIPOS_PASO.find((t) => t.tipo === paso.tipo)?.descripcion}</p>

          {/* Recursos del paso */}
          <div className="grid sm:grid-cols-2 gap-3">
            {RECURSOS_CONFIG.map(({ clave, titulo, icono, placeholderUnidad }) => (
              <div key={clave} className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-[#1A1A1A]">{icono} {titulo}</p>
                  <button type="button" onClick={() => agregarRecurso(clave)} className="text-[11px] font-semibold text-[#F5A623] hover:text-[#e09410]">
                    + Agregar
                  </button>
                </div>
                {paso[clave].length === 0 ? (
                  <p className="text-[11px] text-gray-400">Sin ítems cargados.</p>
                ) : (
                  <div className="space-y-1.5">
                    {paso[clave].map((r) => (
                      <div key={r.id} className="grid grid-cols-12 gap-1 items-center">
                        <input
                          value={r.nombre}
                          onChange={(e) => campoRecurso(clave, r.id, "nombre", e.target.value)}
                          placeholder="Nombre"
                          className={`${inputClass} col-span-5 py-1`}
                        />
                        <input
                          type="number"
                          min={0}
                          max={1000000}
                          value={r.cantidad}
                          onChange={(e) => campoRecurso(clave, r.id, "cantidad", Math.max(0, Math.min(1000000, Number(e.target.value) || 0)))}
                          onWheel={(e) => e.currentTarget.blur()}
                          placeholder="Cant."
                          className={`${inputClass} col-span-2 py-1 min-w-0`}
                        />
                        <input
                          value={r.unidad}
                          onChange={(e) => campoRecurso(clave, r.id, "unidad", e.target.value)}
                          placeholder={placeholderUnidad}
                          className={`${inputClass} col-span-2 py-1`}
                        />
                        <input
                          type="number"
                          min={0}
                          max={1000000}
                          value={r.costoUnitario || ""}
                          onChange={(e) => campoRecurso(clave, r.id, "costoUnitario", Math.max(0, Math.min(1000000, Number(e.target.value) || 0)))}
                          onWheel={(e) => e.currentTarget.blur()}
                          placeholder="Costo u."
                          className={`${inputClass} col-span-2 py-1 min-w-0`}
                        />
                        <button type="button" onClick={() => quitarRecurso(clave, r.id)} className="col-span-1 text-gray-300 hover:text-red-500 text-sm text-center">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea value={paso.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button onClick={guardarPaso} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
              {saving ? "Guardando..." : editando ? "Guardar cambios" : "Agregar paso"}
            </button>
            <button onClick={limpiarPaso} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
              {editando ? "Nuevo paso en blanco" : "Limpiar"}
            </button>
          </div>
        </div>
      </Seccion>

      {/* Tabla de pasos */}
      <Seccion icono="🗂️" titulo="Pasos del Proceso">
        {pasosOrdenados.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no cargaste ningún paso del proceso.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2.5 font-semibold border-b border-gray-100">#</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Tipo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Paso</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Tiempo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">VA</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Recursos</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Responsable</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody>
                {pasosOrdenados.map((p, i) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                    <td className="p-2.5 font-semibold text-[#1A1A1A]">{p.orden}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorTipoPaso(p.tipo) }}>
                        {simboloTipoPaso(p.tipo)} {p.tipo}
                      </span>
                    </td>
                    <td className="p-2.5 font-medium text-[#1A1A1A] max-w-[180px] truncate">{p.nombre}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{formatoTiempo(tiempoEnMinutos(p))}</td>
                    <td className="p-2.5">{p.valorAgregado ? <span className="text-green-500">✓</span> : <span className="text-red-400">✕</span>}</td>
                    <td className="p-2.5 text-gray-500 whitespace-nowrap">{contarRecursos(p)} ítem{contarRecursos(p) !== 1 ? "s" : ""}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{p.responsable || "—"}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <button onClick={() => moverPaso(p.id, "arriba")} disabled={i === 0} className="text-gray-400 hover:text-[#F5A623] disabled:opacity-20 mr-1">↑</button>
                      <button onClick={() => moverPaso(p.id, "abajo")} disabled={i === pasosOrdenados.length - 1} className="text-gray-400 hover:text-[#F5A623] disabled:opacity-20 mr-2">↓</button>
                      <button onClick={() => editarPaso(p)} className="text-[#F5A623] font-semibold hover:text-[#e09410] mr-2">Editar</button>
                      <button onClick={() => eliminarPaso(p.id)} className="text-gray-300 hover:text-red-500">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      {/* Informe detallado */}
      {pasosOrdenados.length > 0 && (
        <Seccion icono="📄" titulo="Informe Detallado del Proceso">
          <div className="flex items-center justify-end gap-3 mb-3 -mt-1">
            <button type="button" onClick={expandirTodos} className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410]">
              Expandir todo
            </button>
            <button type="button" onClick={colapsarTodos} className="text-xs font-semibold text-gray-400 hover:text-gray-600">
              Colapsar todo
            </button>
          </div>
          <div className="space-y-3">
            {pasosConAcumulado.map(({ paso: p, acumulado }) => {
              const abierto = expandidos[p.id] !== false;
              const costo = costoPaso(p);
              return (
                <div key={p.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleExpandido(p.id)}
                    className="w-full flex items-center gap-3 p-3 bg-[#FAFAFA] hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {p.orden}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white flex-shrink-0 whitespace-nowrap"
                      style={{ backgroundColor: colorTipoPaso(p.tipo) }}
                    >
                      {simboloTipoPaso(p.tipo)} {p.tipo}
                    </span>
                    <span className="flex-1 min-w-0 font-semibold text-sm text-[#1A1A1A] truncate">{p.nombre}</span>
                    {!p.valorAgregado && (
                      <span className="text-[10px] font-bold text-red-400 uppercase flex-shrink-0 hidden sm:inline">Sin VA</span>
                    )}
                    <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">{formatoTiempo(tiempoEnMinutos(p))}</span>
                    <span className="text-gray-400 flex-shrink-0">{abierto ? "▲" : "▼"}</span>
                  </button>
                  {abierto && (
                    <div className="p-4 space-y-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400">Responsable</p>
                          <p className="font-semibold text-[#1A1A1A]">{p.responsable || "—"}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">¿Agrega valor?</p>
                          <p className={`font-semibold ${p.valorAgregado ? "text-green-600" : "text-red-500"}`}>{p.valorAgregado ? "Sí" : "No"}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Tiempo acumulado</p>
                          <p className="font-semibold text-[#1A1A1A]">{formatoTiempo(acumulado)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Costo del paso</p>
                          <p className="font-semibold text-[#1A1A1A]">{costo > 0 ? formatoMonto(costo) : "—"}</p>
                        </div>
                      </div>

                      {contarRecursos(p) > 0 ? (
                        <div className="space-y-3">
                          <TablaRecursos titulo="Materias primas" icono="🌾" recursos={p.materiasPrimas} />
                          <TablaRecursos titulo="Maquinaria" icono="⚙️" recursos={p.maquinarias} />
                          <TablaRecursos titulo="Materiales" icono="🧱" recursos={p.materiales} />
                          <TablaRecursos titulo="Insumos" icono="🧪" recursos={p.insumos} />
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Sin recursos cargados para este paso.</p>
                      )}

                      {p.observaciones && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Observaciones</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{p.observaciones}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Seccion>
      )}
    </div>
  );
}
