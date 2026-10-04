type Subseccion = {
  icon: string;
  titulo: string;
  descripcion: string;
};

export default function GestionSection({
  titulo,
  descripcion,
  subsecciones,
  locale,
}: {
  titulo: string;
  descripcion: string;
  subsecciones: Subseccion[];
  locale: string;
}) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">{titulo}</h1>
        <p className="text-gray-500 text-sm mt-1">{descripcion}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subsecciones.map((s) => (
          <div
            key={s.titulo}
            className="bg-white rounded-xl p-5 border border-gray-100 hover:border-[#F5A623]/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{s.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-sm text-[#1A1A1A]">{s.titulo}</h2>
                  <span className="text-[10px] uppercase tracking-wide font-bold text-[#F5A623] bg-[#F5A623]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    Próximamente
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{s.descripcion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-[#1A1A1A] rounded-xl p-6 text-center">
        <p className="text-[#F5A623] font-semibold mb-2">¿Necesitás ayuda con esta área?</p>
        <p className="text-gray-400 text-sm mb-4">
          Un asesor de Iso Go puede acompañarte a implementarla dentro de tu sistema de gestión.
        </p>
        <a
          href={`/${locale}/contacto`}
          className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm"
        >
          Hablar con un asesor
        </a>
      </div>
    </div>
  );
}
