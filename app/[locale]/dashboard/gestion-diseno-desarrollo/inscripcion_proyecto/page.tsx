"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parseProyectosDiseno,
  proyectoDisenoVacio,
  TIPOS_PROYECTO_DISENO,
  ESTADOS_PROYECTO_DISENO,
  type ProyectoDiseno,
} from "@/lib/disenoDesarrollo";

const ITEM_KEY = "proyectos_diseno_lista";
const MAX_IMG_BYTES = 800_000; // ~800KB

export default function InscripcionProyectoDisenoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-diseno-desarrollo`;

  const { docs, loading, save } = useGestionDocumentos("diseno_desarrollo", user?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [proyectos, setProyectos] = useState<ProyectoDiseno[]>([]);
  const [form, setForm] = useState<ProyectoDiseno>(proyectoDisenoVacio());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) setProyectos(parseProyectosDiseno(docs[ITEM_KEY] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function handleLimpiar() {
    setForm(proyectoDisenoVacio());
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

  function campo<K extends keyof ProyectoDiseno>(key: K, value: ProyectoDiseno[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim()) {
      setError("El nombre del proyecto es obligatorio.");
      return;
    }
    setSaving(true);
    const actualizados = [...proyectos.filter((p) => p.id !== form.id), form];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setProyectos(actualizados);
    setForm(proyectoDisenoVacio());
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  function editar(p: ProyectoDiseno) {
    setForm(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id: string) {
    setSaving(true);
    const actualizados = proyectos.filter((p) => p.id !== id);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setProyectos(actualizados);
    setSaving(false);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = proyectos.some((p) => p.id === form.id);
  const inputClass =
    "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Diseño y Desarrollo
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Alta de Proyecto de Diseño</h1>
          <p className="text-gray-500 text-sm mt-1">{editando ? "Editando proyecto" : "Carga de un nuevo proyecto de diseño y desarrollo"}</p>
        </div>
        {proyectos.length > 0 && (
          <Link href={`${basePath}/proyectos`} className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]">
            Ver proyectos ({proyectos.length}) →
          </Link>
        )}
      </div>

      <form onSubmit={handleGuardar} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">✓ Proyecto guardado</div>}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-2xl bg-[#FAFAFA] border-2 border-dashed border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden hover:border-[#F5A623]/50 transition-colors"
          >
            {form.imagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imagen} alt="Proyecto" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🧪</span>
            )}
            <span className="absolute bottom-0 right-0 bg-[#F5A623] text-[#1A1A1A] rounded-full p-1.5 border-2 border-white text-xs leading-none">✎</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagen} className="hidden" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1A1A1A]">{form.nombre || "Nuevo proyecto de diseño"}</p>
            <p className="text-xs text-gray-500 mt-0.5">{form.tipo || "Sin tipo definido"}</p>
            <p className="text-[11px] text-gray-400 mt-1">Hacé clic en la imagen para subirla (máx. 800KB).</p>
          </div>
        </div>

        <Seccion icono="🧪" titulo="Datos del proyecto">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Nombre del proyecto</label>
              <input value={form.nombre} onChange={(e) => campo("nombre", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Código</label>
              <input value={form.codigo} onChange={(e) => campo("codigo", e.target.value)} className={inputClass} placeholder="Ej: DD-0001" />
            </div>
            <div>
              <label className={labelClass}>Tipo de proyecto</label>
              <select value={form.tipo} onChange={(e) => campo("tipo", e.target.value)} className={inputClass}>
                {TIPOS_PROYECTO_DISENO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Responsable de diseño</label>
              <input value={form.responsableDiseno} onChange={(e) => campo("responsableDiseno", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Cliente / parte solicitante</label>
              <input value={form.clienteSolicitante} onChange={(e) => campo("clienteSolicitante", e.target.value)} className={inputClass} placeholder="Ej: Interno, o nombre del cliente" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => campo("descripcion", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
            </div>
          </div>
        </Seccion>

        <Seccion icono="📅" titulo="Cronograma y estado">
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className={labelClass}>Fecha de inicio</label>
              <input type="date" value={form.fechaInicio} onChange={(e) => campo("fechaInicio", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fin planeado</label>
              <input type="date" value={form.fechaFinPlaneada} onChange={(e) => campo("fechaFinPlaneada", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fin real</label>
              <input type="date" value={form.fechaFinReal} onChange={(e) => campo("fechaFinReal", e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelClass}>Estado</label>
              <select value={form.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                {ESTADOS_PROYECTO_DISENO.map((e) => <option key={e} value={e}>{e}</option>)}
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
            {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar proyecto"}
          </button>
          <button type="button" onClick={handleLimpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
            Limpiar
          </button>
        </div>
      </form>

      {proyectos.length > 0 && (
        <div className="pt-2">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Proyectos cargados ({proyectos.length})</h2>
          <div className="space-y-2">
            {proyectos.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {p.imagen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">🧪</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{p.tipo} {p.codigo && <>· {p.codigo}</>}</p>
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
