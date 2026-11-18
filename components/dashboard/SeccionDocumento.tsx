"use client";

import { useDashboardUser } from "./DashboardUserContext";
import { temaPanelDe } from "@/lib/temaPanel";

export function Seccion({
  numero,
  icono,
  titulo,
  children,
}: {
  numero?: string;
  icono?: React.ReactNode;
  titulo: string;
  children: React.ReactNode;
}) {
  const { profile } = useDashboardUser();
  const tema = temaPanelDe(profile?.tema_panel);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden print:break-inside-avoid print:border-gray-300">
      <div
        className="flex items-center gap-3 px-5 py-3 print:[print-color-adjust:exact] print:[-webkit-print-color-adjust:exact]"
        style={{
          background: `linear-gradient(to right, ${tema.bgFrom}, ${tema.bgTo})`,
          borderBottom: tema.isLight ? "1px solid #E5E7EB" : "none",
        }}
      >
        {numero && (
          <span
            className="w-6 h-6 rounded-md text-[11px] font-extrabold flex items-center justify-center flex-shrink-0 print:[print-color-adjust:exact] print:[-webkit-print-color-adjust:exact]"
            style={{
              backgroundColor: tema.isLight ? "#1A1A1A" : "rgba(255,255,255,0.18)",
              color: tema.isLight ? "#FFFFFF" : tema.textPrimary,
            }}
          >
            {numero}
          </span>
        )}
        {icono && (
          <span className="text-base flex-shrink-0 flex items-center" style={{ color: tema.textPrimary }}>
            {icono}
          </span>
        )}
        <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: tema.textPrimary }}>
          {titulo}
        </h3>
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
