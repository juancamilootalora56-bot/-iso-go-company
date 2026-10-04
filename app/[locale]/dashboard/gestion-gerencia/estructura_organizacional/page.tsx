"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseNodos, nodoVacio, type NodoOrganigrama } from "@/lib/estructuraOrganizacional";

const ITEM_KEY = "estructura_organizacional";
const MAX_FOTO_BYTES = 800_000; // ~800KB

export default function EstructuraOrganizacionalPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nodos, setNodos] = useState<NodoOrganigrama[]>([]);
  const [form, setForm] = useState<NodoOrganigrama>(nodoVacio());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      setNodos(parseNodos(docs[ITEM_KEY] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function handleLimpiar() {
    setForm(nodoVacio());
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FOTO_BYTES) {
      setError("La foto es muy pesada. Usá una imagen de menos de 800KB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, foto: reader.result as string }));
    reader.readAsDataURL(file);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim() || !form.cargo.trim()) {
      setError("Nombre y Cargo son obligatorios.");
      return;
    }
    if (form.parentId === form.id) {
      setError("Un cargo no puede depender de sí mismo.");
      return;
    }
    setSaving(true);
    const actualizados = [...nodos.filter((n) => n.id !== form.id), form];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setNodos(actualizados);
    setForm(nodoVacio());
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  function editar(n: NodoOrganigrama) {
    setForm(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id: string) {
    // Los hijos del nodo eliminado quedan "sin jefe" (nivel superior), no se borran en cascada.
    const actualizados = nodos
      .filter((n) => n.id !== id)
      .map((n) => (n.parentId === id ? { ...n, parentId: null } : n));
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setNodos(actualizados);
    setSaving(false);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const inputClass =
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623]";

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Estructura Organizacional</h1>
          <p className="text-gray-500 text-sm mt-1">Carga de cargos</p>
        </div>
        {nodos.length > 0 && (
          <Link
            href={`${basePath}/estructura_organizacional/resultado`}
            className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
          >
            Ver organigrama ({nodos.length}) →
          </Link>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Agregá un cargo a la vez, con su foto, nombre y de quién depende. El organigrama se va armando
        automáticamente con cada cargo que cargues. El primero que cargues (sin jefe) va a quedar como el
        nivel más alto.
      </p>

      <form onSubmit={handleGuardar} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Cargo guardado
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Foto</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden"
          >
            {form.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.foto} alt="Foto" className="w-full h-full object-cover" />
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
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Nombre y apellido..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            <span className="text-red-500">*</span> Cargo
          </label>
          <input
            value={form.cargo}
            onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
            placeholder="Ej: Gerente Comercial"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Depende de</label>
          <select
            value={form.parentId ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value || null }))}
            className={inputClass}
          >
            <option value="">— Nivel más alto (sin jefe directo) —</option>
            {nodos
              .filter((n) => n.id !== form.id)
              .map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nombre} — {n.cargo}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cargo"}
          </button>
          <button type="button" onClick={handleLimpiar} className="text-sm text-gray-400 hover:text-gray-600">
            Limpiar
          </button>
        </div>
      </form>

      {nodos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Cargos cargados ({nodos.length})</h2>
          <div className="space-y-2">
            {nodos.map((n) => {
              const jefe = nodos.find((j) => j.id === n.parentId);
              return (
                <div key={n.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                    {n.foto && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.foto} alt={n.nombre} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{n.nombre}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {n.cargo} {jefe && <>· depende de {jefe.nombre}</>}
                    </p>
                  </div>
                  <button onClick={() => editar(n)} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">
                    Editar
                  </button>
                  <button onClick={() => eliminar(n.id)} className="text-xs text-gray-400 hover:text-red-500">
                    Eliminar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
