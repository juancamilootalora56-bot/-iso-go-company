import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import CTABand from "@/components/CTABand";
import HexagonDecor from "@/components/HexagonDecor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casos de Éxito | Iso Go Company",
  description: "Empresas que transformaron su gestión con Iso Go Company. Resultados concretos y métricas reales.",
};

const cases = [
  {
    sector: "Manufactura",
    company: "Grupo Manufactura Del Norte",
    country: "México",
    norms: ["ISO 9001", "ISO 14001"],
    image: "https://images.unsplash.com/photo-1565371767810-ef913a1a4f7e?w=500&h=300&fit=crop",
    challenge: "Empresa manufacturera con 450 empleados, procesos dependientes de personas clave y rechazos de producto por parte de clientes corporativos.",
    solution: "Implementamos ISO 9001 e ISO 14001 simultáneamente con el sistema de gestión integrado. Automatizamos el control de calidad en línea y el seguimiento de no conformidades.",
    results: [
      "−23% en costos operativos en 12 meses",
      "−67% en rechazos de producto",
      "Acceso a 3 nuevos contratos corporativos",
      "Certificado obtenido en 9 meses",
    ],
    quote: "El software de gestión cambió todo. Ahora cualquier miembro del equipo puede mantener el sistema — no depende de mí ni de nadie.",
    author: "Carlos Méndez, Director de Operaciones",
    authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    sector: "Alimentos",
    company: "Alimentos Del Valle",
    country: "Colombia",
    norms: ["ISO 22000", "Kosher"],
    image: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=500&h=300&fit=crop",
    challenge: "Productora de alimentos con capacidad exportadora pero sin las certificaciones que exigen los mercados de Europa y Estados Unidos.",
    solution: "ISO 22000 con sistema de trazabilidad de lote completo + certificación Kosher integrada en el mismo sistema. Un proceso, dos certificados.",
    results: [
      "+340% en ventas de exportación en 18 meses",
      "Ingreso al mercado de EE.UU. y Alemania",
      "Trazabilidad de lote en menos de 30 segundos",
      "Cero rechazos en inspecciones de aduana",
    ],
    quote: "Exportar a Europa era un sueño que parecía lejano. Con Iso Go lo logramos en 14 meses y con un sistema que nos da ventaja real frente a competidores.",
    author: "María Rodríguez, Gerente Comercial",
    authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    sector: "Tecnología Médica",
    company: "TechSalud Colombia",
    country: "Colombia",
    norms: ["ISO 13485", "ISO/IEC 27001"],
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=300&fit=crop",
    challenge: "Empresa de tecnología médica que no podía vender sus dispositivos en hospitales de alta complejidad ni exportar a Latinoamérica por falta de certificaciones regulatorias.",
    solution: "Implementación paralela de ISO 13485 + ISO/IEC 27001 con sistema de gestión de calidad integrado a los procesos de diseño y desarrollo de dispositivos.",
    results: [
      "Acceso a licitaciones hospitalarias en 5 países",
      "Ingreso al mercado de Perú, Chile, Ecuador y Panamá",
      "−45% en tiempo de respuesta a incidentes de calidad",
      "Primer cliente enterprise firmado 60 días post-certificación",
    ],
    quote: "Teníamos producto de calidad mundial pero no podíamos demostrarlo. ISO 13485 nos dio el pasaporte. El sistema de gestión nos dio la operación que lo sostiene.",
    author: "Andrés López, CEO",
    authorImage: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face",
  },
  {
    sector: "Construcción",
    company: "Constructora Edificar",
    country: "Argentina",
    norms: ["ISO 9001", "ISO 45001", "ISO 14001"],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&h=300&fit=crop",
    challenge: "Constructora mediana con alta siniestralidad laboral, problemas de calidad en entregables y dificultad para acceder a licitaciones de obra pública.",
    solution: "Triple certificación ISO 9001 + 45001 + 14001 (SSOMA) con sistema de gestión integrado y app móvil para el personal de obra.",
    results: [
      "−78% en accidentes laborales en 12 meses",
      "Acceso a licitaciones de gobierno y oil & gas",
      "Premio a la obra más segura del sector en 2024",
      "Reducción del 35% en costos de seguros y siniestros",
    ],
    quote: "Teníamos 3 accidentes graves por año. En los últimos 18 meses: cero. Y encima ganamos 4 licitaciones que antes ni podíamos intentar.",
    author: "Roberto Salgado, Gerente de SSOMA",
    authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  },
  {
    sector: "Salud",
    company: "Clínica Integral San Marcos",
    country: "Perú",
    norms: ["ISO 9001", "ISO/IEC 27001"],
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=500&h=300&fit=crop",
    challenge: "Clínica privada con problemas de gestión de historias clínicas, brechas de seguridad de datos y pérdida de pacientes por mala experiencia de servicio.",
    solution: "ISO 9001 para procesos clínicos y de servicio al paciente + ISO/IEC 27001 para protección de datos de salud. Sistema integrado de gestión de pacientes.",
    results: [
      "+52% en satisfacción del paciente (NPS: de 34 a 71)",
      "Cero brechas de seguridad de datos en 24 meses",
      "Cumplimiento de normativa peruana de datos de salud",
      "Acreditación JCI en proceso (primera clínica de la región)",
    ],
    quote: "Pasamos de ser una clínica con problemas operativos a ser la referencia de calidad en la ciudad. El sistema ISO no fue un trámite — fue la transformación de cómo trabajamos.",
    author: "Dra. Patricia Vásquez, Directora Médica",
    authorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face",
  },
];

const sectors = ["Todos", "Manufactura", "Alimentos", "Tecnología Médica", "Construcción", "Salud"];

export default async function CasosPage() {
  const t = await getTranslations("casos");
  const locale = await getLocale();

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
            <span className="text-[#F5A623] text-sm font-bold uppercase tracking-widest">Resultados reales</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">{t("title")}</h1>
            <p className="text-xl text-gray-300">{t("sub")}</p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#F5A623] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "200+", label: "Empresas certificadas" },
              { value: "12", label: "Sectores atendidos" },
              { value: "8", label: "Países de alcance" },
              { value: "98%", label: "Tasa de éxito en primera auditoría" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-black text-[#1A1A1A]">{stat.value}</div>
                <div className="text-sm text-[#1A1A1A] font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {cases.map((c, i) => (
              <div key={c.company} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ${i % 2 === 1 ? "" : ""}`}>
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="relative rounded-2xl overflow-hidden">
                    <Image
                      src={c.image}
                      alt={c.company}
                      width={500}
                      height={300}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                      {c.norms.map((n) => (
                        <span key={n} className="bg-[#F5A623] text-[#1A1A1A] text-xs font-bold px-2 py-1 rounded">{n}</span>
                      ))}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white text-[#1A1A1A] text-xs font-semibold px-3 py-1 rounded-full">
                      {c.sector} · {c.country}
                    </div>
                  </div>
                </div>

                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">{c.company}</h2>
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">El desafío</h3>
                    <p className="text-gray-700 text-sm">{c.challenge}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">La solución</h3>
                    <p className="text-gray-700 text-sm">{c.solution}</p>
                  </div>
                  <div className="bg-[#F4F4F4] rounded-xl p-4 mb-4">
                    <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-3">Resultados</h3>
                    <ul className="space-y-2">
                      {c.results.map((r) => (
                        <li key={r} className="flex items-start gap-2">
                          <span className="text-[#F5A623] font-bold">→</span>
                          <span className="text-[#1A1A1A] text-sm font-medium">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <blockquote className="border-l-4 border-[#F5A623] pl-4">
                    <p className="text-gray-700 text-sm italic mb-2">"{c.quote}"</p>
                    <div className="flex items-center gap-2">
                      <Image src={c.authorImage} alt={c.author} width={32} height={32} className="rounded-full object-cover" />
                      <span className="text-xs text-gray-500 font-semibold">{c.author}</span>
                    </div>
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand />

      {/* Sectors grid */}
      <section className="bg-[#F4F4F4] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">Trabajamos con empresas de todos los sectores</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Manufactura", "Alimentos y Bebidas", "Salud y Farmacia", "Tecnología", "Construcción", "Logística", "Minería", "Servicios", "Retail", "Agroindustria", "Laboratorios", "Energía"].map((s) => (
              <span key={s} className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full hover:border-[#F5A623] hover:text-[#1A1A1A] transition-colors cursor-default">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CTABand variant="gold" />
    </>
  );
}
