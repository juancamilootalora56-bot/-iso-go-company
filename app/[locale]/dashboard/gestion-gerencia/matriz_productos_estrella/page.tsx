"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseProductos, productoVacio, type ProductoEstrella } from "@/lib/productosEstrella";

const ITEM_KEY = "matriz_productos_estrella";
const MAX_FOTO_BYTES = 800_000; // ~800KB

export default function MatrizProductosEstrellaPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productos, setProductos] = useState<ProductoEstrella[]>([]);
  const [form, setForm] = useState<ProductoEstrella>(productoVacio());
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
    if (!form.nombre.trim() || !form.descripcion.trim()) {
      setError("Nombre y Descripción son obligatorios.");
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

  function editar(p: ProductoEstrella) {
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

  const inputClass =
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623]";

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Alta de Productos</h1>
          <p className="text-gray-500 text-sm mt-1">Carga de datos del Producto Estrella</p>
        </div>
        {productos.length > 0 && (
          <Link
            href={`${basePath}/matriz_productos_estrella/resultado`}
            className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
          >
            Ver matriz ({productos.length}) →
          </Link>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-6">
        En esta sección podrás cargar la información detallada de tus Productos Estrella. Completá el
        formulario con las características, ventajas y beneficios que hacen que cada producto se destaque
        en el mercado.
      </p>

      <form onSubmit={handleGuardar} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Producto guardado
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Foto</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden"
          >
            {form.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.foto} alt="Producto" className="max-w-full max-h-full object-contain" />
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
            placeholder="Nombre..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            <span className="text-red-500">*</span> Descripción
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            placeholder="Descripción..."
            rows={3}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Características</label>
          <textarea
            value={form.caracteristicas}
            onChange={(e) => setForm((f) => ({ ...f, caracteristicas: e.target.value }))}
            placeholder="Características..."
            rows={3}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ventajas</label>
          <textarea
            value={form.ventajas}
            onChange={(e) => setForm((f) => ({ ...f, ventajas: e.target.value }))}
            placeholder="Ventajas..."
            rows={3}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Beneficios</label>
          <textarea
            value={form.beneficios}
            onChange={(e) => setForm((f) => ({ ...f, beneficios: e.target.value }))}
            placeholder="Beneficios..."
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={handleLimpiar}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Limpiar
          </button>
        </div>
      </form>

      {productos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Productos cargados ({productos.length})</h2>
          <div className="space-y-2">
            {productos.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3"
              >
                <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 flex-shrink-0 overflow-hidden relative flex items-center justify-center">
                  {p.foto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.foto} alt={p.nombre} className="max-w-full max-h-full object-contain" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{p.descripcion}</p>
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
