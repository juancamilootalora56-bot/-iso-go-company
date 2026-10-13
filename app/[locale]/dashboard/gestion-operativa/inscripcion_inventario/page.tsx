"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parseInventario,
  itemInventarioVacio,
  TIPOS_ITEM_INVENTARIO,
  ESTADOS_ITEM_INVENTARIO,
  CRITICIDADES_ITEM,
  MONEDAS_INVENTARIO,
  type ItemInventario,
} from "@/lib/inventario";

const ITEM_KEY = "inventario_lista";
const MAX_IMG_BYTES = 800_000; // ~800KB

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

export default function InscripcionInventarioPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading, save } = useGestionDocumentos("operativa", user?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<ItemInventario[]>([]);
  const [form, setForm] = useState<ItemInventario>(itemInventarioVacio());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) setItems(parseInventario(docs[ITEM_KEY] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function handleLimpiar() {
    setForm(itemInventarioVacio());
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

  function campo<K extends keyof ItemInventario>(key: K, value: ItemInventario[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim()) {
      setError("El nombre del ítem es obligatorio.");
      return;
    }
    setSaving(true);
    const actualizados = [...items.filter((i) => i.id !== form.id), form];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setItems(actualizados);
    setForm(itemInventarioVacio());
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  function editar(i: ItemInventario) {
    setForm(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id: string) {
    const actualizados = items.filter((i) => i.id !== id);
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setItems(actualizados);
    setSaving(false);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = items.some((i) => i.id === form.id);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión Operativa
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Alta de Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">{editando ? "Editando ítem" : "Carga de máquinas, equipos, herramientas e instrumentos"}</p>
        </div>
        {items.length > 0 && (
          <Link href={`${basePath}/lista_maestra_inventario`} className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]">
            Ver lista maestra ({items.length}) →
          </Link>
        )}
      </div>

      <form onSubmit={handleGuardar} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">✓ Ítem guardado</div>}

        {/* Foto + resumen */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-2xl bg-[#FAFAFA] border-2 border-dashed border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden hover:border-[#F5A623]/50 transition-colors"
          >
            {form.imagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imagen} alt="Foto del ítem" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-9 h-9 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            )}
            <span className="absolute bottom-0 right-0 bg-[#F5A623] text-[#1A1A1A] rounded-full p-1.5 border-2 border-white text-xs leading-none">✎</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagen} className="hidden" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1A1A1A]">{form.nombre || "Nuevo ítem"}</p>
            <p className="text-xs text-gray-500 mt-0.5">{form.tipo}</p>
            <p className="text-[11px] text-gray-400 mt-1">Hacé clic en la foto para subirla (máx. 800KB).</p>
          </div>
        </div>

        {/* Identificación */}
        <Seccion icono="🏷️" titulo="Identificación">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={labelClass}><span className="text-red-500">*</span> Nombre del ítem</label>
              <input value={form.nombre} onChange={(e) => campo("nombre", e.target.value)} placeholder="Ej: Torno CNC Fanuc 21i" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Código / Nº de inventario</label>
              <input value={form.codigo} onChange={(e) => campo("codigo", e.target.value)} placeholder="Ej: MAQ-0001" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tipo</label>
              <select value={form.tipo} onChange={(e) => campo("tipo", e.target.value)} className={inputClass}>
                {TIPOS_ITEM_INVENTARIO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Marca</label>
              <input value={form.marca} onChange={(e) => campo("marca", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Modelo</label>
              <input value={form.modelo} onChange={(e) => campo("modelo", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Número de serie</label>
              <input value={form.numeroSerie} onChange={(e) => campo("numeroSerie", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fabricante</label>
              <input value={form.fabricante} onChange={(e) => campo("fabricante", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Año de fabricación</label>
              <input value={form.anioFabricacion} onChange={(e) => campo("anioFabricacion", e.target.value)} placeholder="Ej: 2022" className={inputClass} />
            </div>
          </div>
        </Seccion>

        {/* Ubicación y responsable */}
        <Seccion icono="📍" titulo="Ubicación y responsable">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Ubicación</label>
              <input value={form.ubicacion} onChange={(e) => campo("ubicacion", e.target.value)} placeholder="Ej: Planta 1 - Mecanizado" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Responsable / custodio</label>
              <input value={form.responsable} onChange={(e) => campo("responsable", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Proveedor</label>
              <input value={form.proveedor} onChange={(e) => campo("proveedor", e.target.value)} className={inputClass} />
            </div>
          </div>
        </Seccion>

        {/* Adquisición */}
        <Seccion icono="🧾" titulo="Adquisición">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Fecha de adquisición</label>
              <input type="date" value={form.fechaAdquisicion} onChange={(e) => campo("fechaAdquisicion", e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Valor de adquisición</label>
                <input type="number" min={0} value={form.valorAdquisicion} onChange={(e) => campo("valorAdquisicion", Math.max(0, Number(e.target.value) || 0))} onWheel={(e) => e.currentTarget.blur()} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Moneda</label>
                <select value={form.moneda} onChange={(e) => campo("moneda", e.target.value)} className={inputClass}>
                  {MONEDAS_INVENTARIO.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Vida útil estimada (años)</label>
              <input value={form.vidaUtilAnios} onChange={(e) => campo("vidaUtilAnios", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nº de factura / orden de compra</label>
              <input value={form.numeroFactura} onChange={(e) => campo("numeroFactura", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Garantía hasta</label>
              <input type="date" value={form.garantiaHasta} onChange={(e) => campo("garantiaHasta", e.target.value)} className={inputClass} />
            </div>
          </div>
        </Seccion>

        {/* Especificaciones técnicas */}
        <Seccion icono="⚙️" titulo="Especificaciones técnicas">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Capacidad / Potencia</label>
              <input value={form.capacidadPotencia} onChange={(e) => campo("capacidadPotencia", e.target.value)} placeholder="Ej: 15 kW" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Voltaje / Alimentación</label>
              <input value={form.voltaje} onChange={(e) => campo("voltaje", e.target.value)} placeholder="Ej: 380V trifásico" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Dimensiones</label>
              <input value={form.dimensiones} onChange={(e) => campo("dimensiones", e.target.value)} placeholder="Ej: 2.5 x 1.2 x 1.8 m" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Peso (Kg)</label>
              <input value={form.pesoKg} onChange={(e) => campo("pesoKg", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Especificaciones adicionales</label>
              <textarea value={form.especificacionesTecnicas} onChange={(e) => campo("especificacionesTecnicas", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
            </div>
          </div>
        </Seccion>

        {/* Estado y mantenimiento */}
        <Seccion icono="🛠️" titulo="Estado y mantenimiento">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Estado</label>
              <select value={form.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                {ESTADOS_ITEM_INVENTARIO.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Criticidad</label>
              <select value={form.criticidad} onChange={(e) => campo("criticidad", e.target.value)} className={inputClass}>
                {CRITICIDADES_ITEM.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Frecuencia de mantenimiento</label>
              <input value={form.frecuenciaMantenimiento} onChange={(e) => campo("frecuenciaMantenimiento", e.target.value)} placeholder="Ej: Cada 3 meses" className={inputClass} />
            </div>
            <div />
            <div>
              <label className={labelClass}>Último mantenimiento</label>
              <input type="date" value={form.ultimoMantenimiento} onChange={(e) => campo("ultimoMantenimiento", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Próximo mantenimiento</label>
              <input type="date" value={form.proximoMantenimiento} onChange={(e) => campo("proximoMantenimiento", e.target.value)} className={inputClass} />
            </div>
          </div>
        </Seccion>

        {/* Calibración */}
        <Seccion icono="📏" titulo="Calibración">
          <div className="space-y-3">
            <div className="flex gap-1.5">
              <button type="button" onClick={() => campo("requiereCalibracion", true)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border ${form.requiereCalibracion ? "bg-[#1A1A1A] text-white border-transparent" : "border-gray-200 text-gray-500"}`}>
                Requiere calibración
              </button>
              <button type="button" onClick={() => campo("requiereCalibracion", false)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border ${!form.requiereCalibracion ? "bg-[#1A1A1A] text-white border-transparent" : "border-gray-200 text-gray-500"}`}>
                No aplica
              </button>
            </div>
            {form.requiereCalibracion && (
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Frecuencia de calibración</label>
                  <input value={form.frecuenciaCalibracion} onChange={(e) => campo("frecuenciaCalibracion", e.target.value)} placeholder="Ej: Anual" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Última calibración</label>
                  <input type="date" value={form.ultimaCalibracion} onChange={(e) => campo("ultimaCalibracion", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Próxima calibración</label>
                  <input type="date" value={form.proximaCalibracion} onChange={(e) => campo("proximaCalibracion", e.target.value)} className={inputClass} />
                </div>
              </div>
            )}
          </div>
        </Seccion>

        {/* Observaciones */}
        <Seccion icono="📝" titulo="Observaciones">
          <label className={labelClass}>Observaciones generales</label>
          <textarea value={form.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={3} className={`${inputClass} resize-y`} />
        </Seccion>

        <div className="flex items-center gap-3 sticky bottom-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 shadow-lg"
          >
            {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar ítem"}
          </button>
          <button type="button" onClick={handleLimpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
            Limpiar
          </button>
        </div>
      </form>

      {items.length > 0 && (
        <div className="pt-2">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Ítems cargados ({items.length})</h2>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {i.imagen && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.imagen} alt={i.nombre} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{i.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{i.tipo} {i.codigo && <>· {i.codigo}</>}</p>
                </div>
                <button onClick={() => editar(i)} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">
                  Editar
                </button>
                <button onClick={() => eliminar(i.id)} className="text-xs text-gray-400 hover:text-red-500">
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
