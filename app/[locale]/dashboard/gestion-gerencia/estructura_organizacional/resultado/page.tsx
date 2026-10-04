"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parseNodos,
  construirArbol,
  nodoVacio,
  parseConexiones,
  type NodoOrganigrama,
  type ConexionExtra,
} from "@/lib/estructuraOrganizacional";

const ITEM_KEY = "estructura_organizacional";
const ITEM_KEY_CONEXIONES = "estructura_organizacional_conexiones";
const MAX_FOTO_BYTES = 800_000; // ~800KB

const COLOR_LINEA_NORMAL = "#C9C9C9";
const COLOR_LINEA_EXTERNA = "#F5A623";

type FormularioState = { modo: "agregar" | "editar"; draft: NodoOrganigrama } | null;

type RectoRelativo = { left: number; top: number; width: number; height: number };

// Arma un camino en ángulo recto entre dos tarjetas, saliendo/entrando por sus bordes
// (nunca por el centro) para no pasar la línea sobre las fotos o el texto.
function rutaConector(a: RectoRelativo, b: RectoRelativo): string {
  const aCx = a.left + a.width / 2;
  const aCy = a.top + a.height / 2;
  const bCx = b.left + b.width / 2;
  const bCy = b.top + b.height / 2;
  const dx = bCx - aCx;
  const dy = bCy - aCy;

  // Si la separación vertical predomina, conectamos por arriba/abajo de las tarjetas;
  // si predomina la horizontal, conectamos por los costados.
  if (Math.abs(dy) >= Math.abs(dx) * 0.6) {
    const x1 = aCx;
    const y1 = dy >= 0 ? a.top + a.height : a.top;
    const x2 = bCx;
    const y2 = dy >= 0 ? b.top : b.top + b.height;
    const midY = y1 + (y2 - y1) / 2;
    return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  }

  const x1 = dx >= 0 ? a.left + a.width : a.left;
  const y1 = aCy;
  const x2 = dx >= 0 ? b.left : b.left + b.width;
  const y2 = bCy;
  const midX = x1 + (x2 - x1) / 2;
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
}

function TarjetaNodo({
  nodo,
  onClick,
}: {
  nodo: NodoOrganigrama;
  onClick: () => void;
}) {
  return (
    <button
      id={`nodo-${nodo.id}`}
      onClick={onClick}
      className="flex flex-col items-center flex-shrink-0 group relative"
    >
      <div
        className={`w-16 h-16 rounded-full border-2 shadow-md bg-gray-100 overflow-hidden flex items-center justify-center z-10 group-hover:ring-2 group-hover:ring-[#F5A623] transition-all ${
          nodo.esExterno ? "border-[#F5A623]" : "border-white"
        }`}
      >
        {nodo.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={nodo.foto} alt={nodo.nombre} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>
      <div className="bg-[#E7DDD0] rounded-lg px-3 py-1.5 -mt-2 text-center min-w-[120px] max-w-[160px] shadow-sm group-hover:bg-[#F5A623]/30 transition-colors">
        <p className="text-[11px] font-bold text-[#1A1A1A] leading-tight">{nodo.nombre || "Sin nombre"}</p>
        <p className="text-[9px] uppercase tracking-wide text-gray-600 leading-tight mt-0.5">{nodo.cargo || "Sin cargo"}</p>
        {nodo.esExterno && (
          <p className="text-[8px] font-bold text-[#F5A623] uppercase tracking-wide mt-0.5">Externo</p>
        )}
      </div>
    </button>
  );
}

function BotonAgregar({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center flex-shrink-0 group" title={label}>
      <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-[#F5A623] group-hover:text-[#F5A623] transition-colors">
        <span className="text-lg leading-none">+</span>
      </div>
    </button>
  );
}

function RamaArbol({
  nodo,
  hijosDe,
  onEditar,
  onAgregarHijo,
}: {
  nodo: NodoOrganigrama;
  hijosDe: Map<string, NodoOrganigrama[]>;
  onEditar: (n: NodoOrganigrama) => void;
  onAgregarHijo: (parentId: string) => void;
}) {
  const hijos = hijosDe.get(nodo.id) ?? [];

  return (
    <div className="flex flex-col items-center">
      <TarjetaNodo nodo={nodo} onClick={() => onEditar(nodo)} />

      <div className="w-px h-4 bg-gray-300" />
      <BotonAgregar onClick={() => onAgregarHijo(nodo.id)} label="Agregar subordinado" />

      {hijos.length > 0 && (
        <>
          <div className="w-px h-5 bg-gray-300" />
          <div className="flex items-start">
            {hijos.map((hijo, idx) => {
              const colorLinea = hijo.esExterno ? COLOR_LINEA_EXTERNA : COLOR_LINEA_NORMAL;
              return (
                <div key={hijo.id} className="flex flex-col items-center px-4 relative">
                  {hijos.length > 1 && (
                    <div
                      className="absolute top-0 h-px"
                      style={{
                        left: idx === 0 ? "50%" : 0,
                        right: idx === hijos.length - 1 ? "50%" : 0,
                        backgroundColor: colorLinea,
                      }}
                    />
                  )}
                  <div
                    className="w-px h-5"
                    style={{
                      backgroundColor: colorLinea,
                      ...(hijo.esExterno ? { backgroundImage: `linear-gradient(${colorLinea} 60%, transparent 40%)`, backgroundSize: "2px 6px" } : {}),
                    }}
                  />
                  <RamaArbol nodo={hijo} hijosDe={hijosDe} onEditar={onEditar} onAgregarHijo={onAgregarHijo} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function EstructuraOrganizacionalResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [nodos, setNodos] = useState<NodoOrganigrama[]>([]);
  const [conexiones, setConexiones] = useState<ConexionExtra[]>([]);
  const [form, setForm] = useState<FormularioState>(null);
  const [nuevaConexionDestino, setNuevaConexionDestino] = useState("");
  const [nuevaConexionTipo, setNuevaConexionTipo] = useState<"interna" | "externa">("externa");
  const [conexionCreada, setConexionCreada] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lineasExtra, setLineasExtra] = useState<
    { id: string; d: string; color: string; dash: boolean }[]
  >([]);

  useEffect(() => {
    if (!loading) {
      setNodos(parseNodos(docs[ITEM_KEY] ?? ""));
      setConexiones(parseConexiones(docs[ITEM_KEY_CONEXIONES] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Recalcula las líneas de conexiones manuales según la posición real de las tarjetas.
  useLayoutEffect(() => {
    function recalcular() {
      const canvas = canvasRef.current;
      if (!canvas || conexiones.length === 0) {
        setLineasExtra([]);
        return;
      }
      const canvasRect = canvas.getBoundingClientRect();
      const relRect = (r: DOMRect) => ({
        left: r.left - canvasRect.left + canvas.scrollLeft,
        top: r.top - canvasRect.top + canvas.scrollTop,
        width: r.width,
        height: r.height,
      });

      const nuevas = conexiones
        .map((c) => {
          const elOrigen = document.getElementById(`nodo-${c.origenId}`);
          const elDestino = document.getElementById(`nodo-${c.destinoId}`);
          if (!elOrigen || !elDestino) return null;
          const r1 = relRect(elOrigen.getBoundingClientRect());
          const r2 = relRect(elDestino.getBoundingClientRect());
          return {
            id: c.id,
            d: rutaConector(r1, r2),
            color: c.tipo === "externa" ? COLOR_LINEA_EXTERNA : "#3B82F6",
            dash: c.tipo === "externa",
          };
        })
        .filter((l): l is NonNullable<typeof l> => l !== null);
      setLineasExtra(nuevas);
    }
    recalcular();
    window.addEventListener("resize", recalcular);
    return () => window.removeEventListener("resize", recalcular);
  }, [conexiones, nodos]);

  function abrirAgregar(parentId: string | null) {
    setError(null);
    const hermanos = nodos.filter((n) => n.parentId === parentId);
    const ordenMax = hermanos.length > 0 ? Math.max(...hermanos.map((n) => n.orden)) + 1 : 0;
    setForm({ modo: "agregar", draft: nodoVacio(parentId, ordenMax) });
  }

  function abrirEditar(n: NodoOrganigrama) {
    setError(null);
    setForm({ modo: "editar", draft: { ...n } });
    setNuevaConexionDestino("");
    setNuevaConexionTipo("externa");
    setConexionCreada(false);
  }

  function cerrarForm() {
    setForm(null);
    setError(null);
    setConexionCreada(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    if (file.size > MAX_FOTO_BYTES) {
      setError("La foto es muy pesada. Usá una imagen de menos de 800KB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => (f ? { ...f, draft: { ...f.draft, foto: reader.result as string } } : f));
    };
    reader.readAsDataURL(file);
  }

  async function guardarNodos(actualizados: NodoOrganigrama[]) {
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setNodos(actualizados);
    setSaving(false);
  }

  async function guardarConexiones(actualizadas: ConexionExtra[]) {
    setSaving(true);
    await save(ITEM_KEY_CONEXIONES, JSON.stringify(actualizadas));
    setConexiones(actualizadas);
    setSaving(false);
  }

  async function handleGuardarForm() {
    if (!form) return;
    if (!form.draft.nombre.trim() || !form.draft.cargo.trim()) {
      setError("Nombre y Cargo son obligatorios.");
      return;
    }
    const actualizados = [...nodos.filter((n) => n.id !== form.draft.id), form.draft];
    await guardarNodos(actualizados);
    cerrarForm();
  }

  async function handleEliminar() {
    if (!form) return;
    const id = form.draft.id;
    const actualizados = nodos
      .filter((n) => n.id !== id)
      .map((n) => (n.parentId === id ? { ...n, parentId: null } : n));
    await guardarNodos(actualizados);
    await guardarConexiones(conexiones.filter((c) => c.origenId !== id && c.destinoId !== id));
    cerrarForm();
  }

  function mover(direccion: "arriba" | "abajo") {
    if (!form) return;
    const id = form.draft.id;
    const hermanos = nodos.filter((n) => n.parentId === form.draft.parentId).sort((a, b) => a.orden - b.orden);
    const idx = hermanos.findIndex((n) => n.id === id);
    const idxVecino = direccion === "arriba" ? idx - 1 : idx + 1;
    if (idx === -1 || idxVecino < 0 || idxVecino >= hermanos.length) return;
    const actual = hermanos[idx];
    const vecino = hermanos[idxVecino];
    const ordenActual = actual.orden;
    const actualizados = nodos.map((n) => {
      if (n.id === actual.id) return { ...n, orden: vecino.orden };
      if (n.id === vecino.id) return { ...n, orden: ordenActual };
      return n;
    });
    guardarNodos(actualizados);
  }

  function agregarConexion() {
    if (!form || !nuevaConexionDestino) return;
    const nueva: ConexionExtra = {
      id: crypto.randomUUID(),
      origenId: form.draft.id,
      destinoId: nuevaConexionDestino,
      tipo: nuevaConexionTipo,
    };
    guardarConexiones([...conexiones, nueva]);
    setNuevaConexionDestino("");
    setConexionCreada(true);
  }

  function eliminarConexion(id: string) {
    guardarConexiones(conexiones.filter((c) => c.id !== id));
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const { raices, hijosDe } = construirArbol(nodos);
  const inputClass =
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623]";

  const conexionesDeEsteNodo = form
    ? conexiones.filter((c) => c.origenId === form.draft.id || c.destinoId === form.draft.id)
    : [];
  const nodosDisponiblesParaConexion = form
    ? nodos.filter(
        (n) =>
          n.id !== form.draft.id &&
          !conexionesDeEsteNodo.some(
            (c) => (c.origenId === form.draft.id && c.destinoId === n.id) || (c.destinoId === form.draft.id && c.origenId === n.id)
          )
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Organigrama</h1>
        <p className="text-gray-500 text-sm mt-1">
          Hacé clic en el <span className="font-semibold text-gray-700">+</span> para agregar un cargo, o en
          una tarjeta para editarla, moverla o conectarla con otro cargo.
        </p>
        <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5" style={{ backgroundColor: COLOR_LINEA_NORMAL }} /> Línea jerárquica
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5" style={{ backgroundColor: "#3B82F6" }} /> Conexión interna
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: COLOR_LINEA_EXTERNA }} /> Personal / conexión externa
          </span>
        </div>
      </div>

      <div ref={canvasRef} className="relative bg-white rounded-xl border border-gray-100 p-8 overflow-x-auto">
        {raices.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <p className="text-gray-500 text-sm mb-4">Todavía no cargaste ningún cargo.</p>
            <button
              onClick={() => abrirAgregar(null)}
              className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
            >
              + Agregar el primer cargo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-16 justify-center w-fit min-w-full">
              {raices.map((raiz) => (
                <RamaArbol key={raiz.id} nodo={raiz} hijosDe={hijosDe} onEditar={abrirEditar} onAgregarHijo={abrirAgregar} />
              ))}
            </div>
            <button
              onClick={() => abrirAgregar(null)}
              className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410] mt-2"
            >
              + Agregar otro cargo de nivel superior
            </button>
          </div>
        )}

        {lineasExtra.length > 0 && (
          <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            {lineasExtra.map((l) => (
              <path
                key={l.id}
                d={l.d}
                fill="none"
                stroke={l.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={l.dash ? "5,4" : undefined}
              />
            ))}
          </svg>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={cerrarForm}>
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              {form.modo === "agregar" ? "Agregar cargo" : "Editar cargo"}
            </h2>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden"
              >
                {form.draft.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.draft.foto} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
                <span className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200 text-xs">✎</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <span className="text-red-500">*</span> Nombre
              </label>
              <input
                value={form.draft.nombre}
                onChange={(e) => setForm((f) => f && { ...f, draft: { ...f.draft, nombre: e.target.value } })}
                placeholder="Nombre y apellido..."
                className={inputClass}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <span className="text-red-500">*</span> Cargo
              </label>
              <input
                value={form.draft.cargo}
                onChange={(e) => setForm((f) => f && { ...f, draft: { ...f.draft, cargo: e.target.value } })}
                placeholder="Ej: Gerente Comercial"
                className={inputClass}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.draft.esExterno}
                onChange={(e) => setForm((f) => f && { ...f, draft: { ...f.draft, esExterno: e.target.checked } })}
                className="w-4 h-4 accent-[#F5A623]"
              />
              <span className="text-xs text-gray-600">Es personal externo (contratista, consultor, etc.)</span>
            </label>

            {form.modo === "editar" && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => mover("arriba")}
                  className="flex-1 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50"
                >
                  ↑ Subir
                </button>
                <button
                  onClick={() => mover("abajo")}
                  className="flex-1 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50"
                >
                  ↓ Bajar
                </button>
              </div>
            )}

            {form.modo === "editar" && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Conexiones adicionales</p>
                {conexionesDeEsteNodo.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {conexionesDeEsteNodo.map((c) => {
                      const otroId = c.origenId === form.draft.id ? c.destinoId : c.origenId;
                      const otro = nodos.find((n) => n.id === otroId);
                      return (
                        <div key={c.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2.5 py-1.5">
                          <span className="text-gray-600 truncate">
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-1.5"
                              style={{ backgroundColor: c.tipo === "externa" ? COLOR_LINEA_EXTERNA : "#3B82F6" }}
                            />
                            {otro?.nombre ?? "—"} ({c.tipo})
                          </span>
                          <button onClick={() => eliminarConexion(c.id)} className="text-gray-400 hover:text-red-500 ml-2">
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {nodosDisponiblesParaConexion.length > 0 && (
                  <div className="flex gap-2">
                    <select
                      value={nuevaConexionDestino}
                      onChange={(e) => setNuevaConexionDestino(e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
                    >
                      <option value="">Conectar con...</option>
                      {nodosDisponiblesParaConexion.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.nombre} — {n.cargo}
                        </option>
                      ))}
                    </select>
                    <select
                      value={nuevaConexionTipo}
                      onChange={(e) => setNuevaConexionTipo(e.target.value as "interna" | "externa")}
                      className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
                    >
                      <option value="interna">Interna</option>
                      <option value="externa">Externa</option>
                    </select>
                    <button
                      onClick={agregarConexion}
                      disabled={!nuevaConexionDestino}
                      className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410] disabled:opacity-40 px-2"
                    >
                      + Unir
                    </button>
                  </div>
                )}
                {conexionCreada && (
                  <p className="text-xs font-semibold text-green-600 mt-2">
                    ✓ Conexión creada — cerrá este cuadro para verla en el organigrama
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-3">
                <button
                  onClick={handleGuardarForm}
                  disabled={saving}
                  className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button onClick={cerrarForm} className="text-sm text-gray-400 hover:text-gray-600">
                  Cancelar
                </button>
              </div>
              {form.modo === "editar" && (
                <button onClick={handleEliminar} className="text-xs text-red-400 hover:text-red-600">
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
