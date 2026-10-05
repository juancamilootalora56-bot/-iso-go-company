"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { MODULOS_PERMISOS, type Colaborador } from "@/lib/colaboradoresCliente";

const MAX_LOGO_BYTES = 800_000; // ~800KB
const MAX_FOTO_BYTES = 800_000;

function colaboradorVacio() {
  return {
    nombre: "",
    apellido: "",
    cargo: "",
    identificacion: "",
    email: "",
    password: "",
    foto: null as string | null,
    permisos: [] as string[],
  };
}

export default function PerfilPage() {
  const { user, profile } = useUser();
  const params = useParams();
  const locale = params.locale as string;

  const logoInputRef = useRef<HTMLInputElement>(null);
  const fotoColabInputRef = useRef<HTMLInputElement>(null);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [representanteLegal, setRepresentanteLegal] = useState("");
  const [ruc, setRuc] = useState("");
  const [descripcionEmpresa, setDescripcionEmpresa] = useState("");
  const [procesosEmpresa, setProcesosEmpresa] = useState("");
  const [savingEmpresa, setSavingEmpresa] = useState(false);
  const [savedEmpresa, setSavedEmpresa] = useState(false);
  const [errorEmpresa, setErrorEmpresa] = useState<string | null>(null);

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(true);
  const [formColab, setFormColab] = useState(colaboradorVacio());
  const [creandoColab, setCreandoColab] = useState(false);
  const [errorColab, setErrorColab] = useState<string | null>(null);
  const [creado, setCreado] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setLogoUrl(profile.logo_url || null);
      setCompanyName(profile.company_name || "");
      setRazonSocial(profile.razon_social || "");
      setRepresentanteLegal(profile.representante_legal || "");
      setRuc(profile.ruc || "");
      setDescripcionEmpresa(profile.descripcion_empresa || "");
      setProcesosEmpresa(profile.procesos_empresa || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("client_colaboradores")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      setColaboradores(data ?? []);
      setLoadingColaboradores(false);
    })();
  }, [user]);

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setErrorEmpresa("El logo es muy pesado. Usá una imagen de menos de 800KB.");
      return;
    }
    setErrorEmpresa(null);
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSaveEmpresa(e: React.FormEvent) {
    e.preventDefault();
    setSavingEmpresa(true);
    setErrorEmpresa(null);
    setSavedEmpresa(false);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          logo_url: logoUrl,
          company_name: companyName,
          razon_social: razonSocial,
          representante_legal: representanteLegal,
          ruc,
          descripcion_empresa: descripcionEmpresa,
          procesos_empresa: procesosEmpresa,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);
      if (error) setErrorEmpresa("Error al guardar. Intenta de nuevo.");
      else setSavedEmpresa(true);
    } catch {
      setErrorEmpresa("Error de conexión.");
    } finally {
      setSavingEmpresa(false);
    }
  }

  function handleFotoColab(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FOTO_BYTES) {
      setErrorColab("La foto es muy pesada. Usá una imagen de menos de 800KB.");
      return;
    }
    setErrorColab(null);
    const reader = new FileReader();
    reader.onload = () => setFormColab((f) => ({ ...f, foto: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function togglePermiso(modulo: string) {
    setFormColab((f) => ({
      ...f,
      permisos: f.permisos.includes(modulo) ? f.permisos.filter((m) => m !== modulo) : [...f.permisos, modulo],
    }));
  }

  async function handleCrearColaborador(e: React.FormEvent) {
    e.preventDefault();
    setErrorColab(null);
    setCreado(null);
    if (!formColab.nombre.trim() || !formColab.apellido.trim() || !formColab.email.trim()) {
      setErrorColab("Nombre, apellido y email son obligatorios.");
      return;
    }
    setCreandoColab(true);
    try {
      const res = await fetch("/api/dashboard/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formColab.email,
          nombre: formColab.nombre,
          apellido: formColab.apellido,
          cargo: formColab.cargo,
          identificacion: formColab.identificacion,
          foto: formColab.foto,
          permisos: formColab.permisos,
          password: formColab.password || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorColab(data.error || "No se pudo crear el colaborador");
        return;
      }
      setCreado({ email: formColab.email, password: data.password });
      setFormColab(colaboradorVacio());
      if (fotoColabInputRef.current) fotoColabInputRef.current.value = "";

      const supabase = createClient();
      const { data: updated } = await supabase
        .from("client_colaboradores")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      setColaboradores(updated ?? []);
    } catch {
      setErrorColab("Error de conexión.");
    } finally {
      setCreandoColab(false);
    }
  }

  async function toggleActivoColab(id: string, activo: boolean) {
    const supabase = createClient();
    const { error } = await supabase.from("client_colaboradores").update({ activo: !activo }).eq("id", id);
    if (!error) {
      setColaboradores((prev) => prev.map((c) => (c.id === id ? { ...c, activo: !activo } : c)));
    }
  }

  async function eliminarColaborador(id: string, email: string) {
    if (!confirm(`¿Eliminar definitivamente el acceso de ${email}?`)) return;
    setErrorColab(null);
    const res = await fetch("/api/dashboard/colaboradores", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorColab(data.error || "No se pudo eliminar");
      return;
    }
    setColaboradores((prev) => prev.filter((c) => c.id !== id));
  }

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Mi perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Datos de tu empresa y accesos de tu equipo</p>
      </div>

      {/* Contexto de la organización */}
      <form onSubmit={handleSaveEmpresa} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-[#1A1A1A]">Contexto de la Organización</h2>
          <p className="text-xs text-gray-500 mt-1">
            El logo y los datos de tu empresa van a personalizar todo tu sistema: van a aparecer en el panel y en
            los documentos que generes (Misión, Visión, Política de Calidad, etc.).
          </p>
        </div>

        {savedEmpresa && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Datos de la empresa actualizados correctamente.
          </div>
        )}
        {errorEmpresa && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errorEmpresa}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la empresa</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="relative w-20 h-20 rounded-lg bg-[#FAFAFA] border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 p-2"
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              )}
              <span className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200 text-xs">✎</span>
            </button>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            <p className="text-xs text-gray-500">
              Subí el logo en alta calidad, fondo transparente si es posible. Menos de 800KB.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la empresa</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Razón social</label>
            <input value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Representante Legal / Socio Gerente</label>
            <input
              value={representanteLegal}
              onChange={(e) => setRepresentanteLegal(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">RUC</label>
            <input value={ruc} onChange={(e) => setRuc(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción de la empresa</label>
          <textarea
            value={descripcionEmpresa}
            onChange={(e) => setDescripcionEmpresa(e.target.value)}
            rows={3}
            placeholder="A qué se dedica la empresa, hace cuánto opera, qué la distingue..."
            className={`${inputClass} resize-y`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Procesos de la empresa</label>
          <textarea
            value={procesosEmpresa}
            onChange={(e) => setProcesosEmpresa(e.target.value)}
            rows={3}
            placeholder="Principales procesos o áreas con las que opera la empresa..."
            className={`${inputClass} resize-y`}
          />
        </div>

        <button
          type="submit"
          disabled={savingEmpresa}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors disabled:opacity-60"
        >
          {savingEmpresa ? "Guardando..." : "Guardar datos de la empresa"}
        </button>
      </form>

      {/* Colaboradores */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-[#1A1A1A]">Colaboradores</h2>
            <p className="text-xs text-gray-500 mt-1">
              Creá accesos para tu equipo. A cada colaborador le asignás qué módulos de Gestión puede trabajar.
            </p>
          </div>
          {colaboradores.length > 0 && (
            <Link
              href={`/${locale}/dashboard/perfil/colaboradores/resultado`}
              className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410] flex-shrink-0"
            >
              Ver matriz ({colaboradores.length}) →
            </Link>
          )}
        </div>

        {errorColab && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errorColab}</div>
        )}
        {creado && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
            <p className="text-green-700 font-semibold mb-1">Colaborador creado. Compartile estos datos de acceso:</p>
            <p className="text-[#1A1A1A]">
              Email: <span className="font-mono font-semibold">{creado.email}</span>
            </p>
            <p className="text-[#1A1A1A]">
              Contraseña: <span className="font-mono font-semibold">{creado.password}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleCrearColaborador} className="space-y-4 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fotoColabInputRef.current?.click()}
              className="relative w-16 h-16 rounded-full bg-[#FAFAFA] border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              {formColab.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formColab.foto} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
              <span className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200 text-xs">✎</span>
            </button>
            <input ref={fotoColabInputRef} type="file" accept="image/*" onChange={handleFotoColab} className="hidden" />
            <p className="text-xs text-gray-500">Foto del colaborador (opcional)</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
              <input
                value={formColab.nombre}
                onChange={(e) => setFormColab((f) => ({ ...f, nombre: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Apellido</label>
              <input
                value={formColab.apellido}
                onChange={(e) => setFormColab((f) => ({ ...f, apellido: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cargo</label>
              <input
                value={formColab.cargo}
                onChange={(e) => setFormColab((f) => ({ ...f, cargo: e.target.value }))}
                placeholder="Ej: Coordinadora Administrativa"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Identificación</label>
              <input
                value={formColab.identificacion}
                onChange={(e) => setFormColab((f) => ({ ...f, identificacion: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email (usuario)</label>
              <input
                type="email"
                value={formColab.email}
                onChange={(e) => setFormColab((f) => ({ ...f, email: e.target.value }))}
                placeholder="colaborador@empresa.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña</label>
              <input
                value={formColab.password}
                onChange={(e) => setFormColab((f) => ({ ...f, password: e.target.value }))}
                placeholder="Generar automática"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Módulos que puede trabajar</label>
            <div className="grid sm:grid-cols-2 gap-2">
              {MODULOS_PERMISOS.map((m) => (
                <label key={m.modulo} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formColab.permisos.includes(m.modulo)}
                    onChange={() => togglePermiso(m.modulo)}
                    className="w-4 h-4 accent-[#F5A623]"
                  />
                  <span className="text-sm text-gray-700">
                    {m.icon} {m.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={creandoColab}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors disabled:opacity-60"
          >
            {creandoColab ? "Creando..." : "Crear colaborador"}
          </button>
        </form>

        <div>
          {loadingColaboradores ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : colaboradores.length === 0 ? (
            <p className="text-gray-400 text-sm">Todavía no creaste ningún colaborador.</p>
          ) : (
            <div className="space-y-2">
              {colaboradores.map((c) => (
                <div key={c.id} className="flex items-center gap-3 bg-[#FAFAFA] rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                    {c.foto && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.foto} alt={c.nombre} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                      {c.nombre} {c.apellido}
                      {!c.activo && <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase">Inactivo</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {c.cargo || "—"} · {c.permisos.length} módulo{c.permisos.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleActivoColab(c.id, c.activo)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    {c.activo ? "Desactivar" : "Reactivar"}
                  </button>
                  <button
                    onClick={() => eliminarColaborador(c.id, c.nombre)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
