"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parsePersonal } from "@/lib/personal";
import { actividadesVisibles, tieneAccesoModulo, conAccesosBaseColaborador, MODULOS_PERMISOS, type Colaborador, type PermisosColaborador } from "@/lib/colaboradoresCliente";
import SelectorPermisosColaborador from "@/components/dashboard/SelectorPermisosColaborador";
import { TEMAS_PANEL, type TemaPanelKey } from "@/lib/temaPanel";
import { esPlanDiagnostico } from "@/lib/planCuenta";

const MAX_LOGO_BYTES = 800_000; // ~800KB

function colaboradorVacio() {
  return {
    empleadoId: "",
    email: "",
    password: "",
    permisos: {} as PermisosColaborador,
  };
}

function resumenPermisos(permisos: PermisosColaborador): string {
  const resumen = MODULOS_PERMISOS
    .filter((m) => tieneAccesoModulo(permisos, m.modulo))
    .map((m) => {
      const p = permisos[m.modulo];
      const completo = p && "completo" in p && p.completo;
      if (completo) return m.label;
      const cant = actividadesVisibles(permisos, m.modulo).length;
      return `${m.label} (${cant})`;
    });
  return resumen.join(" · ") || "Sin módulos asignados";
}

export default function PerfilPage() {
  const { user, profile } = useUser();
  const params = useParams();
  const locale = params.locale as string;

  const logoInputRef = useRef<HTMLInputElement>(null);

  const { docs: docsPersonal } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const personal = parsePersonal(docsPersonal["personal_lista"] ?? "");

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [representanteLegal, setRepresentanteLegal] = useState("");
  const [ruc, setRuc] = useState("");
  const [descripcionEmpresa, setDescripcionEmpresa] = useState("");
  const [procesosEmpresa, setProcesosEmpresa] = useState("");
  const [temaPanel, setTemaPanel] = useState<TemaPanelKey>("oscuro");
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
      setTemaPanel((profile.tema_panel as TemaPanelKey) || "oscuro");
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
          tema_panel: temaPanel,
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

  async function handleCrearColaborador(e: React.FormEvent) {
    e.preventDefault();
    setErrorColab(null);
    setCreado(null);
    const empleado = personal.find((p) => p.id === formColab.empleadoId);
    if (!empleado) {
      setErrorColab("Elegí a la persona (ya cargada en Alta de Personal) a la que le vas a dar acceso.");
      return;
    }
    if (!formColab.email.trim()) {
      setErrorColab("El email de acceso es obligatorio.");
      return;
    }
    setCreandoColab(true);
    try {
      const res = await fetch("/api/dashboard/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formColab.email,
          empleadoId: empleado.id,
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          cargo: empleado.cargo,
          identificacion: empleado.identificacion,
          foto: empleado.foto,
          permisos: conAccesosBaseColaborador(formColab.permisos),
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color de fondo del panel</label>
          <div className="flex items-center gap-3 flex-wrap">
            {(Object.entries(TEMAS_PANEL) as [TemaPanelKey, (typeof TEMAS_PANEL)[TemaPanelKey]][]).map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTemaPanel(key)}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: t.swatch,
                    border: t.isLight ? "1px solid #E5E7EB" : "1px solid rgba(255,255,255,0.15)",
                    boxShadow: temaPanel === key ? "0 0 0 3px #F5A623" : "none",
                  }}
                >
                  {temaPanel === key && (
                    <span style={{ color: t.isLight ? "#1A1A1A" : "#fff" }}>✓</span>
                  )}
                </span>
                <span className="text-[11px] text-gray-500">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={savingEmpresa}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors disabled:opacity-60"
        >
          {savingEmpresa ? "Guardando..." : "Guardar datos de la empresa"}
        </button>
      </form>

      {/* Colaboradores — oculto mientras la cuenta esté en período de
          diagnóstico, para que no se pueda esquivar el bloqueo de módulos
          dándole acceso a un colaborador. */}
      {esPlanDiagnostico(profile?.plan) ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-2xl mb-2">🔒</p>
          <h2 className="font-semibold text-[#1A1A1A] mb-1">Colaboradores</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Esta función se habilita junto con el resto de los módulos cuando se activa el acceso completo de tu
            cuenta.
          </p>
        </div>
      ) : (
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
          {(() => {
            const idsConAcceso = new Set(colaboradores.map((c) => c.empleado_id).filter(Boolean));
            const disponibles = personal.filter((p) => !idsConAcceso.has(p.id));
            const seleccionado = personal.find((p) => p.id === formColab.empleadoId) ?? null;
            return (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Persona (de Alta de Personal)</label>
                  <select
                    value={formColab.empleadoId}
                    onChange={(e) => setFormColab((f) => ({ ...f, empleadoId: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">Seleccioná a quién le das acceso...</option>
                    {disponibles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.apellido} {p.cargo ? `— ${p.cargo}` : ""}
                      </option>
                    ))}
                  </select>
                  {personal.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Todavía no cargaste a nadie en Alta de Personal (Gestión del Talento Humano).
                    </p>
                  )}
                  {personal.length > 0 && disponibles.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">Todo tu personal cargado ya tiene acceso al sistema.</p>
                  )}
                </div>

                {seleccionado && (
                  <div className="flex items-center gap-3 bg-[#FAFAFA] rounded-xl p-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                      {seleccionado.foto && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={seleccionado.foto} alt={seleccionado.nombre} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                        {seleccionado.nombre} {seleccionado.apellido}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{seleccionado.cargo || "—"}</p>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
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
              </>
            );
          })()}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Módulos y actividades que puede trabajar
            </label>
            <SelectorPermisosColaborador value={formColab.permisos} onChange={(p) => setFormColab((f) => ({ ...f, permisos: p }))} />
            <p className="text-[11px] text-gray-400 mt-2">
              Relación de Actividades queda siempre disponible para todos — cada uno ve únicamente la suya.
            </p>
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
                      {c.cargo || "—"} · {resumenPermisos(c.permisos)}
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
      )}
    </div>
  );
}
