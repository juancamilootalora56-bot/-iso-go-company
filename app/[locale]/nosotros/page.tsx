import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import CTABand from "@/components/CTABand";
import HexagonDecor from "@/components/HexagonDecor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros | Iso Go Company",
  description: "Conoce la firma que une certificación ISO con automatización real de procesos.",
};

const values = [
  { icon: "🎯", title: "Resultados concretos", desc: "Medimos nuestro éxito en métricas de negocio, no en documentos entregados." },
  { icon: "⚡", title: "Tecnología de por medio", desc: "Cada proyecto incluye automatización. El papel no cambia empresas, los sistemas sí." },
  { icon: "🤝", title: "Acompañamiento real", desc: "No desaparecemos después del certificado. Somos tu socio de gestión a largo plazo." },
  { icon: "📊", title: "Metodología probada", desc: "15 años perfeccionando un proceso que reduce el tiempo de certificación en un 40%." },
];

const team = [
  {
    name: "Dr. Roberto Iso",
    role: "Director General & Auditor Líder ISO",
    bio: "15 años liderando implementaciones ISO en más de 8 países. Auditor certificado en ISO 9001, 14001, 45001 y 27001.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "Ing. Ana Martínez",
    role: "Directora de Tecnología",
    bio: "Arquitecta del software de gestión ISO Go. Especialista en automatización de procesos y desarrollo de sistemas de trazabilidad.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "Lic. Carlos Vega",
    role: "Director de Implementación",
    bio: "Experto en metodologías Lean y Six Sigma. Lidera el equipo de consultores que acompaña cada proceso de certificación.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
  },
];

const differentiators = [
  {
    num: "01",
    title: "Software propio de gestión",
    desc: "No usamos herramientas genéricas. Desarrollamos un sistema de gestión a medida para cada cliente que integra sus procesos ISO con su operación real.",
  },
  {
    num: "02",
    title: "Metodología de 6 fases",
    desc: "Diagnóstico → Implementación → Automatización → Auditoría → Certificado → Mantenimiento. Cada fase tiene entregables claros y métricas medibles.",
  },
  {
    num: "03",
    title: "Equipo multidisciplinario",
    desc: "Auditores, ingenieros de procesos, desarrolladores de software y especialistas sectoriales trabajando juntos en cada proyecto.",
  },
  {
    num: "04",
    title: "98% de tasa de certificación",
    desc: "En 15 años, el 98% de los clientes que completaron nuestro proceso obtuvieron su certificado en el primer intento de auditoría.",
  },
];

export default async function NosotrosPage() {
  const t = await getTranslations("nosotros");
  const locale = await getLocale();

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
            <span className="text-[#F5A623] text-sm font-bold uppercase tracking-widest">La empresa</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">{t("title")}</h1>
            <p className="text-xl text-gray-300 leading-relaxed">{t("sub")}</p>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-6">{t("history_title")}</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{t("history")}</p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Hoy somos un equipo de más de 30 consultores, ingenieros y desarrolladores distribuidos en América Latina, con proyectos activos en Colombia, México, Argentina, Chile, Perú y Brasil. Cada uno de nuestros consultores es auditor certificado con experiencia en campo — no formamos solo con teoría, formamos con práctica.
              </p>
              <p className="text-gray-700 leading-relaxed">
                La clave de nuestro diferencial: integramos ingeniería de software a cada proceso de certificación. Mientras otras firmas entregan documentación, nosotros entregamos sistemas que funcionan.
              </p>
            </div>
            <div className="relative">
              <video
                src="/video-iso.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="rounded-2xl shadow-xl w-full object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#F5A623] rounded-xl p-4 shadow-xl">
                <div className="text-3xl font-bold text-[#1A1A1A]">200+</div>
                <div className="text-sm text-[#1A1A1A] font-medium">Empresas certificadas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="bg-[#F4F4F4] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">{t("diff_title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {differentiators.map((d) => (
              <div key={d.num} className="bg-white rounded-xl p-8 shadow-sm">
                <span className="text-4xl font-black text-[#F5A623] opacity-50">{d.num}</span>
                <h3 className="text-xl font-bold text-[#1A1A1A] mt-2 mb-3">{d.title}</h3>
                <p className="text-gray-600 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">{t("values_title")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="text-center p-6 rounded-xl border border-gray-100 hover:border-[#F5A623] hover:shadow-md transition-all">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-[#F4F4F4] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">{t("team_title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">{member.name}</h3>
                  <p className="text-[#F5A623] text-sm font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="bg-[#1A1A1A] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">{t("methodology_title")}</h2>
            <p className="text-gray-400 text-lg">Un proceso claro, predecible y orientado al resultado</p>
          </div>
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            {["Diagnóstico", "Diseño", "Implementación", "Automatización", "Certificación", "Mantenimiento"].map((step, i) => (
              <div key={step} className="flex-1 text-center">
                <div className="w-12 h-12 bg-[#F5A623] rounded-full flex items-center justify-center text-[#1A1A1A] font-bold text-lg mx-auto mb-3">
                  {i + 1}
                </div>
                <p className="text-sm font-semibold text-white">{step}</p>
                {i < 5 && (
                  <div className="hidden md:block w-full h-px bg-gray-700 mt-6 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-600">→</div>
                  </div>
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
