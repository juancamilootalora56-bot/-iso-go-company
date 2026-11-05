import { Settings, TrendingUp, ShoppingCart, Users, Puzzle, ClipboardCheck, User } from "lucide-react";

const CX = 260;
const CY = 210;
const R = 140;

const nodes = [
  { id: "calidad", label: "Calidad", angle: -90, Icon: ClipboardCheck },
  { id: "comercial", label: "Comercial", angle: -30, Icon: TrendingUp },
  { id: "compras", label: "Compras", angle: 30, Icon: ShoppingCart },
  { id: "operativa", label: "Operativa", angle: 90, Icon: Settings },
  { id: "talento", label: "Talento Humano", angle: 150, Icon: Users },
  { id: "diseno", label: "Diseño y Desarrollo", angle: 210, Icon: Puzzle },
].map((n) => {
  const rad = (n.angle * Math.PI) / 180;
  return { ...n, x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
});

const path = `M ${nodes.map((n) => `${n.x} ${n.y}`).join(" L ")} Z`;

export default function SoftwareWorkflowAnimation() {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden shadow-2xl relative p-4 md:p-6">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(245,166,35,0.12) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-[#F5A623] text-xs font-bold uppercase tracking-widest">
            Un sistema, todos tus procesos
          </span>
          <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            En vivo
          </span>
        </div>

        <svg viewBox="0 0 520 430" className="w-full h-auto">
          {/* Líneas conectoras con efecto de flujo de datos */}
          <path
            d={path}
            fill="none"
            stroke="#F5A623"
            strokeOpacity={0.25}
            strokeWidth={2}
            strokeDasharray="6 6"
            className="iso-flow-line"
          />

          {/* Nodos de cada módulo */}
          {nodes.map((n, i) => (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={34}
                fill="#242424"
                stroke="#F5A623"
                strokeWidth={1.5}
                className="iso-node-pulse"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
              <n.Icon x={n.x - 13} y={n.y - 13} width={26} height={26} color="#F5A623" strokeWidth={2} />
              <text
                x={n.x}
                y={n.y + (n.y < CY ? -46 : 56)}
                textAnchor="middle"
                fill="#E5E5E5"
                fontSize={13}
                fontWeight={700}
                fontFamily="Poppins, Montserrat, Arial, sans-serif"
              >
                {n.label}
              </text>
            </g>
          ))}

          {/* Avatar recorriendo los procesos */}
          <g filter="drop-shadow(0 0 6px rgba(245,166,35,0.7))">
            <animateMotion dur="16s" repeatCount="indefinite" path={path} />
            <circle r={20} fill="#F5A623" stroke="#1A1A1A" strokeWidth={3} />
            <User x={-11} y={-11} width={22} height={22} color="#1A1A1A" strokeWidth={2.5} />
          </g>
        </svg>

        <p className="text-center text-gray-400 text-xs mt-1 px-4">
          Un mismo colaborador, visible y trazable en cada proceso que atraviesa — del área comercial a calidad, sin perder contexto.
        </p>
      </div>
    </div>
  );
}
