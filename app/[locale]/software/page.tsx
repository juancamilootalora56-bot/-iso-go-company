import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import CTABand from "@/components/CTABand";
import HexagonDecor from "@/components/HexagonDecor";
import type { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { BarChart3, Users, FolderCog, AlertTriangle, Puzzle, TrendingUp } from "lucide-react";
import SoftwareWorkflowAnimation from "@/components/SoftwareWorkflowAnimation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
  title: "Software de Gestión ISO | Iso Go Company",
  description: "Plataforma de gestión ISO que hace que tu certificación trabaje todos los días del año.",
    alternates: buildAlternates(locale, "software"),
  };
}

const features = [
  {
    icon: BarChart3,
    title: "Dashboards de gestión en tiempo real",
    desc: "Visualiza el cumplimiento de tu sistema ISO en tiempo real. Avance por módulo, objetivos de calidad y riesgos identificados en un solo panel. Sin reportes manuales, sin Excel, sin esperar el mes.",
  },
  {
    icon: Users,
    title: "Permisos granulares por colaborador",
    desc: "Cada persona de tu equipo ve solo lo que necesita. Dale acceso a un módulo completo, a una actividad puntual, a una etapa de un proceso, o a un documento específico — vos elegís el nivel de detalle, sin compartir de más.",
  },
  {
    icon: FolderCog,
    title: "Gestión documental con control de versiones",
    desc: "Procedimientos, instructivos y formatos organizados por proceso, cada uno con su versión, vigencia y estado (vigente, en revisión, obsoleto). Todo centralizado y trazable.",
  },
  {
    icon: AlertTriangle,
    title: "No Conformidades con matriz y gráficos",
    desc: "Cada caso queda registrado con etapa de detección, severidad, causa raíz y costo de no calidad. Una matriz tipo Excel y gráficos automáticos te muestran dónde están los problemas reales.",
  },
  {
    icon: Puzzle,
    title: "Diseño y Desarrollo paso a paso",
    desc: "Seguí cada proyecto nuevo según la cláusula 8.3 de ISO 9001: planificación, entradas, salidas, revisión, verificación, validación y cierre, con el avance siempre visible.",
  },
  {
    icon: TrendingUp,
    title: "Indicadores de desempeño por proceso",
    desc: "KPIs por módulo (Calidad, Compras, Diseño y Desarrollo), con tendencias históricas y análisis que te ayudan a priorizar dónde actuar primero.",
  },
];

const integrations = [
  "ISO 9001", "ISO 14001", "ISO 45001", "ISO/IEC 27001",
  "ISO 22000", "ISO 13485", "ISO 50001", "Kosher",
  "ISO 22301", "ISO/IEC 17025",
];

export default async function SoftwarePage() {
  const t = await getTranslations("software");
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
            <span className="text-[#F5A623] text-sm font-bold uppercase tracking-widest">Tecnología propia</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">{t("title")}</h1>
            <p className="text-xl text-gray-300 leading-relaxed">{t("sub")}</p>
            <div className="mt-8">
              <Link href={`/${locale}/contacto`} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-8 py-4 rounded-lg hover:bg-[#e09410] transition-colors inline-block">
                Solicita una demo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value prop */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-6">
                Un certificado ISO sin sistema de gestión activo es papel mojado
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                El 60% de las empresas certificadas ISO no mantienen activo su sistema entre auditorías. Guardan los documentos, pasan la auditoría cada 3 años y siguen trabajando exactamente igual que antes. El certificado no genera ningún valor.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                La plataforma ISO Go cambia eso radicalmente. En lugar de un sistema de gestión que vive en carpetas, construimos uno que vive en la operación diaria de tu empresa. Tu equipo trabaja con él todos los días sin notarlo — y el sistema ISO se mantiene solo.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { value: "98%", label: "Cumplimiento promedio en auditorías" },
                  { value: "−40%", label: "Menos tiempo preparando auditorías" },
                  { value: "3x", label: "Más rápido detectar no conformidades" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 bg-[#F4F4F4] rounded-xl">
                    <div className="text-2xl font-bold text-[#F5A623]">{stat.value}</div>
                    <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mapa animado: un avatar recorriendo los módulos reales de la plataforma */}
            <SoftwareWorkflowAnimation />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#F4F4F4] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">Todo lo que necesitas para mantener vivo tu certificado</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#F5A623]/10 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-[#F5A623]" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="bg-[#1A1A1A] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Compatible con todas las normas que implementamos</h2>
          <p className="text-gray-400 mb-10">Un solo sistema para gestionar múltiples certificaciones simultáneamente</p>
          <div className="flex flex-wrap justify-center gap-3">
            {integrations.map((norm) => (
              <span key={norm} className="border border-[#F5A623] text-[#F5A623] text-sm font-semibold px-4 py-2 rounded-full">
                {norm}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CTABand variant="gold" />

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">¿Cómo se integra con tu certificación?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Diagnóstico", desc: "Mapeamos tus procesos y definimos los módulos necesarios para tu sistema de gestión." },
              { step: "2", title: "Configuración a medida", desc: "Configuramos la plataforma con tus indicadores, responsables y flujos de aprobación específicos." },
              { step: "3", title: "Integración y capacitación", desc: "Integramos con tus herramientas actuales y capacitamos al equipo en menos de 2 semanas." },
              { step: "4", title: "Sistema en marcha", desc: "Tu sistema ISO opera solo. Tú revisas el dashboard, el sistema hace el trabajo." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-[#F5A623] rounded-full flex items-center justify-center text-[#1A1A1A] font-bold text-xl mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-[#1A1A1A] mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
