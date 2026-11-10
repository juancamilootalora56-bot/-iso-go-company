import { AlertTriangle, MousePointer2 } from "lucide-react";

const kpis = [
  { label: "Cumplimiento", value: "96%", color: "text-green-400" },
  { label: "No Conformidades", value: "3", color: "text-yellow-400" },
  { label: "Próx. auditoría", value: "62 días", color: "text-blue-400" },
];

const bars = [
  { label: "Gerencia", pct: 93 },
  { label: "Operativa", pct: 100 },
  { label: "Diseño y Desarrollo", pct: 67 },
  { label: "Calidad", pct: 82 },
  { label: "Compras", pct: 75 },
];

export default function LiveDashboardPreview() {
  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden">
      {/* Barra de ventana */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="text-gray-400 text-xs ml-2">Dashboard ISO Go</span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          En vivo
        </span>
      </div>

      <div className="p-6 relative">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {kpis.map((s, i) => (
            <div
              key={s.label}
              className="bg-white/5 rounded-lg p-3 text-center iso-kpi-pop"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-[10px] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Avance por módulo</span>
            <span className="text-[#F5A623] text-xs font-bold">83% promedio</span>
          </div>
          <div className="flex items-end gap-3 h-24">
            {bars.map((b, i) => (
              <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="w-full flex-1 flex items-end overflow-hidden">
                  <div
                    className="w-full bg-[#F5A623] rounded-t-sm iso-bar-breathe"
                    style={{ height: `${b.pct}%`, animationDelay: `${i * 0.25}s` }}
                  />
                </div>
                <span className="text-[9px] text-gray-400 mt-1 text-center leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Toast de alerta */}
        <div className="iso-toast absolute top-[132px] right-6 bg-[#1A1A1A] border border-yellow-700/50 rounded-lg px-3 py-2 shadow-xl flex items-center gap-2 max-w-[200px]">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-gray-300 text-[11px] leading-tight">Nueva no conformidad registrada</span>
        </div>

        {/* Anillos de "clic" en los puntos que visita el cursor */}
        <span
          className="absolute rounded-full border border-[#F5A623] iso-click-ring pointer-events-none"
          style={{ top: "40px", left: "200px", width: "18px", height: "18px", animationDelay: "0.2s" }}
        />
        <span
          className="absolute rounded-full border border-[#F5A623] iso-click-ring pointer-events-none"
          style={{ top: "150px", left: "70px", width: "18px", height: "18px", animationDelay: "2.6s" }}
        />
        <span
          className="absolute rounded-full border border-[#F5A623] iso-click-ring pointer-events-none"
          style={{ top: "180px", left: "230px", width: "18px", height: "18px", animationDelay: "5s" }}
        />

        {/* Cursor simulando interacción */}
        <div className="absolute top-8 left-8 iso-cursor pointer-events-none">
          <MousePointer2 className="w-5 h-5 text-white" fill="white" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
