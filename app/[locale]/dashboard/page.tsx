"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { createClient } from "@/lib/supabase/client";
import { ITEMS_GERENCIA } from "@/lib/gestionGerenciaItems";
import { estaCompletoActividad, contarRiesgos } from "@/lib/gestionGerenciaCompletitud";
import { parseObjetivos } from "@/lib/objetivosCalidad";
import AvanceModulosChart from "@/components/dashboard/AvanceModulosChart";
import CalendarioResumenWidget from "@/components/dashboard/CalendarioResumenWidget";
import DiagnosticoResumenWidget from "@/components/dashboard/DiagnosticoResumenWidget";
import MapaProcesosOrbitWidget from "@/components/dashboard/MapaProcesosOrbitWidget";
import { temaPanelDe } from "@/lib/temaPanel";
import { tieneAccesoReal } from "@/lib/colaboradoresCliente";
import { parsePersonal } from "@/lib/personal";
import { esPlanDiagnostico } from "@/lib/planCuenta";

const NORM_SLUGS: Record<string, string> = {
  "ISO 9001": "iso-9001",
  "ISO 14001": "iso-14001",
  "ISO 45001": "iso-45001",
  "ISO/IEC 27001": "iso-27001",
  "ISO 22000": "iso-22000",
  "ISO 13485": "iso-13485",
  "Kosher": "kosher",
};

const NORM_ICONS: Record<string, string> = {
  "ISO 9001": "⭐",
  "ISO 14001": "🌿",
  "ISO 45001": "🦺",
  "ISO/IEC 27001": "🔒",
  "ISO 22000": "🍽️",
  "ISO 13485": "🏥",
  "Kosher": "✡️",
  "Otro": "📋",
};

const AVAILABLE_DEMOS = new Set(["ISO 9001", "ISO 14001", "ISO 45001", "ISO/IEC 27001", "ISO 22000"]);

export default function DashboardPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { user, profile } = useUser();
  const { user: effectiveUser, profile: effectiveProfile, colaborador } = useDashboardUser();
  const { docs: docsGerencia, loading: loadingGerencia } = useGestionDocumentos("gerencia", effectiveUser?.id ?? null);
  const { docs: docsTH, loading: loadingTH } = useGestionDocumentos("talento_humano", effectiveUser?.id ?? null);
  const [colaboradoresCount, setColaboradoresCount] = useState(0);

  useEffect(() => {
    if (!effectiveUser) return;
    (async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from("client_colaboradores")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", effectiveUser.id);
      setColaboradoresCount(count ?? 0);
    })();
  }, [effectiveUser]);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Usuario";
  const interestedNorms = profile?.interested_norms || [];

  const actividadesCompletas = ITEMS_GERENCIA.filter((i) => estaCompletoActividad(i.key, docsGerencia)).length;
  const objetivosCount = parseObjetivos(docsGerencia["objetivos_calidad"] ?? "").length;
  const riesgosCount = contarRiesgos(docsGerencia);
  const tema = temaPanelDe(effectiveProfile?.tema_panel);
  const esDiagnostico = esPlanDiagnostico(effectiveProfile?.plan);

  // Evita el "flash" de tema por defecto: todo colaborador recién creado
  // también tiene su propia fila en `profiles` (la crea un trigger de la
  // base al dar de alta su login), pero esa fila es un esqueleto sin
  // company_name/tema_panel — solo el perfil del DUEÑO los tiene. Si
  // effectiveProfile todavía no es el del dueño (se está resolviendo),
  // mostramos una carga neutra en vez de pintar el tema/branding
  // equivocado por un instante.
  if (colaborador && !effectiveProfile?.company_name) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Colaborador sin ningún módulo asignado todavía: en vez del panel
  // general, ve su propia ficha de personal en modo lectura.
  if (colaborador && !tieneAccesoReal(colaborador.permisos)) {
    const miFicha = parsePersonal(docsTH["personal_lista"] ?? "").find((p) => p.id === colaborador.empleadoId);
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-[#1A1A1A] p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {miFicha?.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={miFicha.foto} alt={miFicha.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-white/50">👤</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-white text-lg font-bold truncate">
                {miFicha ? `${miFicha.nombre} ${miFicha.apellido}` : displayName}
              </h1>
              <p className="text-[#F5A623] text-sm font-semibold truncate">{miFicha?.cargo || "Sin cargo asignado"}</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500">
              Todavía no tenés ningún módulo habilitado. Cuando el administrador de tu empresa te dé acceso a una
              actividad, vas a verla acá en el menú.
            </p>
            {miFicha && (
              <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="bg-[#FAFAFA] rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Área</p>
                  <p className="text-sm text-[#1A1A1A] mt-0.5">{miFicha.area || "—"}</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Email</p>
                  <p className="text-sm text-[#1A1A1A] mt-0.5">{miFicha.email || "—"}</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Teléfono</p>
                  <p className="text-sm text-[#1A1A1A] mt-0.5">{miFicha.telefono || "—"}</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Fecha de ingreso</p>
                  <p className="text-sm text-[#1A1A1A] mt-0.5">{miFicha.fechaIngreso || "—"}</p>
                </div>
              </div>
            )}
            <Link
              href={`/${locale}/dashboard/gestion-operativa/relacion_actividades`}
              className="inline-block text-sm font-semibold hover:opacity-80"
              style={{ color: "#F5A623" }}
            >
              Ir a mi Relación de Actividades →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(to bottom right, ${tema.bgFrom}, ${tema.bgTo})`,
          border: `1px solid ${tema.cardBorder}`,
        }}
      >
        {/* Grilla de fondo */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, ${tema.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${tema.gridColor} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow decorativo */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#F5A623]/20 rounded-full blur-3xl" />

        {/* Logo de la empresa como marca de agua */}
        {effectiveProfile?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={effectiveProfile.logo_url}
            alt=""
            className="absolute right-6 bottom-0 w-56 h-56 object-contain opacity-[0.06] pointer-events-none select-none"
          />
        )}

        <div className="relative p-6 sm:p-10">
          {/* Badges */}
          <div className="flex items-center flex-wrap gap-2 mb-6">
            <span className="bg-[#F5A623] text-[#1A1A1A] text-[11px] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-full">
              Sistema de Gestión ISO 9001
            </span>
            <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-600 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Sincronizado
            </span>
            <span
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full"
              style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}`, color: tema.textMuted }}
            >
              🔒 Datos protegidos
            </span>
          </div>

          {/* Título */}
          <p className="text-sm mb-1" style={{ color: tema.textMuted }}>Bienvenido, {displayName}</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight" style={{ color: tema.textPrimary }}>
            {effectiveProfile?.company_name || "Tu empresa"}
          </h1>
          <p className="text-[#F5A623] text-sm sm:text-base font-semibold mt-1">Panel de Gestión de Calidad</p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { icon: "📋", value: loadingGerencia ? "—" : `${actividadesCompletas}/${ITEMS_GERENCIA.length}`, label: "Actividades" },
              { icon: "🎯", value: loadingGerencia ? "—" : objetivosCount, label: "Objetivos de Calidad" },
              { icon: "⚠️", value: loadingGerencia ? "—" : riesgosCount, label: "Riesgos identificados" },
              { icon: "👥", value: colaboradoresCount, label: "Colaboradores" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4"
                style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}
              >
                <p className="text-xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-bold" style={{ color: tema.textPrimary }}>{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: tema.textMuted }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Accesos rápidos */}
          <div className="mt-8">
            <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: tema.textMuted }}>Accesos rápidos</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(esDiagnostico
                ? [
                    { href: "/diagnostico", icon: "🔍", label: "Realizar diagnóstico" },
                    { href: "/perfil", icon: "👤", label: "Mi Perfil" },
                    { href: "/mi-certificacion", icon: "🏆", label: "Mi Certificación" },
                  ]
                : [
                    { href: "/gestion-gerencia", icon: "🏛️", label: "Gestión de la Gerencia" },
                    { href: "/gestion-gerencia/objetivos_calidad", icon: "🎯", label: "Objetivos de Calidad" },
                    { href: "/gestion-gerencia/estructura_organizacional/resultado", icon: "🧩", label: "Organigrama" },
                    { href: "/perfil", icon: "👤", label: "Colaboradores" },
                  ]
              ).map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}/dashboard${item.href}`}
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm transition-colors hover:border-[#F5A623]/40"
                  style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}`, color: tema.textPrimary }}
                >
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
              {esDiagnostico && (
                <a
                  href="https://wa.me/595992442381"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition-colors bg-[#F5A623] text-[#1A1A1A] hover:bg-[#e09410]"
                >
                  <span>💬</span>
                  <span className="truncate">Hablar con un asesor</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner de período de diagnóstico */}
      {esDiagnostico && (
        <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden flex flex-col sm:flex-row items-center gap-5">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />
          <div className="relative z-10 w-14 h-14 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center flex-shrink-0 text-2xl">
            🔍
          </div>
          <div className="relative z-10 flex-1 text-center sm:text-left">
            <p className="text-[#F5A623] text-[11px] font-bold uppercase tracking-wide">Período de diagnóstico</p>
            <h2 className="text-white text-lg font-bold mt-0.5">Estás explorando el panel antes de activar tu sistema completo</h2>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              Hacé tu diagnóstico con el botón de abajo y hablá con un asesor para activar Gerencia, Talento Humano,
              Compras, Comercial, Operativa, Diseño y Desarrollo y Calidad — con tu sistema de gestión funcionando de
              punta a punta.
            </p>
          </div>
          <a
            href="https://wa.me/595992442381"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm flex-shrink-0 whitespace-nowrap"
          >
            Hablar con un asesor →
          </a>
        </div>
      )}

      {/* Mapa de Procesos — vista interactiva con la empresa en el centro */}
      {!esDiagnostico && <MapaProcesosOrbitWidget docs={docsGerencia} loading={loadingGerencia} />}

      {/* Calendario de Colaboradores */}
      <CalendarioResumenWidget docs={docsTH} loading={loadingTH} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Avance por módulo */}
        <AvanceModulosChart userId={effectiveUser?.id ?? null} docsGerencia={docsGerencia} loadingGerencia={loadingGerencia} />

        {/* CTA card */}
        <div
          className="rounded-xl p-6 relative overflow-hidden"
          style={{ background: `linear-gradient(to bottom right, ${tema.bgFrom}, ${tema.bgTo})` }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <p className="text-[#F5A623] text-sm font-semibold mb-2">¿Listo para comenzar?</p>
            <h3 className="text-xl font-bold mb-3" style={{ color: tema.textPrimary }}>
              Realiza tu diagnóstico
            </h3>
            <p className="text-sm mb-5" style={{ color: tema.textMuted }}>
              Evaluá tu Sistema de Gestión de Calidad contra ISO 9001:2015 y recibí un resultado inmediato con tus
              próximos pasos.
            </p>
            <Link
              href={`/${locale}/dashboard/diagnostico`}
              className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm"
            >
              Empezar diagnóstico →
            </Link>
          </div>
        </div>
      </div>

      {/* Diagnóstico ISO 9001 — indicadores por cláusula */}
      <DiagnosticoResumenWidget />

      {/* Demos section */}
      {interestedNorms.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#1A1A1A]">Demos disponibles para ti</h2>
            <Link href={`/${locale}/dashboard/demos`} className="text-sm text-[#F5A623] font-medium hover:text-[#e09410]">
              Ver todas →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {interestedNorms.slice(0, 6).map((norm) => {
              const slug = NORM_SLUGS[norm];
              const available = AVAILABLE_DEMOS.has(norm);
              return (
                <div key={norm} className="border border-gray-100 rounded-lg p-4 hover:border-[#F5A623]/30 transition-colors">
                  <p className="text-2xl mb-2">{NORM_ICONS[norm] || "📋"}</p>
                  <p className="font-medium text-sm text-[#1A1A1A]">{norm}</p>
                  {available && slug ? (
                    <Link
                      href={`/${locale}/demos/${slug}`}
                      className="mt-2 text-xs text-[#F5A623] font-medium hover:text-[#e09410]"
                    >
                      Explorar demo →
                    </Link>
                  ) : (
                    <p className="mt-2 text-xs text-gray-400">🔒 Próximamente</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="font-semibold text-[#1A1A1A] mb-4">Actividad reciente</h2>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">📭</span>
          </div>
          <p className="text-gray-500 text-sm">Aún no hay actividad registrada</p>
          <p className="text-gray-400 text-xs mt-1">
            Explora los demos para comenzar tu camino hacia la certificación
          </p>
        </div>
      </div>
    </div>
  );
}
