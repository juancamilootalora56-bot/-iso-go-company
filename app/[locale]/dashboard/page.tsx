"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";

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

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Usuario";
  const registeredDate = user?.created_at ? new Date(user.created_at) : new Date();
  const daysSince = Math.floor((Date.now() - registeredDate.getTime()) / (1000 * 60 * 60 * 24));
  const interestedNorms = profile?.interested_norms || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          Bienvenido, {displayName} 👋
        </h1>
        {profile?.company_name && (
          <p className="text-gray-500 mt-1">
            {profile.company_name}
            {profile.sector && (
              <span className="ml-2 text-xs bg-[#F5A623]/10 text-[#F5A623] px-2 py-0.5 rounded-full font-medium">
                {profile.sector}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Días en plataforma", value: daysSince, icon: "📅" },
          { label: "Demos exploradas", value: 0, icon: "🎮" },
          { label: "Documentos subidos", value: 0, icon: "📄" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-3xl font-bold text-[#1A1A1A]">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Certification progress card */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1A1A1A]">Tu proceso de certificación</h2>
            <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-full font-medium">
              En inicio
            </span>
          </div>
          <div className="space-y-3">
            {[
              { step: 1, label: "Diagnóstico inicial", status: "pendiente" },
              { step: 2, label: "Implementación", status: "locked" },
              { step: 3, label: "Certificado + Mantenimiento", status: "locked" },
            ].map(({ step, label, status }) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    status === "pendiente"
                      ? "bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step}
                </div>
                <span className={`text-sm ${status === "locked" ? "text-gray-400" : "text-[#1A1A1A] font-medium"}`}>
                  {label}
                  {status === "locked" && " 🔒"}
                </span>
                {status === "pendiente" && (
                  <span className="ml-auto text-xs text-[#F5A623] font-medium">Pendiente</span>
                )}
              </div>
            ))}
          </div>
          <Link
            href={`/${locale}/dashboard/progreso`}
            className="mt-4 block text-sm text-[#F5A623] font-medium hover:text-[#e09410]"
          >
            Ver progreso completo →
          </Link>
        </div>

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
