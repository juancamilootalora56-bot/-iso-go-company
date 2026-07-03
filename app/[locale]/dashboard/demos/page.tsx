"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const DEMOS = [
  {
    slug: "iso-9001",
    name: "ISO 9001",
    subtitle: "Gestión de Calidad",
    icon: "⭐",
    description: "Controla tus procesos, reduce no conformidades y mejora la satisfacción del cliente.",
    available: true,
  },
  {
    slug: "iso-14001",
    name: "ISO 14001",
    subtitle: "Gestión Ambiental",
    icon: "🌿",
    description: "Gestiona tus aspectos ambientales, reduce impactos y cumple con la legislación.",
    available: true,
  },
  {
    slug: "iso-45001",
    name: "ISO 45001",
    subtitle: "Seguridad y Salud Laboral",
    icon: "🦺",
    description: "Identifica peligros, controla riesgos y protege a tu equipo de trabajo.",
    available: true,
  },
  {
    slug: "iso-27001",
    name: "ISO/IEC 27001",
    subtitle: "Seguridad de la Información",
    icon: "🔒",
    description: "Protege tus activos de información, gestiona riesgos y cumple con requisitos de seguridad.",
    available: true,
  },
  {
    slug: "iso-22000",
    name: "ISO 22000",
    subtitle: "Inocuidad Alimentaria",
    icon: "🍽️",
    description: "Controla puntos críticos HACCP, trazabilidad y seguridad en tu cadena alimentaria.",
    available: true,
  },
  {
    slug: "iso-13485",
    name: "ISO 13485",
    subtitle: "Dispositivos Médicos",
    icon: "🏥",
    description: "Sistema de gestión de calidad especializado para la industria de dispositivos médicos.",
    available: false,
  },
  {
    slug: "iso-50001",
    name: "ISO 50001",
    subtitle: "Gestión de Energía",
    icon: "⚡",
    description: "Optimiza el consumo energético, reduce costos y mejora el desempeño ambiental.",
    available: false,
  },
  {
    slug: "kosher",
    name: "Kosher",
    subtitle: "Certificación Kosher",
    icon: "✡️",
    description: "Accede al mercado judío mundial con la certificación de inocuidad alimentaria Kosher.",
    available: false,
  },
];

export default function DemosPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Demos disponibles</h1>
        <p className="text-gray-500 text-sm mt-1">
          Explora cómo funcionará tu sistema de gestión antes de comenzar
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMOS.map((demo) => (
          <div
            key={demo.slug}
            className={`bg-white rounded-xl border p-6 flex flex-col transition-all ${
              demo.available
                ? "border-gray-100 hover:border-[#F5A623]/40 hover:shadow-md"
                : "border-gray-100 opacity-75"
            }`}
          >
            <div className="text-3xl mb-3">{demo.icon}</div>
            <div className="mb-1">
              <p className="font-bold text-[#1A1A1A]">{demo.name}</p>
              <p className="text-xs text-gray-500">{demo.subtitle}</p>
            </div>
            <p className="text-sm text-gray-600 mt-2 flex-1 leading-relaxed">{demo.description}</p>
            <div className="mt-4">
              {demo.available ? (
                <Link
                  href={`/${locale}/demos/${demo.slug}`}
                  className="inline-flex items-center gap-1.5 bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410] transition-colors"
                >
                  Explorar demo →
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-400 font-medium text-sm px-4 py-2 rounded-lg cursor-not-allowed">
                  🔒 Próximamente
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
