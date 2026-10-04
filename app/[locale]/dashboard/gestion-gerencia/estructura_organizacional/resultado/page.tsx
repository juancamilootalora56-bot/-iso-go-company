"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseNodos, construirArbol, nodoVacio, type NodoOrganigrama } from "@/lib/estructuraOrganizacional";

const ITEM_KEY = "estructura_organizacional";
const MAX_FOTO_BYTES = 800_000; // ~800KB

type FormularioState = { modo: "agregar" | "editar"; draft: NodoOrganigrama } | null;

function TarjetaNodo({
  nodo,
  onClick,
}: {
  nodo: NodoOrganigrama;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center flex-shrink-0 group">
      <div className="w-16 h-16 rounded-full border-2 border-white shadow-md bg-gray-100 overflow-hidden flex items-center justify-center z-10 group-hover:ring-2 group-hover:ring-[#F5A623] transition-all">
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
      </div>
    </button>
  );
}

function BotonAgregar({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center flex-shrink-0 group"
      title={label}
    >
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
            {hijos.map((hijo, idx) => (
              <div key={hijo.id} className="flex flex-col items-center px-4 relative">
                {hijos.length > 1 && (
                  <div
                    className="absolute top-0 h-px bg-gray-300"
                    style={{
                      left: idx === 0 ? "50%" : 0,
                      right: idx === hijos.length - 1 ? "50%" : 0,
                    }}
                  />
                )}
                <div className="w-px h-5 bg-gray-300" />
                <RamaArbol nodo={hijo} hijosDe={hijosDe} onEditar={onEditar} onAgregarHijo={onAgregarHijo} />
              </div>
            ))}
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

  const [nodos, setNodos] = useState<NodoOrganigrama[]>([]);
  const [form, setForm] = useState<FormularioState>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      setNodos(parseNodos(docs[ITEM_KEY] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function abrirAgregar(parentId: string | null) {
    setError(null);
    setForm({ modo: "agregar", draft: nodoVacio(parentId) });
  }

  function abrirEditar(n: NodoOrganigrama) {
    setError(null);
    setForm({ modo: "editar", draft: { ...n } });
  }

  function cerrarForm() {
    setForm(null);
    setError(null);
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
    cerrarForm();
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const { raices, hijosDe } = construirArbol(nodos);
  const inputClass =
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623]";

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Organigrama</h1>
        <p className="text-gray-500 text-sm mt-1">
          Hacé clic en el <span className="font-semibold text-gray-700">+</span> para agregar un cargo, o en
          una tarjeta para editarla.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-8 overflow-x-auto">
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
      </div>

      {form && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={cerrarForm}>
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4 shadow-2xl"
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
