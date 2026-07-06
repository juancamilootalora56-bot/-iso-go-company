import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import CTABand from "@/components/CTABand";
import HexagonDecor from "@/components/HexagonDecor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificación Kosher | Iso Go Company",
  description: "Accede a mercados de alto valor con certificación Kosher. El mismo sistema de trazabilidad que usamos para ISO 9001/22000.",
};

const processSteps = [
  {
    step: "01",
    title: "Evaluación inicial",
    desc: "Analizamos tus instalaciones, ingredientes y procesos productivos para identificar los requisitos de adecuación.",
  },
  {
    step: "02",
    title: "Plan de adecuación",
    desc: "Definimos los cambios necesarios en instalaciones, equipos, proveedores e ingredientes para cumplir la normativa Kosher.",
  },
  {
    step: "03",
    title: "Implementación del sistema",
    desc: "Implementamos el sistema de trazabilidad con la misma plataforma usada para ISO 9001/22000 — sin duplicar esfuerzo.",
  },
  {
    step: "04",
    title: "Inspección rabínica",
    desc: "Coordinamos la inspección con el organismo certificador Kosher y acompañamos el proceso hasta la aprobación.",
  },
  {
    step: "05",
    title: "Certificado y sello",
    desc: "Obtienes el certificado Kosher con el sello reconocido internacionalmente y el plan de mantenimiento anual.",
  },
];

const markets = [
  {
    region: "América del Norte",
    detail: "EE.UU. y Canadá: mercado Kosher de USD 12.5 mil millones/año",
    image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=200&h=200&fit=crop&crop=center&q=85",
  },
  {
    region: "Israel y Medio Oriente",
    detail: "Exportación directa a mercados con 100% de demanda Kosher",
    image: "https://images.unsplash.com/photo-1552423310-6c74990c7099?w=200&h=200&fit=crop&crop=center&q=85",
  },
  {
    region: "Europa",
    detail: "Comunidades judías en UK, Francia, Alemania, Argentina-España",
    image: "https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=200&h=200&fit=crop&crop=center&q=85",
  },
  {
    region: "Latinoamérica",
    detail: "Argentina, Brasil, México — comunidades grandes y en crecimiento",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=200&h=200&fit=crop&crop=center&q=85",
  },
  {
    region: "Retail premium",
    detail: "Cadenas como Whole Foods, Trader Joe's, Marks & Spencer",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop&crop=center&q=85",
  },
  {
    region: "Food service",
    detail: "Hoteles, aerolíneas y catering internacional con requisito Kosher",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop&crop=center&q=85",
  },
];

export default async function KosherPage() {
  const t = await getTranslations("kosher");
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
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="text-[#F5A623] text-sm font-bold uppercase tracking-widest">Certificación especializada</span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">{t("title")}</h1>
              <p className="text-xl text-gray-300 leading-relaxed">{t("sub")}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href={`/${locale}/contacto`} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-8 py-4 rounded-lg hover:bg-[#e09410] transition-colors text-center">
                  Cotiza tu certificación Kosher →
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center justify-center gap-5">
              <Image
                src="/kosher.png"
                alt="Certificación Kosher"
                width={280}
                height={280}
                className="object-contain drop-shadow-2xl brightness-0 invert"
              />
              <p className="text-center text-white/80 text-sm font-light tracking-widest uppercase max-w-[260px] leading-relaxed border-t border-white/20 pt-4">
                Celebramos una alianza diseñada para elevar el estándar de tu empresa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Kosher */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-6">¿Qué significa ser Kosher y por qué importa para tu negocio?</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Kosher es el conjunto de leyes dietéticas judías que regulan qué alimentos son aptos para el consumo y cómo deben ser preparados. Un producto Kosher certificado no solo puede venderse a comunidades judías — se ha convertido en un sello de calidad y trazabilidad reconocido globalmente.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                El mercado Kosher global supera los USD 24 mil millones anuales y crece a más del 10% por año. Gran parte de los compradores de productos Kosher no son judíos: son consumidores que asocian el sello con mayor calidad, higiene y control de producción.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Para tu empresa, la certificación Kosher significa acceso a canales de distribución premium, diferenciación en mercados de exportación y la posibilidad de atender a uno de los segmentos con mayor poder adquisitivo del mercado alimentario internacional.
              </p>
            </div>
            <div>
              <Image
                src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=450&fit=crop"
                alt="Producción de alimentos Kosher"
                width={600}
                height={450}
                className="rounded-2xl object-cover shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Market access */}
      <section className="bg-[#F4F4F4] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">Mercados que se abren con la certificación Kosher</h2>
            <p className="text-gray-600 text-lg">No es solo cumplir una norma religiosa. Es acceder a mercados de alto valor con demanda insatisfecha.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((m) => (
              <div key={m.region} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                    <Image
                      src={m.image}
                      alt={m.region}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-[#1A1A1A] leading-snug">{m.region}</h3>
                </div>
                <p className="text-gray-600 text-sm">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ISO Synergy */}
      <section className="bg-[#1A1A1A] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Kosher + ISO 9001/22000: la combinación que multiplica mercados</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Nuestra ventaja única: usamos el mismo sistema de trazabilidad que implementamos para ISO 9001 e ISO 22000 para la certificación Kosher. No empezamos de cero, no duplicamos documentación, no creamos dos sistemas paralelos.
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                El inspector Kosher verifica que cada ingrediente, cada proceso y cada lote cumpla con la normativa. Nuestro software de trazabilidad genera esa evidencia automáticamente — el mismo sistema que ya mantiene tu certificado ISO activo.
              </p>
              <ul className="space-y-3">
                {[
                  "Trazabilidad de ingredientes hasta el proveedor de origen",
                  "Control de lotes con registro completo del proceso",
                  "Alertas automáticas si un ingrediente no certificado entra en producción",
                  "Documentación lista para la inspección rabínica anual",
                  "Integración total con el sistema ISO existente",
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
            </div>
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-[#F5A623] font-bold text-sm uppercase tracking-wider mb-4">Sistema integrado Kosher + ISO</h3>
              <div className="space-y-3">
                {[
                  { label: "Trazabilidad de lote", status: "Activo", icon: "✅" },
                  { label: "Control de ingredientes Kosher", status: "Certificado", icon: "✅" },
                  { label: "Inspección rabínica", status: "Próx: 15 Mar", icon: "📅" },
                  { label: "Conformidad ISO 22000", status: "98%", icon: "📊" },
                  { label: "Documentos vigentes", status: "47/47", icon: "📁" },
                  { label: "No conformidades abiertas", status: "0", icon: "🎯" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-3">
                    <span className="text-gray-300 text-sm">{item.icon} {item.label}</span>
                    <span className="text-[#F5A623] text-sm font-semibold">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">El proceso de certificación Kosher</h2>
            <p className="text-gray-600 text-lg">De 4 a 8 meses para obtener el sello, dependiendo de la complejidad del proceso productivo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 bg-[#F5A623] rounded-xl flex items-center justify-center text-[#1A1A1A] font-bold text-lg mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-bold text-[#1A1A1A] text-sm mb-2">{step.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{step.desc}</p>
                {i < processSteps.length - 1 && (
                  <div className="hidden md:block text-[#F5A623] text-xl mt-4">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
