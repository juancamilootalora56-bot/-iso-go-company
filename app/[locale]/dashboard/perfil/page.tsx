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
import { RADIO_METROS_DEFECTO, type Sede } from "@/lib/sedesEmpresa";
import { Building2, Palette, Users, Check, Pencil, Power, Trash2, UserPlus, X, MapPin, LocateFixed } from "lucide-react";

const MAX_LOGO_BYTES = 800_000; // ~800KB

// Mismos colores que usa la barra lateral del dashboard para cada módulo —
// así las chips de permisos de un colaborador se leen igual en todos lados.
const COLOR_MODULO: Record<string, string> = {
  gerencia: "#6366F1",
  talento_humano: "#EC4899",
  compras: "#10B981",
  comercial: "#3B82F6",
  operativa: "#8B5CF6",
  diseno_desarrollo: "#14B8A6",
  calidad: "#F97316",
};

function colaboradorVacio() {
  return {
    empleadoId: "",
    email: "",
    password: "",
    permisos: {} as PermisosColaborador,
  };
}

type TabKey = "organizacion" | "apariencia" | "sedes" | "colaboradores";

const TABS: { key: TabKey; label: string; icon: typeof Building2 }[] = [
  { key: "organizacion", label: "Organización", icon: Building2 },
  { key: "apariencia", label: "Apariencia", icon: Palette },
  { key: "sedes", label: "Sedes", icon: MapPin },
  { key: "colaboradores", label: "Colaboradores", icon: Users },
];

function sedeVacia() {
  return { nombre: "", direccion: "", radioMetros: String(RADIO_METROS_DEFECTO), lat: null as number | null, lng: null as number | null };
}

export default function PerfilPage() {
  const { user, profile } = useUser();
  const params = useParams();
  const locale = params.locale as string;

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<TabKey>("organizacion");

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

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loadingSedes, setLoadingSedes] = useState(true);
  const [mostrarFormSede, setMostrarFormSede] = useState(false);
  const [formSede, setFormSede] = useState(sedeVacia());
  const [capturandoUbicacion, setCapturandoUbicacion] = useState(false);
  const [errorSede, setErrorSede] = useState<string | null>(null);
  const [guardandoSede, setGuardandoSede] = useState(false);

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(true);
  const [mostrarFormColab, setMostrarFormColab] = useState(false);
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

  async function cargarSedes() {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("sedes_empresa")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at");
    setSedes(data ?? []);
    setLoadingSedes(false);
  }

  useEffect(() => {
    cargarSedes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function capturarUbicacionSede() {
    if (!navigator.geolocation) {
      setErrorSede("Tu navegador no soporta geolocalización.");
      return;
    }
    setErrorSede(null);
    setCapturandoUbicacion(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormSede((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setCapturandoUbicacion(false);
      },
      () => {
        setErrorSede("No se pudo obtener tu ubicación. Revisá que le hayas dado permiso al navegador y volvé a intentar parado en la sede.");
        setCapturandoUbicacion(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function handleCrearSede(e: React.FormEvent) {
    e.preventDefault();
    setErrorSede(null);
    if (!formSede.nombre.trim()) {
      setErrorSede("Ponele un nombre a la sede (ej: Casa Matriz, Sucursal Centro).");
      return;
    }
    if (formSede.lat === null || formSede.lng === null) {
      setErrorSede("Primero capturá la ubicación, parado físicamente en la sede.");
      return;
    }
    const radio = parseInt(formSede.radioMetros, 10);
    if (!radio || radio < 10) {
      setErrorSede("El radio permitido debe ser de al menos 10 metros.");
      return;
    }
    setGuardandoSede(true);
    const supabase = createClient();
    const { error } = await supabase.from("sedes_empresa").insert({
      profile_id: user!.id,
      nombre: formSede.nombre.trim(),
      direccion: formSede.direccion.trim() || null,
      latitud: formSede.lat,
      longitud: formSede.lng,
      radio_metros: radio,
    });
    setGuardandoSede(false);
    if (error) {
      setErrorSede("Error al guardar la sede. Intentá de nuevo.");
      return;
    }
    setFormSede(sedeVacia());
    setMostrarFormSede(false);
    await cargarSedes();
  }

  async function eliminarSede(id: string, nombre: string) {
    if (!confirm(`¿Eliminar la sede "${nombre}"? Los colaboradores asignados a ella van a quedar sin sede.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("sedes_empresa").delete().eq("id", id);
    if (!error) setSedes((prev) => prev.filter((s) => s.id !== id));
  }

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
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/15 transition-colors";

  const nombreIniciales = (companyName || "ISO")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden mb-6">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#242424] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="w-full h-full object-contain p-1.5" />
            ) : (
              <span className="text-[#F5A623] font-extrabold">{nombreIniciales}</span>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#F5A623" }}>
              Mi cuenta
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Mi Perfil</h1>
            <p className="text-gray-400 text-sm mt-0.5">Datos de tu empresa, apariencia y accesos de tu equipo</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Navegación de pestañas */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible lg:w-52 flex-shrink-0 pb-1 lg:pb-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            const activo = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  activo ? "bg-[#1A1A1A] text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} className="flex-shrink-0" style={{ color: activo ? "#F5A623" : undefined }} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Contenido de la pestaña */}
        <div className="flex-1 min-w-0">
          {tab === "organizacion" && (
            <form onSubmit={handleSaveEmpresa} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div>
                <h2 className="font-semibold text-[#1A1A1A]">Contexto de la Organización</h2>
                <p className="text-xs text-gray-500 mt-1">
                  El logo y los datos de tu empresa van a personalizar todo tu sistema: van a aparecer en el panel y
                  en los documentos que generes (Misión, Visión, Política de Calidad, etc.).
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
                    className="group relative w-24 h-24 rounded-2xl bg-[#FAFAFA] border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 p-2.5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Building2 size={28} className="text-gray-300" />
                    )}
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Pencil size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
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
          )}

          {tab === "apariencia" && (
            <form onSubmit={handleSaveEmpresa} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div>
                <h2 className="font-semibold text-[#1A1A1A]">Apariencia del panel</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Elegí el color de fondo que ven vos y tu equipo en el dashboard — incluye una vista previa real.
                </p>
              </div>

              {savedEmpresa && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  Apariencia actualizada correctamente.
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {(Object.entries(TEMAS_PANEL) as [TemaPanelKey, (typeof TEMAS_PANEL)[TemaPanelKey]][]).map(([key, t]) => {
                  const activo = temaPanel === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTemaPanel(key)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <span
                        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden flex flex-col transition-all"
                        style={{
                          background: `linear-gradient(135deg, ${t.bgFrom}, ${t.bgTo})`,
                          boxShadow: activo ? "0 0 0 3px #F5A623" : "0 0 0 1px rgba(0,0,0,0.06)",
                        }}
                      >
                        <span
                          className="absolute inset-0 opacity-[0.07] pointer-events-none"
                          style={{
                            backgroundImage: `linear-gradient(to right, ${t.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${t.gridColor} 1px, transparent 1px)`,
                            backgroundSize: "9px 9px",
                          }}
                        />
                        <span className="relative flex-1 m-2 rounded-md" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }} />
                        <span
                          className="relative mx-2 mb-2 h-1.5 w-8 rounded-full"
                          style={{ background: t.textPrimary, opacity: 0.85 }}
                        />
                        {activo && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#F5A623] flex items-center justify-center">
                            <Check size={10} strokeWidth={3.5} className="text-[#1A1A1A]" />
                          </span>
                        )}
                      </span>
                      <span className={`text-[11px] ${activo ? "text-[#1A1A1A] font-bold" : "text-gray-500"}`}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={savingEmpresa}
                className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors disabled:opacity-60"
              >
                {savingEmpresa ? "Guardando..." : "Guardar apariencia"}
              </button>
            </form>
          )}

          {tab === "sedes" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
                  <div>
                    <h2 className="font-semibold text-[#1A1A1A]">Sedes de la empresa</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Cargá cada local o sede una sola vez, parado físicamente ahí. Control de Asistencia usa esta
                      ubicación para validar que un colaborador marque entrada/salida solo cuando está en su sede.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormSede((v) => !v);
                      setErrorSede(null);
                      setFormSede(sedeVacia());
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-3.5 py-2 rounded-lg flex-shrink-0"
                  >
                    {mostrarFormSede ? <X size={14} /> : <MapPin size={14} />}
                    {mostrarFormSede ? "Cerrar" : "Agregar sede"}
                  </button>
                </div>

                {errorSede && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errorSede}</div>
                )}

                {mostrarFormSede && (
                  <form onSubmit={handleCrearSede} className="mt-5 pt-5 border-t border-gray-100 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nombre de la sede</label>
                        <input
                          value={formSede.nombre}
                          onChange={(e) => setFormSede((f) => ({ ...f, nombre: e.target.value }))}
                          className={inputClass}
                          placeholder="Ej: Casa Matriz"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Dirección (opcional, solo referencia)</label>
                        <input
                          value={formSede.direccion}
                          onChange={(e) => setFormSede((f) => ({ ...f, direccion: e.target.value }))}
                          className={inputClass}
                          placeholder="Ej: Av. España 123"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Radio permitido (metros)</label>
                        <input
                          type="number"
                          min={10}
                          value={formSede.radioMetros}
                          onChange={(e) => setFormSede((f) => ({ ...f, radioMetros: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Ubicación</label>
                        <button
                          type="button"
                          onClick={capturarUbicacionSede}
                          disabled={capturandoUbicacion}
                          className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:border-[#F5A623] transition-colors disabled:opacity-60"
                        >
                          <LocateFixed size={16} className={capturandoUbicacion ? "animate-pulse" : ""} />
                          {capturandoUbicacion
                            ? "Obteniendo ubicación..."
                            : formSede.lat !== null
                              ? "Ubicación capturada ✓ — volver a capturar"
                              : "Usar mi ubicación actual"}
                        </button>
                        {formSede.lat !== null && (
                          <p className="text-[11px] text-gray-400 mt-1">
                            {formSede.lat.toFixed(5)}, {formSede.lng!.toFixed(5)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Importante: pará físicamente en la sede antes de tocar &quot;Usar mi ubicación actual&quot;.
                    </p>
                    <button
                      type="submit"
                      disabled={guardandoSede}
                      className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors disabled:opacity-60"
                    >
                      {guardandoSede ? "Guardando..." : "Guardar sede"}
                    </button>
                  </form>
                )}
              </div>

              {loadingSedes ? (
                <p className="text-gray-400 text-sm">Cargando...</p>
              ) : sedes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
                  Todavía no cargaste ninguna sede.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {sedes.map((s) => (
                    <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-start gap-3">
                        <span className="w-10 h-10 rounded-full bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0">
                          <MapPin size={16} style={{ color: "#F5A623" }} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{s.nombre}</p>
                          <p className="text-xs text-gray-500 truncate">{s.direccion || "Sin dirección de referencia"}</p>
                          <p className="text-[11px] text-gray-400 mt-1">Radio permitido: {s.radio_metros} m</p>
                        </div>
                        <button
                          onClick={() => eliminarSede(s.id, s.nombre)}
                          title="Eliminar sede"
                          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "colaboradores" &&
            (esPlanDiagnostico(profile?.plan) ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <p className="text-2xl mb-2">🔒</p>
                <h2 className="font-semibold text-[#1A1A1A] mb-1">Colaboradores</h2>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Esta función se habilita junto con el resto de los módulos cuando se activa el acceso completo de
                  tu cuenta.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
                    <div>
                      <h2 className="font-semibold text-[#1A1A1A]">Colaboradores</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Creá accesos para tu equipo. A cada colaborador le asignás qué módulos de Gestión puede
                        trabajar.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {colaboradores.length > 0 && (
                        <Link
                          href={`/${locale}/dashboard/perfil/colaboradores/resultado`}
                          className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
                        >
                          Ver matriz ({colaboradores.length}) →
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => setMostrarFormColab((v) => !v)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-3.5 py-2 rounded-lg"
                      >
                        {mostrarFormColab ? <X size={14} /> : <UserPlus size={14} />}
                        {mostrarFormColab ? "Cerrar" : "Agregar colaborador"}
                      </button>
                    </div>
                  </div>

                  {errorColab && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errorColab}</div>
                  )}
                  {creado && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                      <p className="text-green-700 font-semibold mb-1">Colaborador creado. Compartile estos datos de acceso:</p>
                      <p className="text-[#1A1A1A]">
                        Email: <span className="font-mono font-semibold">{creado.email}</span>
                      </p>
                      <p className="text-[#1A1A1A]">
                        Contraseña: <span className="font-mono font-semibold">{creado.password}</span>
                      </p>
                    </div>
                  )}

                  {mostrarFormColab && (
                    <form onSubmit={handleCrearColaborador} className="mt-5 pt-5 border-t border-gray-100 space-y-4">
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
                  )}
                </div>

                {loadingColaboradores ? (
                  <p className="text-gray-400 text-sm">Cargando...</p>
                ) : colaboradores.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
                    Todavía no creaste ningún colaborador.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {colaboradores.map((c) => {
                      const modulosActivos = MODULOS_PERMISOS.filter((m) => tieneAccesoModulo(c.permisos, m.modulo));
                      return (
                        <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-gray-400 font-bold text-sm">
                              {c.foto ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.foto} alt={c.nombre} className="w-full h-full object-cover" />
                              ) : (
                                `${c.nombre[0] ?? ""}${c.apellido[0] ?? ""}`
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#1A1A1A] truncate flex items-center gap-1.5">
                                {c.nombre} {c.apellido}
                                {!c.activo && (
                                  <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full uppercase">
                                    Inactivo
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{c.cargo || c.email || "—"}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => toggleActivoColab(c.id, c.activo)}
                                title={c.activo ? "Desactivar" : "Reactivar"}
                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                                  c.activo ? "text-green-500 hover:bg-green-50" : "text-gray-300 hover:bg-gray-100"
                                }`}
                              >
                                <Power size={14} />
                              </button>
                              <button
                                onClick={() => eliminarColaborador(c.id, c.nombre)}
                                title="Eliminar"
                                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
                            {modulosActivos.length === 0 ? (
                              <span className="text-[11px] text-gray-300 italic">Sin módulos asignados</span>
                            ) : (
                              modulosActivos.map((m) => {
                                const p = c.permisos[m.modulo];
                                const completo = p && "completo" in p && p.completo;
                                const cant = actividadesVisibles(c.permisos, m.modulo).length;
                                const color = COLOR_MODULO[m.modulo] ?? "#6B7280";
                                return (
                                  <span
                                    key={m.modulo}
                                    className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
                                    style={{ background: `${color}14`, color }}
                                  >
                                    {m.icon} {m.label.replace("Gestión de la ", "").replace("Gestión de ", "").replace("Gestión ", "")}
                                    {!completo && ` (${cant})`}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
