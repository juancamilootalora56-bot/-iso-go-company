type Subseccion = {
  icon: string;
  imagen?: string;
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">{titulo}</h1>
        <p className="text-gray-500 text-sm mt-1">{descripcion}</p>
      </div>

      <div className="space-y-2">
        {subsecciones.map((s) => (
          <div
            key={s.titulo}
            className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
          >
            <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
              <span className="flex items-center justify-center w-full h-full rounded-full bg-white overflow-hidden">
                {s.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.imagen}
                    alt={s.titulo}
                    className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <span className="text-xl bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] w-full h-full rounded-full flex items-center justify-center">
                    {s.icon}
                  </span>
                )}
              </span>
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-[#1A1A1A]">{s.titulo}</h2>
                <span className="text-[10px] uppercase tracking-wide font-bold text-[#F5A623] bg-[#F5A623]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Próximamente
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{s.descripcion}</p>
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
