import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import CTABand from "@/components/CTABand";
import HexagonDecor from "@/components/HexagonDecor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificaciones ISO | Iso Go Company",
  description: "Catálogo completo de certificaciones ISO. Cada norma con su beneficio concreto para tu empresa.",
};

type Certification = {
  id: string;
  name: string;
  title: string;
  tagline: string;
  description: string;
  who: string;
  impact: string;
  featured: boolean;
  icon: string;
  image?: string;
};

async function getCertifications(locale: string): Promise<Certification[]> {
  const data = await import(`@/content/${locale}/certifications.json`);
  return data.default;
}

const iconMap: Record<string, string> = {
  award: "🏆",
  leaf: "🌿",
  shield: "🛡️",
  lock: "🔐",
  utensils: "🍽️",
  "heart-pulse": "❤️",
  zap: "⚡",
  "refresh-cw": "🔄",
  "eye-off": "👁️",
  brain: "🧠",
  flask: "🧪",
};

export default async function CertificacionesPage() {
  const t = await getTranslations("certificaciones");
  const locale = await getLocale();
  const certs = await getCertifications(locale);

  const featured = certs.filter((c) => c.featured);
  const rest = certs.filter((c) => !c.featured);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -left-10 top-0 bottom-0 w-40 opacity-20"
            style={{ background: "#F5A623", transform: "skewX(-8deg)" }}
          />
          <HexagonDecor size={300} color="#F5A623" className="absolute -right-16 -bottom-16 opacity-5" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="text-[#F5A623] text-sm font-bold uppercase tracking-widest">Nuestros servicios</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">{t("title")}</h1>
            <p className="text-xl text-gray-300">{t("sub")}</p>
          </div>
        </div>
      </section>

      {/* Featured: ISO 9001 */}
      {featured.map((cert) => (
        <section key={cert.id} id={cert.id} className="bg-[#F5A623] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <span className="inline-block bg-[#1A1A1A] text-[#F5A623] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                  Norma estrella
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-2">{cert.name}</h2>
                <h3 className="text-xl md:text-2xl font-semibold text-[#1A1A1A] mb-4">{cert.title}</h3>
                <p className="text-base md:text-xl text-[#1A1A1A] font-medium mb-6 italic">"{cert.tagline}"</p>
                <p className="text-[#1A1A1A] leading-relaxed mb-6">{cert.description}</p>
                <Link
                  href={`/${locale}/contacto`}
                  className="bg-[#1A1A1A] text-white font-bold px-8 py-4 rounded-lg hover:bg-[#333] transition-colors inline-block"
                >
                  {t("cta")} →
                </Link>
              </div>
              <div>
                <Image
                  src="/certificacion-9001.jpg"
                  alt="Certificación ISO 9001 - Iso Go Company"
                  width={700}
                  height={500}
                  className="rounded-2xl shadow-xl w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* All other certifications */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-12">Todas las certificaciones</h2>
          <div className="space-y-8">
            {rest.map((cert, index) => (
              <div
                key={cert.id}
                id={cert.id}
                className={`rounded-2xl p-8 ${index % 2 === 0 ? "bg-[#F4F4F4]" : "bg-white border border-gray-100"}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  <div className="lg:col-span-2">
                    {/* Header: imagen cuadrada + nombre + título */}
                    <div className="flex items-start gap-4 mb-5">
                      {cert.image ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                          <Image
                            src={cert.image}
                            alt={cert.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {iconMap[cert.icon] || "📋"}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">{cert.name}</span>
                        <h3 className="text-2xl font-bold text-[#1A1A1A]">{cert.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-700 italic mb-3 text-lg">"{cert.tagline}"</p>
                    <p className="text-gray-600 leading-relaxed mb-4">{cert.description}</p>
                    <Link
                      href={`/${locale}/contacto`}
                      className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors inline-block"
                    >
                      {t("cta")} →
                    </Link>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">¿A quién aplica?</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{cert.who}</p>
                    </div>
                    <div className="bg-[#1A1A1A] rounded-xl p-4">
                      <h4 className="text-xs font-bold text-[#F5A623] uppercase tracking-wider mb-2">Impacto</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{cert.impact}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
