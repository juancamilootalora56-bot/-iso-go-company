import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import CTABand from "@/components/CTABand";
import HexagonDecor from "@/components/HexagonDecor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Software de Gestión ISO | Iso Go Company",
  description: "Plataforma de gestión ISO que hace que tu certificación trabaje todos los días del año.",
};

const features = [
  {
    icon: "📊",
    title: "Dashboards de gestión en tiempo real",
    desc: "Visualiza el cumplimiento de tu sistema ISO en tiempo real. Indicadores por proceso, área y norma en un solo panel. Sin reportes manuales, sin Excel, sin esperar el mes.",
  },
  {
    icon: "⚠️",
    title: "Alertas automáticas de no conformidades",
    desc: "Cuando un indicador sale del rango aceptable, el sistema notifica automáticamente al responsable con el protocolo de acción a seguir. Las no conformidades no se pierden ni se demoran.",
  },
  {
    icon: "📁",
    title: "Gestión documental con control de versiones",
    desc: "Todos tus procedimientos, instructivos y registros en un repositorio centralizado con control de versiones, aprobaciones digitales y alertas de vencimiento.",
  },
  {
    icon: "🔗",
    title: "Trazabilidad completa de procesos",
    desc: "Para industrias alimentarias, manufactura y salud: trazabilidad de lote desde la materia prima hasta el producto terminado. Cada paso registrado y auditable en segundos.",
  },
  {
    icon: "📅",
    title: "Preparación automatizada para auditorías",
    desc: "El sistema genera automáticamente el paquete de evidencias para auditoría interna y externa. Saber si estás listo para ser auditado es un clic.",
  },
  {
    icon: "📈",
    title: "Indicadores de desempeño por proceso",
    desc: "KPIs personalizados para cada proceso certificado. Tendencias históricas, análisis de causa raíz y planes de mejora integrados en la misma plataforma.",
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
            {/* Mock UI */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-gray-400 text-xs ml-2">Plataforma ISO Go — Vista general</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Procesos OK", val: "94%", color: "text-green-400" },
                    { label: "NC Abiertas", val: "2", color: "text-yellow-400" },
                    { label: "Docs vencidos", val: "0", color: "text-green-400" },
                    { label: "Auditoría", val: "45d", color: "text-blue-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-700 rounded-lg p-2 text-center">
                      <div className={`font-bold ${s.color}`}>{s.val}</div>
                      <div className="text-gray-500 text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-3 font-semibold uppercase tracking-wide">Alertas activas</div>
                  <div className="space-y-2">
                    {[
                      { text: "NC-047: Proveedor sin evaluación — vence en 3 días", type: "warning" },
                      { text: "Indicador satisfacción cliente bajo umbral mínimo", type: "alert" },
                      { text: "Documento PR-012 por aprobar — espera 2 días", type: "info" },
                    ].map((alert) => (
                      <div key={alert.text} className={`text-xs px-3 py-2 rounded ${
                        alert.type === "warning" ? "bg-yellow-900/40 text-yellow-300" :
                        alert.type === "alert" ? "bg-red-900/40 text-red-300" :
                        "bg-blue-900/40 text-blue-300"
                      }`}>
                        {alert.text}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-2 font-semibold uppercase tracking-wide">Cumplimiento por norma</div>
                  {[
                    { norm: "ISO 9001", pct: 97 },
                    { norm: "ISO 14001", pct: 91 },
                    { norm: "ISO 45001", pct: 89 },
                  ].map((n) => (
                    <div key={n.norm} className="mb-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{n.norm}</span><span>{n.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-600 rounded-full">
                        <div className="h-1.5 bg-[#F5A623] rounded-full" style={{ width: `${n.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                <div className="text-3xl mb-4">{f.icon}</div>
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
