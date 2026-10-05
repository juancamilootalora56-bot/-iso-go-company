"use client";

export function Seccion({
  numero,
  icono,
  titulo,
  children,
}: {
  numero?: string;
  icono?: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
        {numero && (
          <span className="w-6 h-6 rounded-md bg-[#F5A623] text-[#1A1A1A] text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">
            {numero}
          </span>
        )}
        {icono && <span className="text-base flex-shrink-0">{icono}</span>}
        <h3 className="text-white text-xs font-bold uppercase tracking-wide">{titulo}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Dato({ label, valor, icono }: { label: string; valor?: string; icono?: string }) {
  if (!valor) return null;
  return (
    <div className="bg-[#FAFAFA] rounded-xl p-3.5 border border-gray-100">
      <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400 flex items-center gap-1.5">
        {icono && <span>{icono}</span>}
        {label}
      </p>
      <p className="text-sm font-semibold text-[#1A1A1A] mt-1">{valor}</p>
    </div>
  );
}
