"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parseProductos,
  productoVacio,
  CATEGORIAS_PRODUCTO,
  UNIDADES_MEDIDA_PRODUCTO,
  ESTADOS_PRODUCTO,
  type ProductoFabricado,
} from "@/lib/productosFabricados";

const ITEM_KEY = "productos_lista";
const MAX_IMG_BYTES = 800_000; // ~800KB

export default function InscripcionProductosPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading, save } = useGestionDocumentos("operativa", user?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productos, setProductos] = useState<ProductoFabricado[]>([]);
  const [form, setForm] = useState<ProductoFabricado>(productoVacio());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      setProductos(parseProductos(docs[ITEM_KEY] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function handleLimpiar() {
    setForm(productoVacio());
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMG_BYTES) {
      setError("La imagen es muy pesada. Usá una de menos de 800KB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, imagen: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function campo<K extends keyof ProductoFabricado>(key: K, value: ProductoFabricado[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    setSaving(true);
    const actualizados = [...productos.filter((p) => p.id !== form.id), form];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setProductos(actualizados);
    setForm(productoVacio());
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  function editar(p: ProductoFabricado) {
    setForm(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id: string) {
    const actualizados = productos.filter((p) => p.id !== id);
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setProductos(actualizados);
    setSaving(false);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = productos.some((p) => p.id === form.id);
  const inputClass =
    "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión Operativa
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Alta de Producto</h1>
          <p className="text-gray-500 text-sm mt-1">{editando ? "Editando producto" : "Carga de datos del producto fabricado"}</p>
        </div>
        {productos.length > 0 && (
          <Link href={`${basePath}/lista_maestra_productos`} className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]">
            Ver lista maestra ({productos.length}) →
          </Link>
        )}
      </div>

      <form onSubmit={handleGuardar} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">✓ Producto guardado</div>}

        {/* Imagen + resumen */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-2xl bg-[#FAFAFA] border-2 border-dashed border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden hover:border-[#F5A623]/50 transition-colors"
          >
            {form.imagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imagen} alt="Producto" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-9 h-9 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            )}
            <span className="absolute bottom-0 right-0 bg-[#F5A623] text-[#1A1A1A] rounded-full p-1.5 border-2 border-white text-xs leading-none">✎</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagen} className="hidden" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1A1A1A]">{form.nombre || "Nuevo producto"}</p>
            <p className="text-xs text-gray-500 mt-0.5">{form.categoria || "Sin categoría definida"}</p>
            <p className="text-[11px] text-gray-400 mt-1">Hacé clic en la imagen para subirla (máx. 800KB).</p>
          </div>
        </div>

        {/* Datos del producto */}
        <Seccion icono="📦" titulo="Datos del producto">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Nombre del producto</label>
              <input value={form.nombre} onChange={(e) => campo("nombre", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Código / SKU</label>
              <input value={form.codigo} onChange={(e) => campo("codigo", e.target.value)} className={inputClass} placeholder="Ej: PRD-0001" />
            </div>
            <div>
              <label className={labelClass}>Categoría</label>
              <select value={form.categoria} onChange={(e) => campo("categoria", e.target.value)} className={inputClass}>
                <option value="">Seleccioná</option>
                {CATEGORIAS_PRODUCTO.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Unidad de medida</label>
              <select value={form.unidadMedida} onChange={(e) => campo("unidadMedida", e.target.value)} className={inputClass}>
                {UNIDADES_MEDIDA_PRODUCTO.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => campo("descripcion", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
            </div>
          </div>
        </Seccion>

        {/* Estado y observaciones */}
        <Seccion icono="📝" titulo="Estado y observaciones">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelClass}>Estado</label>
              <select value={form.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                {ESTADOS_PRODUCTO.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fecha de alta</label>
              <input type="date" value={form.fechaAlta} onChange={(e) => campo("fechaAlta", e.target.value)} className={inputClass} />
            </div>
          </div>
          <label className={labelClass}>Observaciones</label>
          <textarea value={form.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={3} className={`${inputClass} resize-y`} />
        </Seccion>

        <div className="flex items-center gap-3 sticky bottom-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 shadow-lg"
          >
            {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar producto"}
          </button>
          <button type="button" onClick={handleLimpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
            Limpiar
          </button>
        </div>
      </form>

      {productos.length > 0 && (
        <div className="pt-2">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Productos cargados ({productos.length})</h2>
          <div className="space-y-2">
            {productos.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.imagen && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{p.categoria} {p.codigo && <>· {p.codigo}</>}</p>
                </div>
                <button onClick={() => editar(p)} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">
                  Editar
                </button>
                <button onClick={() => eliminar(p.id)} className="text-xs text-gray-400 hover:text-red-500">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
