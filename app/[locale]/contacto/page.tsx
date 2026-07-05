import { getTranslations, getLocale } from "next-intl/server";
import ContactForm from "@/components/ContactForm";
import HexagonDecor from "@/components/HexagonDecor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto y Cotización | Iso Go Company",
  description: "Cotiza tu certificación ISO. Respuesta en menos de 24 horas con plan personalizado.",
};

const contactInfo = [
  { icon: "📧", label: "Email", value: "info@isogocompany.com", href: "mailto:info@isogocompany.com" },
  { icon: "📱", label: "WhatsApp", value: "+595 99 244 2381", href: "https://wa.me/595992442381" },
  { icon: "🌐", label: "Web", value: "isogo.company", href: "https://isogo.company" },
];

const faqs = [
  {
    q: "¿Cuánto tarda el proceso de certificación?",
    a: "Depende de la norma y el tamaño de la empresa. Para ISO 9001 en una empresa de menos de 100 empleados, el proceso completo toma entre 6 y 10 meses. Para normas más especializadas como ISO 22000 o ISO/IEC 27001, puede ser de 8 a 14 meses.",
  },
  {
    q: "¿Cuánto cuesta una certificación ISO?",
    a: "El costo varía según la norma, el tamaño de la empresa y la complejidad de los procesos. Lo que sí podemos decir es que incluimos el desarrollo del sistema, la plataforma de gestión y el acompañamiento hasta el certificado. Solicita tu cotización para recibir un presupuesto exacto.",
  },
  {
    q: "¿Pueden certificar mi empresa si ya tengo otro consultor?",
    a: "Sí. Si ya tienes un proceso de implementación en curso o un sistema previo, podemos evaluarlo y continuar desde donde estás. No es necesario empezar desde cero.",
  },
  {
    q: "¿La plataforma de gestión tiene costo adicional?",
    a: "La plataforma ISO Go está incluida en todos nuestros proyectos de certificación. No es un add-on — es parte del proceso porque es la única forma de garantizar que el sistema se mantenga activo.",
  },
  {
    q: "¿Trabajan con empresas de todos los tamaños?",
    a: "Sí. Tenemos experiencia con PYMES de 10 empleados y con corporaciones de más de 2.000. El proceso se adapta al tamaño y sector de tu empresa.",
  },
];

export default async function ContactoPage() {
  const t = await getTranslations("contact");
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
          <div className="max-w-2xl">
            <span className="text-[#F5A623] text-sm font-bold uppercase tracking-widest">Cotiza sin compromiso</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">{t("title")}</h1>
            <p className="text-xl text-gray-300">{t("sub")}</p>
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Cuéntanos sobre tu proyecto</h2>
              <ContactForm />
            </div>

            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">¿Prefieres hablar directamente?</h2>
              <div className="space-y-4 mb-10">
                {contactInfo.map((info) => (
                  <a
                    key={info.label}
                    href={info.href}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#F5A623] hover:shadow-sm transition-all group"
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{info.label}</p>
                      <p className="text-[#1A1A1A] font-semibold group-hover:text-[#F5A623] transition-colors">{info.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* What to expect */}
              <div className="bg-[#F4F4F4] rounded-2xl p-6">
                <h3 className="font-bold text-[#1A1A1A] mb-4">¿Qué pasa después de que nos escribes?</h3>
                <ol className="space-y-3">
                  {[
                    "Un asesor te responde en menos de 24 horas hábiles",
                    "Agendamos una llamada de diagnóstico gratuita de 30 minutos",
                    "Te enviamos una propuesta personalizada con plan y presupuesto",
                    "Si avanzamos, comenzamos el proceso en menos de 2 semanas",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#F5A623] rounded-full flex items-center justify-center text-xs font-bold text-[#1A1A1A]">
                        {i + 1}
                      </span>
                      <span className="text-gray-700 text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-[#F4F4F4] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-12 text-center">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="bg-white rounded-xl overflow-hidden group">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-[#1A1A1A] list-none">
                  {faq.q}
                  <span className="text-[#F5A623] text-xl ml-4 flex-shrink-0">+</span>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
