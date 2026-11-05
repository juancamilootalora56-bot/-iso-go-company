import { Settings, TrendingUp, ShoppingCart, Users, Puzzle, ClipboardCheck, User, ShieldCheck } from "lucide-react";

const CX = 260;
const CY = 210;
const R = 150;
const HUB_R = 42;
const NODE_R = 28;

const nodes = [
  { id: "calidad", label: "Calidad", angle: -90, Icon: ClipboardCheck },
  { id: "comercial", label: "Comercial", angle: -30, Icon: TrendingUp },
  { id: "compras", label: "Compras", angle: 30, Icon: ShoppingCart },
  { id: "operativa", label: "Operativa", angle: 90, Icon: Settings },
  { id: "talento", label: "Talento Humano", angle: 150, Icon: Users },
  { id: "diseno", label: "Diseño y Desarrollo", angle: 210, Icon: Puzzle },
].map((n) => {
  const rad = (n.angle * Math.PI) / 180;
  const x = CX + R * Math.cos(rad);
  const y = CY + R * Math.sin(rad);
  const ratio = (R - HUB_R) / R;
  return {
    ...n,
    x,
    y,
    spokeX: CX + R * ratio * Math.cos(rad),
    spokeY: CY + R * ratio * Math.sin(rad),
  };
});

// Círculo perfecto para la órbita del avatar (dos arcos de 180°)
const orbitPath = `M ${CX - R},${CY} a ${R},${R} 0 1,0 ${2 * R},0 a ${R},${R} 0 1,0 ${-2 * R},0`;

export default function HomeProcessOrbit() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-[#1A1A1A] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 48%, rgba(245,166,35,0.15) 0%, transparent 55%)",
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
          <span className="text-gray-300 text-xs font-semibold uppercase tracking-widest">
            Tu certificación, en el centro de la operación
          </span>
        </div>

        <svg viewBox="0 0 520 430" className="w-full h-auto">
          {/* Órbita punteada con flujo */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="#F5A623"
            strokeOpacity={0.2}
            strokeWidth={1.5}
            strokeDasharray="5 7"
            className="iso-flow-line"
          />

          {/* Radios del núcleo a cada módulo */}
          {nodes.map((n) => (
            <line
              key={`spoke-${n.id}`}
              x1={CX}
              y1={CY}
              x2={n.spokeX}
              y2={n.spokeY}
              stroke="#FFFFFF"
              strokeOpacity={0.12}
              strokeWidth={1.5}
            />
          ))}

          {/* Núcleo: el sistema certificado */}
          <circle cx={CX} cy={CY} r={HUB_R + 8} fill="none" stroke="#F5A623" strokeOpacity={0.3} strokeWidth={1.5} />
          <circle cx={CX} cy={CY} r={HUB_R} fill="#F5A623" />
          <ShieldCheck x={CX - 18} y={CY - 18} width={36} height={36} color="#1A1A1A" strokeWidth={2} />

          {/* Nodos de cada módulo */}
          {nodes.map((n, i) => (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_R + 6}
                fill="none"
                stroke="#F5A623"
                strokeWidth={1}
                className="iso-node-pulse"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
              <circle cx={n.x} cy={n.y} r={NODE_R} fill="#2A2A2A" stroke="#F5A623" strokeWidth={1.5} />
              <n.Icon x={n.x - 11} y={n.y - 11} width={22} height={22} color="#F5A623" strokeWidth={2} />
              <text
                x={n.x}
                y={n.y + (n.y < CY ? -38 : 46)}
                textAnchor="middle"
                fill="#D1D1D1"
                fontSize={12}
                fontWeight={700}
                fontFamily="Poppins, Montserrat, Arial, sans-serif"
              >
                {n.label}
              </text>
            </g>
          ))}

          {/* Avatar orbitando el sistema */}
          <g filter="drop-shadow(0 0 6px rgba(245,166,35,0.7))">
            <animateMotion dur="14s" repeatCount="indefinite" path={orbitPath} />
            <circle r={17} fill="#1A1A1A" stroke="#F5A623" strokeWidth={2.5} />
            <User x={-9} y={-9} width={18} height={18} color="#F5A623" strokeWidth={2.5} />
          </g>
        </svg>
      </div>
    </div>
  );
}
