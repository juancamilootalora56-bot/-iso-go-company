"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parseProveedores,
  proveedorVacio,
  RUBROS_PROVEEDOR,
  FORMAS_PAGO,
  MONEDAS,
  TIPOS_CUENTA,
  ESTADOS_PROVEEDOR,
  type Proveedor,
} from "@/lib/proveedores";

const ITEM_KEY = "proveedores_lista";
const MAX_LOGO_BYTES = 800_000; // ~800KB

export default function InscripcionProveedoresPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-compras`;

  const { docs, loading, save } = useGestionDocumentos("compras", user?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [form, setForm] = useState<Proveedor>(proveedorVacio());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      setProveedores(parseProveedores(docs[ITEM_KEY] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function handleLimpiar() {
    setForm(proveedorVacio());
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setError("El logo es muy pesado. Usá una imagen de menos de 800KB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logo: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function campo<K extends keyof Proveedor>(key: K, value: Proveedor[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.razonSocial.trim() || !form.ruc.trim() || !form.rubro.trim()) {
      setError("Razón social, RUC y Rubro son obligatorios.");
      return;
    }
    setSaving(true);
    const actualizados = [...proveedores.filter((p) => p.id !== form.id), form];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setProveedores(actualizados);
    setForm(proveedorVacio());
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  function editar(p: Proveedor) {
    setForm(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id: string) {
    const actualizados = proveedores.filter((p) => p.id !== id);
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setProveedores(actualizados);
    setSaving(false);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = proveedores.some((p) => p.id === form.id);
  const inputClass =
    "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Compras
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Inscripción de Proveedores</h1>
          <p className="text-gray-500 text-sm mt-1">{editando ? "Editando proveedor" : "Carga de datos del proveedor"}</p>
        </div>
        {proveedores.length > 0 && (
          <Link
            href={`${basePath}/lista_maestra_proveedores`}
            className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
          >
            Ver lista maestra ({proveedores.length}) →
          </Link>
        )}
      </div>

      <form onSubmit={handleGuardar} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Proveedor guardado
          </div>
        )}

        {/* Logo + resumen */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-2xl bg-[#FAFAFA] border-2 border-dashed border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden hover:border-[#F5A623]/50 transition-colors"
          >
            {form.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <svg className="w-9 h-9 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            )}
            <span className="absolute bottom-0 right-0 bg-[#F5A623] text-[#1A1A1A] rounded-full p-1.5 border-2 border-white text-xs leading-none">✎</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              {form.razonSocial || "Nuevo proveedor"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{form.rubro || "Sin rubro definido"}</p>
            <p className="text-[11px] text-gray-400 mt-1">Hacé clic en el logo para subirlo (máx. 800KB).</p>
          </div>
        </div>

        {/* Datos de la empresa */}
        <Seccion icono="🏢" titulo="Datos de la empresa">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Razón social</label>
              <input value={form.razonSocial} onChange={(e) => campo("razonSocial", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nombre comercial</label>
              <input value={form.nombreComercial} onChange={(e) => campo("nombreComercial", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> RUC</label>
              <input value={form.ruc} onChange={(e) => campo("ruc", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Rubro</label>
              <select value={form.rubro} onChange={(e) => campo("rubro", e.target.value)} className={inputClass}>
                <option value="">Seleccioná</option>
                {RUBROS_PROVEEDOR.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Dirección</label>
              <input value={form.direccion} onChange={(e) => campo("direccion", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ciudad</label>
              <input value={form.ciudad} onChange={(e) => campo("ciudad", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>País</label>
              <input value={form.pais} onChange={(e) => campo("pais", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input value={form.telefono} onChange={(e) => campo("telefono", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={(e) => campo("email", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Sitio web</label>
              <input value={form.sitioWeb} onChange={(e) => campo("sitioWeb", e.target.value)} className={inputClass} placeholder="https://" />
            </div>
          </div>
        </Seccion>

        {/* Persona de contacto */}
        <Seccion icono="🧑‍💼" titulo="Persona de contacto">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nombre</label>
              <input value={form.contactoNombre} onChange={(e) => campo("contactoNombre", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cargo</label>
              <input value={form.contactoCargo} onChange={(e) => campo("contactoCargo", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input value={form.contactoTelefono} onChange={(e) => campo("contactoTelefono", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.contactoEmail} onChange={(e) => campo("contactoEmail", e.target.value)} className={inputClass} />
            </div>
          </div>
        </Seccion>

        {/* Condiciones comerciales */}
        <Seccion icono="📄" titulo="Condiciones comerciales">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Forma de pago</label>
              <select value={form.formaPago} onChange={(e) => campo("formaPago", e.target.value)} className={inputClass}>
                <option value="">Seleccioná</option>
                {FORMAS_PAGO.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Moneda</label>
              <select value={form.moneda} onChange={(e) => campo("moneda", e.target.value)} className={inputClass}>
                <option value="">Seleccioná</option>
                {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Plazo de entrega</label>
              <input value={form.plazoEntrega} onChange={(e) => campo("plazoEntrega", e.target.value)} className={inputClass} placeholder="Ej: 5 días hábiles" />
            </div>
            <div>
              <label className={labelClass}>Monto mínimo de compra</label>
              <input value={form.montoMinimo} onChange={(e) => campo("montoMinimo", e.target.value)} className={inputClass} placeholder="Opcional" />
            </div>
          </div>
        </Seccion>

        {/* Datos bancarios */}
        <Seccion icono="🏦" titulo="Datos bancarios">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Banco</label>
              <input value={form.banco} onChange={(e) => campo("banco", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tipo de cuenta</label>
              <select value={form.tipoCuenta} onChange={(e) => campo("tipoCuenta", e.target.value)} className={inputClass}>
                <option value="">Seleccioná</option>
                {TIPOS_CUENTA.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Número de cuenta</label>
              <input value={form.numeroCuenta} onChange={(e) => campo("numeroCuenta", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Titular de la cuenta</label>
              <input value={form.titularCuenta} onChange={(e) => campo("titularCuenta", e.target.value)} className={inputClass} />
            </div>
          </div>
        </Seccion>

        {/* Estado y observaciones */}
        <Seccion icono="📝" titulo="Estado y observaciones">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelClass}>Estado</label>
              <select value={form.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                {ESTADOS_PROVEEDOR.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fecha de registro</label>
              <input type="date" value={form.fechaRegistro} onChange={(e) => campo("fechaRegistro", e.target.value)} className={inputClass} />
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
            {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar proveedor"}
          </button>
          <button type="button" onClick={handleLimpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
            Limpiar
          </button>
        </div>
      </form>

      {proveedores.length > 0 && (
        <div className="pt-2">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Proveedores cargados ({proveedores.length})</h2>
          <div className="space-y-2">
            {proveedores.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo} alt={p.razonSocial} className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{p.razonSocial}</p>
                  <p className="text-xs text-gray-500 truncate">{p.rubro} {p.ruc && <>· RUC {p.ruc}</>}</p>
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
