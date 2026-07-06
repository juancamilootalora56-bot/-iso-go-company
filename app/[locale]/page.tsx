import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import CTABand from "@/components/CTABand";
import HexagonDecor, { HexagonOutline } from "@/components/HexagonDecor";
import HeroCarousel from "@/components/HeroCarousel";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "hero" });
  return {
    title: "Iso Go Company | Certificación ISO + Automatización",
    description: t("headline"),
  };
}

const processSteps = [
  {
    num: "01",
    key: "diagnostico",
    icon: "🔍",
    desc: "Analizamos tu empresa para identificar brechas frente al estándar y diseñar el plan más eficiente.",
  },
  {
    num: "02",
    key: "implementacion",
    icon: "⚙️",
    desc: "Documentamos procesos, capacitamos equipos e implementamos controles con nuestra metodología probada.",
  },
  {
    num: "03",
    key: "automatizacion",
    icon: "💻",
    desc: "Desplegamos el software de gestión a medida: dashboards, alertas, control documental y trazabilidad.",
  },
  {
    num: "04",
    key: "auditoria",
    icon: "📋",
    desc: "Preparamos a tu equipo y acompañamos la auditoría con el organismo certificador elegido.",
  },
  {
    num: "05",
    key: "certificado",
    icon: "🏆",
    desc: "Obtienes el certificado ISO con el respaldo de un sistema que opera, no un papel en la pared.",
  },
  {
    num: "06",
    key: "mantenimiento",
    icon: "🔄",
    desc: "Mantenemos tu sistema actualizado, gestionamos no conformidades y preparamos auditorías de seguimiento.",
  },
];

const featuredCerts = [
  {
    id: "iso-9001",
    name: "ISO 9001",
    title: "Calidad",
    tagline: "Procesos que se repiten sin depender de una sola persona",
    benefit: "Reduce costos operativos 15-25%",
    color: "from-amber-50 to-amber-100",
    border: "border-amber-200",
  },
  {
    id: "iso-14001",
    name: "ISO 14001",
    title: "Medio Ambiente",
    tagline: "Accede a licitaciones verdes y reduce residuos",
    benefit: "Reduce residuos hasta 30%",
    color: "from-green-50 to-green-100",
    border: "border-green-200",
  },
  {
    id: "iso-45001",
    name: "ISO 45001",
    title: "Seguridad Laboral",
    tagline: "Menos accidentes, menos multas, equipos protegidos",
    benefit: "Reduce accidentes hasta 60%",
    color: "from-blue-50 to-blue-100",
    border: "border-blue-200",
  },
  {
    id: "iso-27001",
    name: "ISO/IEC 27001",
    title: "Seguridad de la Información",
    tagline: "Protege datos y abre mercados tecnológicos exigentes",
    benefit: "Cumplimiento RGPD y LGPD",
    color: "from-purple-50 to-purple-100",
    border: "border-purple-200",
  },
  {
    id: "iso-22000",
    name: "ISO 22000",
    title: "Inocuidad Alimentaria",
    tagline: "Exporta alimentos a los mercados más exigentes del mundo",
    benefit: "Acceso a mercados UE, EEUU, Asia",
    color: "from-orange-50 to-orange-100",
    border: "border-orange-200",
  },
  {
    id: "iso-50001",
    name: "ISO 50001",
    title: "Energía",
    tagline: "Sistema de gestión energética que se paga solo",
    benefit: "Ahorra hasta 30% en energía",
    color: "from-yellow-50 to-yellow-100",
    border: "border-yellow-200",
  },
];

const testimonials = [
  {
    company: "Grupo Manufactura Del Norte",
    sector: "Manufactura",
    quote:
      "Implementamos ISO 9001 con Iso Go y en 8 meses teníamos el certificado. Lo sorprendente fue el software: ahora veo en tiempo real si un proceso está fallando antes de que llegue al cliente.",
    metric: "−23% costos operativos",
    author: "Carlos Méndez, Director de Operaciones",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    company: "Alimentos Del Valle",
    sector: "Alimentos",
    quote:
      "Con ISO 22000 + el sistema de trazabilidad que desarrollaron, logramos exportar a Europa en 14 meses. Cada lote tiene trazabilidad total desde el campo hasta el destino final.",
    metric: "+340% ventas de exportación",
    author: "María Rodríguez, Gerente Comercial",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    company: "TechSalud Colombia",
    sector: "Tecnología Médica",
    quote:
      "La combinación de ISO 13485 + ISO/IEC 27001 nos abrió el mercado hospitalario en 5 países. Iso Go no solo nos certificó, nos construyó el sistema de calidad que opera solo.",
    metric: "Acceso a 5 nuevos mercados",
    author: "Andrés López, CEO",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face",
  },
];

export default async function HomePage() {
  const t = await getTranslations("hero");
  const tp = await getTranslations("process");
  const tt = await getTranslations("testimonials");
  const locale = await getLocale();

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel locale={locale} />

      {/* Featured certifications */}
      <section className="bg-[#F4F4F4] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              Certificaciones que transforman tu empresa
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cada norma ISO tiene un impacto concreto en tu negocio. Aquí está la prueba.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCerts.map((cert) => (
              <Link
                key={cert.id}
                href={`/${locale}/certificaciones#${cert.id}`}
                className={`bg-gradient-to-br ${cert.color} border ${cert.border} rounded-xl p-6 hover:shadow-lg transition-shadow group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{cert.name}</span>
                  <HexagonDecor size={32} color="#F5A623" className="opacity-40 group-hover:opacity-70 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{cert.title}</h3>
                <p className="text-gray-700 text-sm mb-4">{cert.tagline}</p>
                <span className="inline-block bg-[#F5A623] text-[#1A1A1A] text-xs font-bold px-3 py-1 rounded-full">
                  {cert.benefit}
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href={`/${locale}/certificaciones`}
              className="bg-[#1A1A1A] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#333] transition-colors inline-block"
            >
              Ver todas las certificaciones →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Band 1 */}
      <CTABand />

      {/* Process steps */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">{tp("title")}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{tp("sub")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step) => (
              <div key={step.num} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-[#F5A623] rounded-xl flex items-center justify-center text-2xl">
                      {step.icon}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F5A623] uppercase tracking-wider mb-1">Paso {step.num}</div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      {tp(`steps.${step.key}` as Parameters<typeof tp>[0])}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiator: Software */}
      <section className="bg-[#1A1A1A] py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <HexagonDecor size={400} color="#F5A623" className="absolute -right-24 -top-24 opacity-5" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#F5A623] text-sm font-bold uppercase tracking-widest">Nuestra ventaja</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-6">
                El certificado ISO es el punto de partida, no el destino
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Desarrollamos software de gestión a medida que integra tu sistema ISO en la operación diaria. No más carpetas de procedimientos que nadie lee. Tu equipo trabaja con el sistema, no para el sistema.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Dashboards con indicadores de gestión en tiempo real",
                  "Alertas automáticas de no conformidades",
                  "Gestión documental con control de versiones",
                  "Trazabilidad completa de procesos productivos",
                  "Preparación automática para auditorías",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-[#F5A623] rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/software`}
                className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-3 rounded-lg hover:bg-[#e09410] transition-colors inline-block"
              >
                Conoce la plataforma →
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                {/* Mock dashboard */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-gray-500 text-xs ml-2">Dashboard ISO Go — Gestión de Calidad</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Cumplimiento", value: "96%", color: "text-green-400" },
                    { label: "No Conformidades", value: "3", color: "text-yellow-400" },
                    { label: "Auditoría", value: "62 días", color: "text-blue-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-700 rounded-lg p-3">
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-700 rounded-lg p-3 mb-3">
                  <div className="text-gray-400 text-xs mb-2">Indicadores del mes</div>
                  {[
                    { label: "Satisfacción cliente", pct: 94 },
                    { label: "Eficiencia proceso", pct: 87 },
                    { label: "Documentación al día", pct: 100 },
                  ].map((ind) => (
                    <div key={ind.label} className="mb-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{ind.label}</span>
                        <span>{ind.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-600 rounded-full">
                        <div
                          className="h-1.5 bg-[#F5A623] rounded-full"
                          style={{ width: `${ind.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3">
                  <div className="text-yellow-400 text-xs font-bold mb-1">⚠ Alerta — Acción requerida</div>
                  <div className="text-gray-400 text-xs">No conformidad en proceso de compras — vence en 5 días</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band 2 */}
      <CTABand variant="gold" />

      {/* Testimonials */}
      <section className="bg-[#F4F4F4] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">{tt("title")}</h2>
            <p className="text-lg text-gray-600">{tt("sub")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.company} className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#F5A623]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-700 text-sm leading-relaxed mb-6 italic">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <Image
                    src={t.image}
                    alt={t.author}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{t.author}</p>
                    <p className="text-xs text-gray-500">{t.company}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="inline-block bg-[#F5A623] text-[#1A1A1A] text-xs font-bold px-3 py-1 rounded-full">
                    {t.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href={`/${locale}/casos-de-exito`}
              className="border-2 border-[#1A1A1A] text-[#1A1A1A] font-bold px-8 py-3 rounded-lg hover:bg-[#1A1A1A] hover:text-white transition-colors inline-block"
            >
              Ver todos los casos de éxito →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <CTABand />
    </>
  );
}
