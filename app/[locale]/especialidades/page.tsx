import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import CTABand from "@/components/CTABand";
import HexagonDecor from "@/components/HexagonDecor";
import type { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { Building2 } from "lucide-react";
import SpecialtyLateralAccordion from "@/components/SpecialtyLateralAccordion";

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

export default async function EspecialidadesPage() {
  const t = await getTranslations("especialidades");
  const locale = await getLocale();
  const specialties = await getSpecialties(locale);
  const accordionItems = specialties.map((spec, index) => ({
    id: spec.id,
    number: String(index + 1).padStart(2, "0"),
    title: spec.title,
    tagline: spec.tagline,
    description: spec.description,
    result: spec.result,
    features: spec.features,
    image: spec.image,
    icon: spec.icon,
    href: `/${locale}/contacto`,
    ctaLabel: "Cotiza esta especialidad →",
  }));

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
          <SpecialtyLateralAccordion items={accordionItems} />
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
