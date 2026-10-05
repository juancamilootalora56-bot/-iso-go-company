"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parsePersonal,
  empleadoVacio,
  GENEROS,
  ESTADOS_CIVILES,
  TIPOS_CONTRATO,
  JORNADAS,
  NIVELES_EDUCATIVOS,
  type Empleado,
} from "@/lib/personal";

const ITEM_KEY = "personal_lista";
const MAX_FOTO_BYTES = 800_000; // ~800KB

export default function AltaPersonalPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading, save } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [personal, setPersonal] = useState<Empleado[]>([]);
  const [form, setForm] = useState<Empleado>(empleadoVacio());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      setPersonal(parsePersonal(docs[ITEM_KEY] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function handleLimpiar() {
    setForm(empleadoVacio());
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

  function campo<K extends keyof Empleado>(key: K, value: Empleado[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim() || !form.apellido.trim() || !form.identificacion.trim() || !form.cargo.trim()) {
      setError("Nombre, Apellido, Identificación y Cargo son obligatorios.");
      return;
    }
    setSaving(true);
    const actualizados = [...personal.filter((p) => p.id !== form.id), form];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setPersonal(actualizados);
    setForm(empleadoVacio());
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  function editar(p: Empleado) {
    setForm(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id: string) {
    const actualizados = personal.filter((p) => p.id !== id);
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setPersonal(actualizados);
    setSaving(false);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const inputClass =
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623]";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión del Talento Humano
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Alta de Personal</h1>
          <p className="text-gray-500 text-sm mt-1">Carga de datos del colaborador</p>
        </div>
        {personal.length > 0 && (
          <Link
            href={`${basePath}/gestion_personal`}
            className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
          >
            Ver personal cargado ({personal.length}) →
          </Link>
        )}
      </div>

      <form onSubmit={handleGuardar} className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Colaborador guardado
          </div>
        )}

        {/* Foto */}
        <div>
          <label className={labelClass}>Foto</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden"
          >
            {form.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.foto} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
            <span className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200 text-xs">✎</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
        </div>

        {/* Datos personales */}
        <div>
          <h2 className="text-sm font-bold text-[#1A1A1A] border-b border-dashed border-gray-200 pb-1 mb-3">
            Datos personales
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Nombre</label>
              <input value={form.nombre} onChange={(e) => campo("nombre", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Apellido</label>
              <input value={form.apellido} onChange={(e) => campo("apellido", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Identificación (CI / DNI)</label>
              <input value={form.identificacion} onChange={(e) => campo("identificacion", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha de nacimiento</label>
              <input type="date" value={form.fechaNacimiento} onChange={(e) => campo("fechaNacimiento", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Género</label>
              <select value={form.genero} onChange={(e) => campo("genero", e.target.value)} className={inputClass}>
                <option value="">Seleccioná</option>
                {GENEROS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Estado civil</label>
              <select value={form.estadoCivil} onChange={(e) => campo("estadoCivil", e.target.value)} className={inputClass}>
                <option value="">Seleccioná</option>
                {ESTADOS_CIVILES.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Nacionalidad</label>
              <input value={form.nacionalidad} onChange={(e) => campo("nacionalidad", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input value={form.telefono} onChange={(e) => campo("telefono", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={(e) => campo("email", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Dirección</label>
              <input value={form.direccion} onChange={(e) => campo("direccion", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Contacto de emergencia */}
        <div>
          <h2 className="text-sm font-bold text-[#1A1A1A] border-b border-dashed border-gray-200 pb-1 mb-3">
            Contacto de emergencia
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Nombre</label>
              <input value={form.contactoEmergenciaNombre} onChange={(e) => campo("contactoEmergenciaNombre", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Parentesco</label>
              <input value={form.contactoEmergenciaParentesco} onChange={(e) => campo("contactoEmergenciaParentesco", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input value={form.contactoEmergenciaTelefono} onChange={(e) => campo("contactoEmergenciaTelefono", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Datos laborales */}
        <div>
          <h2 className="text-sm font-bold text-[#1A1A1A] border-b border-dashed border-gray-200 pb-1 mb-3">
            Datos laborales
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><span className="text-red-500">*</span> Cargo</label>
              <input value={form.cargo} onChange={(e) => campo("cargo", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Área / Departamento</label>
              <input value={form.area} onChange={(e) => campo("area", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha de ingreso</label>
              <input type="date" value={form.fechaIngreso} onChange={(e) => campo("fechaIngreso", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Jefe directo</label>
              <input value={form.jefeDirecto} onChange={(e) => campo("jefeDirecto", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tipo de contrato</label>
              <select value={form.tipoContrato} onChange={(e) => campo("tipoContrato", e.target.value)} className={inputClass}>
                <option value="">Seleccioná</option>
                {TIPOS_CONTRATO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Jornada</label>
              <select value={form.jornada} onChange={(e) => campo("jornada", e.target.value)} className={inputClass}>
                <option value="">Seleccioná</option>
                {JORNADAS.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Salario</label>
              <input value={form.salario} onChange={(e) => campo("salario", e.target.value)} className={inputClass} placeholder="Opcional" />
            </div>
          </div>
        </div>

        {/* Formación */}
        <div>
          <h2 className="text-sm font-bold text-[#1A1A1A] border-b border-dashed border-gray-200 pb-1 mb-3">
            Formación
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nivel educativo</label>
              <select value={form.nivelEducativo} onChange={(e) => campo("nivelEducativo", e.target.value)} className={inputClass}>
                <option value="">Seleccioná</option>
                {NIVELES_EDUCATIVOS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Profesión / Título</label>
              <input value={form.profesion} onChange={(e) => campo("profesion", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Observaciones</label>
          <textarea value={form.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={3} className={inputClass} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar colaborador"}
          </button>
          <button type="button" onClick={handleLimpiar} className="text-sm text-gray-400 hover:text-gray-600">
            Limpiar
          </button>
        </div>
      </form>

      {personal.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Personal cargado ({personal.length})</h2>
          <div className="space-y-2">
            {personal.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.foto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.foto} alt={p.nombre} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{p.nombre} {p.apellido}</p>
                  <p className="text-xs text-gray-500 truncate">{p.cargo} {p.area && <>· {p.area}</>}</p>
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
