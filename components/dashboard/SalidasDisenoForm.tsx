"use client";

import { useEffect, useRef, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { ProyectoDiseno } from "@/lib/disenoDesarrollo";
import { parseEntradasDiseno, parseSalidasDiseno, salidaDisenoVacia, TIPOS_SALIDA_DISENO, type SalidaDiseno } from "@/lib/disenoDesarrollo";
import { itemKeyEntradasDiseno } from "@/components/dashboard/EntradasDisenoForm";

const MAX_ARCHIVO_BYTES = 1_500_000; // ~1.5MB

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function itemKeySalidas(proyectoId: string) {
  return `salidas_diseno_${proyectoId}`;
}

export default function SalidasDisenoForm({ userId, proyecto }: { userId: string | null; proyecto: ProyectoDiseno }) {
  const { docs, loading, save } = useGestionDocumentos("diseno_desarrollo", userId);
  const ITEM_KEY = itemKeySalidas(proyecto.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [salidas, setSalidas] = useState<SalidaDiseno[]>([]);
  const [salida, setSalida] = useState<SalidaDiseno>(salidaDisenoVacia());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) setSalidas(parseSalidasDiseno(docs[ITEM_KEY] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const entradas = parseEntradasDiseno(docs[itemKeyEntradasDiseno(proyecto.id)] ?? "");
  const editando = salidas.some((s) => s.id === salida.id);
  const aprobadas = salidas.filter((s) => s.aprobada).length;
  const sinEntradaRelacionada = salidas.filter((s) => !s.entradaRelacionadaId).length;

  function campo<K extends keyof SalidaDiseno>(key: K, value: SalidaDiseno[K]) {
    setSalida((s) => ({ ...s, [key]: value }));
  }

  function limpiar() {
    setSalida(salidaDisenoVacia());
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function editar(s: SalidaDiseno) {
    setSalida({ ...s });
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
    reader.onload = () => setSalida((s) => ({ ...s, archivo: reader.result as string, archivoNombre: file.name }));
    reader.readAsDataURL(file);
  }

  async function guardar() {
    if (!salida.descripcion.trim()) {
      setError("Describí la salida de diseño.");
      return;
    }
    setError(null);
    setSaving(true);
    const actualizadas = [...salidas.filter((s) => s.id !== salida.id), salida];
    await save(ITEM_KEY, JSON.stringify(actualizadas));
    setSalidas(actualizadas);
    setSalida(salidaDisenoVacia());
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    setSaving(true);
    const restantes = salidas.filter((s) => s.id !== id);
    await save(ITEM_KEY, JSON.stringify(restantes));
    setSalidas(restantes);
    if (salida.id === id) limpiar();
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">📤</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{salidas.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Salidas registradas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">✅</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{aprobadas}/{salidas.length || 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Aprobadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🔗</p>
          <p className="text-lg font-bold" style={{ color: sinEntradaRelacionada > 0 ? "#F5A623" : "#1A1A1A" }}>{sinEntradaRelacionada}</p>
          <p className="text-xs text-gray-500 mt-0.5">Sin entrada relacionada</p>
        </div>
      </div>

      <Seccion icono="📤" titulo={editando ? "Editando salida" : "Nueva salida de diseño"}>
        <div className="space-y-3">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Salida guardada</div>}

          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Tipo de salida</label>
              <select value={salida.tipo} onChange={(e) => campo("tipo", e.target.value)} className={inputClass}>
                {TIPOS_SALIDA_DISENO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Entrada que satisface</label>
              <select value={salida.entradaRelacionadaId} onChange={(e) => campo("entradaRelacionadaId", e.target.value)} className={inputClass}>
                <option value="">Sin relacionar</option>
                {entradas.map((en) => (
                  <option key={en.id} value={en.id}>{en.descripcion.slice(0, 60)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}><span className="text-red-500">*</span> Descripción</label>
            <textarea value={salida.descripcion} onChange={(e) => campo("descripcion", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5 items-end">
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={salida.fecha} onChange={(e) => campo("fecha", e.target.value)} className={inputClass} />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-600 pb-1.5">
              <input type="checkbox" checked={salida.aprobada} onChange={(e) => campo("aprobada", e.target.checked)} className="accent-[#F5A623]" />
              Aprobada para liberar
            </label>
          </div>

          <div>
            <label className={labelClass}>Archivo adjunto (plano, ficha técnica, especificación)</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#F5A623]/50">
                📎 {salida.archivoNombre ? "Cambiar archivo" : "Adjuntar archivo"}
              </button>
              {salida.archivoNombre && <p className="text-xs text-gray-500 truncate">{salida.archivoNombre}</p>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleArchivo} className="hidden" />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button onClick={guardar} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
              {saving ? "Guardando..." : editando ? "Guardar cambios" : "Agregar salida"}
            </button>
            <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
              {editando ? "Nueva salida en blanco" : "Limpiar"}
            </button>
          </div>
        </div>
      </Seccion>

      <Seccion icono="🗂️" titulo="Salidas Registradas">
        {salidas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no cargaste ninguna salida de diseño.</p>
        ) : (
          <div className="space-y-2">
            {salidas.map((s) => {
              const entradaRel = entradas.find((en) => en.id === s.entradaRelacionadaId);
              return (
                <div key={s.id} className="flex items-start gap-3 bg-[#FAFAFA] rounded-xl border border-gray-100 p-3">
                  <span
                    className="mt-0.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white flex-shrink-0 whitespace-nowrap"
                    style={{ backgroundColor: s.aprobada ? "#22C55E" : "#9CA3AF" }}
                  >
                    {s.aprobada ? "Aprobada" : "Pendiente"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{s.tipo}</p>
                    <p className="text-sm text-[#1A1A1A] mt-0.5">{s.descripcion}</p>
                    <div className="flex items-center gap-3 flex-wrap mt-0.5">
                      {entradaRel && <p className="text-xs text-gray-400">🔗 {entradaRel.descripcion.slice(0, 50)}</p>}
                      {s.archivoNombre && (
                        <a href={s.archivo ?? "#"} download={s.archivoNombre} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">
                          📎 {s.archivoNombre}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => editar(s)} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">Editar</button>
                    <button onClick={() => eliminar(s.id)} className="text-xs text-gray-300 hover:text-red-500">Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Seccion>
    </div>
  );
}
