"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { createClient } from "@/lib/supabase/client";
import { otorgarAccesoPorRegistro } from "@/lib/colaboradoresCliente";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import SelectorAccesoColaboradores from "@/components/dashboard/SelectorAccesoColaboradores";
import {
  parseServicios,
  servicioVacio,
  CATEGORIAS_SERVICIO,
  UNIDADES_DURACION_SERVICIO,
  ESTADOS_SERVICIO,
  type Servicio,
} from "@/lib/servicios";

const ITEM_KEY = "servicios_lista";
const MAX_IMG_BYTES = 800_000; // ~800KB

export default function InscripcionServiciosPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading, save } = useGestionDocumentos("operativa", user?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [form, setForm] = useState<Servicio>(servicioVacio());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      setServicios(parseServicios(docs[ITEM_KEY] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function handleLimpiar() {
    setForm(servicioVacio());
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

  function campo<K extends keyof Servicio>(key: K, value: Servicio[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim()) {
      setError("El nombre del servicio es obligatorio.");
      return;
    }
    setSaving(true);
    const actualizados = [...servicios.filter((s) => s.id !== form.id), form];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    if (user?.id) {
      await otorgarAccesoPorRegistro(createClient() as never, user.id, form.colaboradoresConAcceso ?? [], "operativa", "lista_maestra_servicios");
    }
    setServicios(actualizados);
    setForm(servicioVacio());
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  function editar(s: Servicio) {
    setForm(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id: string) {
    const actualizados = servicios.filter((s) => s.id !== id);
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setServicios(actualizados);
    setSaving(false);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = servicios.some((s) => s.id === form.id);
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
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Alta de Servicio</h1>
          <p className="text-gray-500 text-sm mt-1">{editando ? "Editando servicio" : "Carga de datos del servicio prestado"}</p>
        </div>
        {servicios.length > 0 && (
          <Link href={`${basePath}/lista_maestra_servicios`} className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]">
            Ver lista maestra ({servicios.length}) →
          </Link>
        )}
      </div>

      <form onSubmit={handleGuardar} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">✓ Servicio guardado</div>}

        {/* Imagen + resumen */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-2xl bg-[#FAFAFA] border-2 border-dashed border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden hover:border-[#F5A623]/50 transition-colors"
          >
            {form.imagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imagen} alt="Servicio" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-9 h-9 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            )}
            <span className="absolute bottom-0 right-0 bg-[#F5A623] text-[#1A1A1A] rounded-full p-1.5 border-2 border-white text-xs leading-none">✎</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagen} className="hidden" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1A1A1A]">{form.nombre || "Nuevo servicio"}</p>
            <p className="text-xs text-gray-500 mt-0.5">{form.categoria || "Sin categoría definida"}</p>
            <p className="text-[11px] text-gray-400 mt-1">Hacé clic en la imagen para subirla (máx. 800KB).</p>
          </div>
        </div>

        {/* Datos del servicio */}
        <Seccion icono="🧰" titulo="Datos del servicio">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Nombre del servicio</label>
              <input value={form.nombre} onChange={(e) => campo("nombre", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Código</label>
              <input value={form.codigo} onChange={(e) => campo("codigo", e.target.value)} className={inputClass} placeholder="Ej: SRV-0001" />
            </div>
            <div>
              <label className={labelClass}>Categoría</label>
              <select value={form.categoria} onChange={(e) => campo("categoria", e.target.value)} className={inputClass}>
                <option value="">Seleccioná</option>
                {CATEGORIAS_SERVICIO.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Duración estimada</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={100000}
                  value={form.duracionEstimada}
                  onChange={(e) => campo("duracionEstimada", Math.max(0, Math.min(100000, Number(e.target.value) || 0)))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={`${inputClass} flex-1 min-w-0`}
                />
                <select value={form.unidadDuracion} onChange={(e) => campo("unidadDuracion", e.target.value)} className={`${inputClass} w-28 flex-shrink-0`}>
                  {UNIDADES_DURACION_SERVICIO.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => campo("descripcion", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Criterios de aceptación</label>
              <textarea
                value={form.criteriosAceptacion}
                onChange={(e) => campo("criteriosAceptacion", e.target.value)}
                rows={2}
                placeholder="¿Qué define que el servicio se prestó correctamente?"
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>
        </Seccion>

        {/* Estado y observaciones */}
        <Seccion icono="📝" titulo="Estado y observaciones">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelClass}>Estado</label>
              <select value={form.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                {ESTADOS_SERVICIO.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
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

        <div className="flex justify-end">
          <SelectorAccesoColaboradores
            ownerId={user?.id ?? null}
            value={form.colaboradoresConAcceso ?? []}
            onChange={(ids) => campo("colaboradoresConAcceso", ids)}
          />
        </div>

        <div className="flex items-center gap-3 sticky bottom-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 shadow-lg"
          >
            {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar servicio"}
          </button>
          <button type="button" onClick={handleLimpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
            Limpiar
          </button>
        </div>
      </form>

      {servicios.length > 0 && (
        <div className="pt-2">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Servicios cargados ({servicios.length})</h2>
          <div className="space-y-2">
            {servicios.map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {s.imagen && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imagen} alt={s.nombre} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{s.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{s.categoria} {s.codigo && <>· {s.codigo}</>}</p>
                </div>
                <button onClick={() => editar(s)} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">
                  Editar
                </button>
                <button onClick={() => eliminar(s.id)} className="text-xs text-gray-400 hover:text-red-500">
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
