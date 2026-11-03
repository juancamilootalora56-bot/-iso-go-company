import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import CTABand from "@/components/CTABand";
import HexagonDecor from "@/components/HexagonDecor";
import type { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import {
  Target,
  ShieldAlert,
  TrendingUp,
  Settings,
  Users,
  Lightbulb,
  Building2,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
  title: "Especialidades | Iso Go Company",
  description: "Transformamos cada área de tu empresa con metodología probada y tecnología aplicada.",
    alternates: buildAlternates(locale, "especialidades"),
  };
}

type Specialty = {
  id: string;
  title: string;
  icon: string;
  tagline: string;
  description: string;
  result: string;
  features: string[];
  image?: string;
};

async function getSpecialties(locale: string): Promise<Specialty[]> {
  const data = await import(`@/content/${locale}/specialties.json`);
  return data.default;
}

const iconMap: Record<string, LucideIcon> = {
  target: Target,
  "shield-alert": ShieldAlert,
  "trending-up": TrendingUp,
  settings: Settings,
  users: Users,
  lightbulb: Lightbulb,
  building: Building2,
};

export default async function EspecialidadesPage() {
  const t = await getTranslations("especialidades");
  const locale = await getLocale();
  const specialties = await getSpecialties(locale);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-10 top-0 bottom-0 w-40 opacity-20" style={{ background: "#F5A623", transform: "skewX(-8deg)" }} />
          <HexagonDecor size={300} color="#F5A623" className="absolute -right-16 -bottom-16 opacity-5" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="text-[#F5A623] text-sm font-bold uppercase tracking-widest">Consultoría especializada</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">{t("title")}</h1>
            <p className="text-xl text-gray-300">{t("sub")}</p>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {specialties.map((spec, index) => (
              <div
                key={spec.id}
                id={spec.id}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  {/* Header: imagen cuadrada + número + título */}
                  <div className="flex items-center gap-4 mb-5">
                    {spec.image ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        <Image
                          src={spec.image}
                          alt={spec.title}
                          fill
                          className="object-cover grayscale-[20%] saturate-75 contrast-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/60 via-[#1A1A1A]/10 to-[#F5A623]/30 mix-blend-multiply" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-[#F5A623] rounded-xl flex items-center justify-center flex-shrink-0">
                        {(() => {
                          const Icon = iconMap[spec.icon] || ClipboardList;
                          return <Icon className="w-7 h-7 text-[#1A1A1A]" strokeWidth={2} />;
                        })()}
                      </div>
                    )}
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Especialidad {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3">{spec.title}</h2>
                  <p className="text-[#F5A623] font-semibold text-lg mb-4 italic">"{spec.tagline}"</p>
                  <p className="text-gray-700 leading-relaxed mb-6">{spec.description}</p>

                  <div className="bg-gradient-to-br from-[#262626] to-[#1A1A1A] rounded-xl p-4 mb-6 shadow-sm">
                    <h4 className="text-[#F5A623] text-xs font-bold uppercase tracking-wider mb-2">Resultado que obtienes</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{spec.result}</p>
                  </div>

                  <Link
                    href={`/${locale}/contacto`}
                    className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-3 rounded-lg hover:bg-[#e09410] transition-colors inline-block"
                  >
                    Cotiza esta especialidad →
                  </Link>
                </div>

                <div className={`${index % 2 === 1 ? "lg:order-1" : ""} bg-gradient-to-br from-[#F4F4F4] to-[#ECECEC] rounded-2xl p-8 shadow-sm`}>
                  <h4 className="font-bold text-[#1A1A1A] mb-4">Lo que incluye</h4>
                  <ul className="space-y-3">
                    {spec.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#F5A623] rounded-full flex items-center justify-center mt-0.5">
                          <svg className="w-3.5 h-3.5 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Family business highlight */}
      <section className="bg-[#F5A623] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="w-10 h-10 text-[#1A1A1A]" strokeWidth={1.75} />
          </div>
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">Especialistas en Empresas Familiares</h2>
          <p className="text-[#1A1A1A] text-lg mb-6 leading-relaxed">
            Las empresas familiares tienen retos únicos: confusión entre roles familiares y empresariales, dificultad para atraer talento externo, y desafíos de sucesión. Trabajamos con ellas para construir estructuras de gobierno corporativo que profesionalizan sin perder la esencia familiar.
          </p>
          <Link
            href={`/${locale}/contacto`}
            className="bg-[#1A1A1A] text-white font-bold px-8 py-4 rounded-lg hover:bg-[#333] transition-colors inline-block"
          >
            Habla con un especialista →
          </Link>
        </div>
      </section>

      <CTABand />
    </>
  );
}
