export default function ProgresoPage() {
  const steps = [
    {
      number: 1,
      icon: "🔍",
      title: "Diagnóstico inicial",
      description:
        "Evaluamos el estado actual de tu empresa frente a los requisitos de la norma ISO seleccionada. Identificamos brechas y oportunidades de mejora.",
      status: "pendiente" as const,
    },
    {
      number: 2,
      icon: "🛠️",
      title: "Implementación",
      description:
        "Diseñamos e implementamos el sistema de gestión con los procedimientos, políticas y controles necesarios para cumplir con la norma.",
      status: "locked" as const,
    },
    {
      number: 3,
      icon: "🤖",
      title: "Automatización con software",
      description:
        "Integramos tu sistema de gestión con nuestra plataforma para automatizar el seguimiento, los registros y los indicadores clave.",
      status: "locked" as const,
    },
    {
      number: 4,
      icon: "📋",
      title: "Auditoría interna",
      description:
        "Realizamos una auditoría interna exhaustiva para verificar que el sistema cumple con todos los requisitos antes de la certificación.",
      status: "locked" as const,
    },
    {
      number: 5,
      icon: "🏆",
      title: "Auditoría de certificación",
      description:
        "Un organismo de certificación acreditado audita tu sistema de gestión. Nosotros te acompañamos durante todo el proceso.",
      status: "locked" as const,
    },
    {
      number: 6,
      icon: "✅",
      title: "Certificado + Mantenimiento continuo",
      description:
        "Obtienes tu certificado ISO. Continuamos apoyándote con el mantenimiento del sistema, auditorías de seguimiento y mejora continua.",
      status: "locked" as const,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Mi progreso</h1>
        <p className="text-gray-500 text-sm mt-1">
          Seguimiento de tu proceso de certificación ISO
        </p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {steps.map((step) => {
            const isPending = step.status === "pendiente";
            const isLocked = step.status === "locked";

            return (
              <div key={step.number} className="relative flex gap-6">
                {/* Step indicator */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl border-2 transition-all ${
                    isPending
                      ? "bg-[#F5A623]/10 border-[#F5A623] shadow-lg shadow-[#F5A623]/20"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {isLocked ? "🔒" : step.icon}
                </div>

                {/* Content */}
                <div
                  className={`flex-1 bg-white rounded-xl p-5 border mb-2 ${
                    isPending
                      ? "border-[#F5A623]/30 shadow-sm"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`font-semibold text-sm ${
                        isLocked ? "text-gray-400" : "text-[#1A1A1A]"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        isPending
                          ? "bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/30"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isPending ? "Pendiente" : "Por iniciar"}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      isLocked ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 bg-[#1A1A1A] rounded-xl p-6 text-center">
        <p className="text-[#F5A623] font-semibold mb-2">¿Listo para comenzar?</p>
        <p className="text-gray-400 text-sm mb-4">
          Agenda tu diagnóstico inicial gratuito y da el primer paso hacia tu certificación ISO.
        </p>
        <a
          href="/es/contacto"
          className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm"
        >
          Agendar diagnóstico gratuito
        </a>
      </div>
    </div>
  );
}
