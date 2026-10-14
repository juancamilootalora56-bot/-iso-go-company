"use client";

import { useEffect, useRef, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { ProyectoDiseno } from "@/lib/disenoDesarrollo";
import { parseEntradasDiseno, entradaDisenoVacia, TIPOS_ENTRADA_DISENO, type EntradaDiseno } from "@/lib/disenoDesarrollo";

const MAX_ARCHIVO_BYTES = 1_500_000; // ~1.5MB

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function itemKeyEntradas(proyectoId: string) {
  return `entradas_diseno_${proyectoId}`;
}

export function itemKeyEntradasDiseno(proyectoId: string) {
  return itemKeyEntradas(proyectoId);
}

export default function EntradasDisenoForm({ userId, proyecto }: { userId: string | null; proyecto: ProyectoDiseno }) {
  const { docs, loading, save } = useGestionDocumentos("diseno_desarrollo", userId);
  const ITEM_KEY = itemKeyEntradas(proyecto.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [entradas, setEntradas] = useState<EntradaDiseno[]>([]);
  const [entrada, setEntrada] = useState<EntradaDiseno>(entradaDisenoVacia());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) setEntradas(parseEntradasDiseno(docs[ITEM_KEY] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = entradas.some((e) => e.id === entrada.id);
  const resueltas = entradas.filter((e) => e.resuelta).length;
  const obligatoriasPendientes = entradas.filter((e) => e.obligatorio && !e.resuelta).length;

  function campo<K extends keyof EntradaDiseno>(key: K, value: EntradaDiseno[K]) {
    setEntrada((e) => ({ ...e, [key]: value }));
  }

  function limpiar() {
    setEntrada(entradaDisenoVacia());
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function editar(e: EntradaDiseno) {
    setEntrada({ ...e });
    setError(null);
  }

  function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ARCHIVO_BYTES) {
      setError("El archivo es muy pesado. Usá uno de menos de 1.5MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setEntrada((en) => ({ ...en, archivo: reader.result as string, archivoNombre: file.name }));
    reader.readAsDataURL(file);
  }

  async function guardar() {
    if (!entrada.descripcion.trim()) {
      setError("Describí la entrada de diseño.");
      return;
    }
    setError(null);
    setSaving(true);
    const actualizadas = [...entradas.filter((e) => e.id !== entrada.id), entrada];
    await save(ITEM_KEY, JSON.stringify(actualizadas));
    setEntradas(actualizadas);
    setEntrada(entradaDisenoVacia());
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    setSaving(true);
    const restantes = entradas.filter((e) => e.id !== id);
    await save(ITEM_KEY, JSON.stringify(restantes));
    setEntradas(restantes);
    if (entrada.id === id) limpiar();
    setSaving(false);
  }

  async function toggleResuelta(e: EntradaDiseno) {
    setSaving(true);
    const actualizadas = entradas.map((x) => (x.id === e.id ? { ...x, resuelta: !x.resuelta } : x));
    await save(ITEM_KEY, JSON.stringify(actualizadas));
    setEntradas(actualizadas);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">📥</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{entradas.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Entradas identificadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">✅</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{resueltas}/{entradas.length || 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Resueltas / abordadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">⚠️</p>
          <p className="text-lg font-bold" style={{ color: obligatoriasPendientes > 0 ? "#EF4444" : "#1A1A1A" }}>{obligatoriasPendientes}</p>
          <p className="text-xs text-gray-500 mt-0.5">Obligatorias pendientes</p>
        </div>
      </div>

      <Seccion icono="📥" titulo={editando ? "Editando entrada" : "Nueva entrada de diseño"}>
        <div className="space-y-3">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Entrada guardada</div>}

          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Tipo de entrada</label>
              <select value={entrada.tipo} onChange={(e) => campo("tipo", e.target.value)} className={inputClass}>
                {TIPOS_ENTRADA_DISENO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fuente</label>
              <input value={entrada.fuente} onChange={(e) => campo("fuente", e.target.value)} placeholder="Ej: Cliente, norma ISO, estudio previo" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}><span className="text-red-500">*</span> Descripción del requisito</label>
            <textarea value={entrada.descripcion} onChange={(e) => campo("descripcion", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" checked={entrada.obligatorio} onChange={(e) => campo("obligatorio", e.target.checked)} className="accent-[#F5A623]" />
              Es obligatorio
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" checked={entrada.resuelta} onChange={(e) => campo("resuelta", e.target.checked)} className="accent-[#F5A623]" />
              Ya está resuelta / abordada en el diseño
            </label>
          </div>

          <div>
            <label className={labelClass}>Evidencia / registro de origen (acta, email, norma, estudio)</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#F5A623]/50">
                📎 {entrada.archivoNombre ? "Cambiar archivo" : "Adjuntar archivo"}
              </button>
              {entrada.archivoNombre && <p className="text-xs text-gray-500 truncate">{entrada.archivoNombre}</p>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleArchivo} className="hidden" />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button onClick={guardar} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
              {saving ? "Guardando..." : editando ? "Guardar cambios" : "Agregar entrada"}
            </button>
            <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
              {editando ? "Nueva entrada en blanco" : "Limpiar"}
            </button>
          </div>
        </div>
      </Seccion>

      <Seccion icono="🗂️" titulo="Entradas Registradas">
        {entradas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no cargaste ninguna entrada de diseño.</p>
        ) : (
          <div className="space-y-2">
            {entradas.map((e) => (
              <div key={e.id} className="flex items-start gap-3 bg-[#FAFAFA] rounded-xl border border-gray-100 p-3">
                <button
                  type="button"
                  onClick={() => toggleResuelta(e)}
                  className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                    e.resuelta ? "bg-[#22C55E] border-[#22C55E] text-white" : "border-gray-300 text-transparent hover:border-[#F5A623]"
                  }`}
                >
                  ✓
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{e.tipo}</span>
                    {e.obligatorio && (
                      <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">Obligatorio</span>
                    )}
                  </div>
                  <p className="text-sm text-[#1A1A1A] mt-0.5">{e.descripcion}</p>
                  <div className="flex items-center gap-3 flex-wrap mt-0.5">
                    {e.fuente && <p className="text-xs text-gray-400">Fuente: {e.fuente}</p>}
                    {e.archivoNombre && (
                      <a href={e.archivo ?? "#"} download={e.archivoNombre} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">
                        📎 {e.archivoNombre}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => editar(e)} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">Editar</button>
                  <button onClick={() => eliminar(e.id)} className="text-xs text-gray-300 hover:text-red-500">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Seccion>
    </div>
  );
}
