"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  manualProyectoVacio,
  parseManualesProyecto,
  itemVacio,
  type ManualProyecto,
  type ItemLista,
} from "@/lib/manualesProyecto";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function ListaEditableSimple({
  items,
  onChange,
  placeholder,
}: {
  items: ItemLista[];
  onChange: (items: ItemLista[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <input
            value={item.texto}
            onChange={(e) => onChange(items.map((i) => (i.id === item.id ? { ...i, texto: e.target.value } : i)))}
            placeholder={placeholder}
            className={inputClass}
          />
          <button type="button" onClick={() => onChange(items.filter((i) => i.id !== item.id))} className="text-gray-300 hover:text-red-500 text-xs flex-shrink-0">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, itemVacio()])} className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410]">
        + Agregar
      </button>
    </div>
  );
}

function TarjetaManual({
  manual,
  onChange,
  onDelete,
}: {
  manual: ManualProyecto;
  onChange: (m: ManualProyecto) => void;
  onDelete: () => void;
}) {
  const [abierto, setAbierto] = useState(!manual.nombre);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button onClick={() => setAbierto(!abierto)} className="w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-left">
        <div className="min-w-0">
          <p className="text-white text-sm font-bold truncate">{manual.nombre || "Persona sin nombre"}</p>
          <p className="text-gray-400 text-xs truncate">{manual.cargo || "Sin cargo en el proyecto"}</p>
        </div>
        <span className="text-gray-400 text-xs flex-shrink-0">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nombre</label>
              <input value={manual.nombre} onChange={(e) => onChange({ ...manual, nombre: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cargo en el proyecto</label>
              <input value={manual.cargo} onChange={(e) => onChange({ ...manual, cargo: e.target.value })} placeholder="Ej: Líder técnico" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Objetivo del cargo</label>
            <textarea value={manual.objetivoCargo} onChange={(e) => onChange({ ...manual, objetivoCargo: e.target.value })} rows={2} placeholder="Qué resultado debe garantizar esta persona dentro del proyecto." className={`${inputClass} resize-y`} />
          </div>

          <div>
            <label className={labelClass}>Funciones principales</label>
            <ListaEditableSimple items={manual.funcionesPrincipales} onChange={(items) => onChange({ ...manual, funcionesPrincipales: items })} placeholder="Ej: Coordinar las entradas de diseño con el cliente" />
          </div>

          <div>
            <label className={labelClass}>Funciones secundarias</label>
            <ListaEditableSimple items={manual.funcionesSecundarias} onChange={(items) => onChange({ ...manual, funcionesSecundarias: items })} placeholder="Ej: Reemplazar a otro rol del proyecto en su ausencia" />
          </div>

          <div>
            <label className={labelClass}>Requisitos</label>
            <textarea value={manual.requisitos} onChange={(e) => onChange({ ...manual, requisitos: e.target.value })} rows={2} placeholder="Formación, experiencia o competencias necesarias para este rol." className={`${inputClass} resize-y`} />
          </div>

          <div className="flex justify-end pt-1 border-t border-gray-100">
            <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700">
              Eliminar responsabilidad
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Un manual de funciones por cada persona del proyecto — independiente del
// Organigrama (se agregan sueltos, el dueño decide cuántos y a quién).
export default function ManualesProyectoTab({ userId, planId }: { userId: string | null; planId: string }) {
  const itemKey = `manuales_proyecto_${planId}`;
  const { docs, loading, save } = useGestionDocumentos("diseno_desarrollo", userId);

  const [manuales, setManuales] = useState<ManualProyecto[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) {
      setManuales(parseManualesProyecto(docs[itemKey] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function actualizarManual(m: ManualProyecto) {
    setManuales((actuales) => actuales.map((x) => (x.id === m.id ? m : x)));
  }

  function agregarManual() {
    setManuales((actuales) => [...actuales, manualProyectoVacio()]);
  }

  function eliminarManual(id: string) {
    setManuales((actuales) => actuales.filter((m) => m.id !== id));
  }

  async function guardar() {
    setSaving(true);
    await save(itemKey, JSON.stringify(manuales));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm">
        Una responsabilidad por cada persona del proyecto. Si el proyecto tiene 10 colaboradores, agregá 10 responsabilidades.
      </p>

      {manuales.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-2">Todavía no hay responsabilidades cargadas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {manuales.map((m) => (
            <TarjetaManual key={m.id} manual={m} onChange={actualizarManual} onDelete={() => eliminarManual(m.id)} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <button type="button" onClick={agregarManual} className="text-sm font-semibold text-[#F5A623] hover:text-[#e09410]">
          + Agregar responsabilidad
        </button>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-600 font-semibold">Guardado ✓</span>}
          <button type="button" onClick={guardar} disabled={saving} className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-60">
            {saving ? "Guardando..." : "Guardar responsabilidades"}
          </button>
        </div>
      </div>
    </div>
  );
}
