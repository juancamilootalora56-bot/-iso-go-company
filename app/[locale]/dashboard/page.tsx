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
  const { user: effectiveUser, profile: effectiveProfile } = useDashboardUser();
  const { docs: docsGerencia, loading: loadingGerencia } = useGestionDocumentos("gerencia", effectiveUser?.id ?? null);
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-2xl overflow-hidden border border-white/5">
        {/* Grilla de fondo */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
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
            <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Sincronizado
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-300 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
              🔒 Datos protegidos
            </span>
          </div>

          {/* Título */}
          <p className="text-gray-400 text-sm mb-1">Bienvenido, {displayName}</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
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
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Accesos rápidos */}
          <div className="mt-8">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-3">Accesos rápidos</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { href: "/gestion-gerencia", icon: "🏛️", label: "Gestión de la Gerencia" },
                { href: "/gestion-gerencia/objetivos_calidad", icon: "🎯", label: "Objetivos de Calidad" },
                { href: "/gestion-gerencia/estructura_organizacional/resultado", icon: "🧩", label: "Organigrama" },
                { href: "/perfil", icon: "👤", label: "Colaboradores" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}/dashboard${item.href}`}
                  className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:border-[#F5A623]/30 transition-colors"
                >
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Avance por módulo */}
        <AvanceModulosChart docsGerencia={docsGerencia} loading={loadingGerencia} />

        {/* CTA card */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <p className="text-[#F5A623] text-sm font-semibold mb-2">¿Listo para comenzar?</p>
            <h3 className="text-white text-xl font-bold mb-3">
              Agenda tu diagnóstico gratuito
            </h3>
            <p className="text-gray-400 text-sm mb-5">
              Un experto ISO analizará tu empresa y te dirá exactamente qué necesitas para certificarte.
            </p>
            <Link
              href={`/${locale}/contacto`}
              className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm"
            >
              Agendar ahora →
            </Link>
          </div>
        </div>
      </div>

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
