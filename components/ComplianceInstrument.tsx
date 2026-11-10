const CX = 250;
const CY = 250;
const R_OUTER = 225;
const R_TICKS = 195;
const R_RING = 160;
const R_NODES = 225;

// Redondeamos a 2 decimales: Node y el navegador pueden serializar el mismo
// float con distinta cantidad de dígitos, lo que rompe la hidratación de React.
const round = (n: number) => Math.round(n * 100) / 100;

const RING_CIRC = round(2 * Math.PI * R_RING);
const RING_PCT = 0.98;
const RING_OFFSET = round(RING_CIRC * (1 - RING_PCT));

const ticks = Array.from({ length: 36 }, (_, i) => {
  const angle = (i * 360) / 36;
  const rad = (angle * Math.PI) / 180;
  const inner = R_TICKS - (i % 3 === 0 ? 10 : 5);
  return {
    x1: round(CX + R_TICKS * Math.cos(rad)),
    y1: round(CY + R_TICKS * Math.sin(rad)),
    x2: round(CX + inner * Math.cos(rad)),
    y2: round(CY + inner * Math.sin(rad)),
    major: i % 3 === 0,
  };
});

const modules = [
  { label: "Calidad", angle: -90 },
  { label: "Comercial", angle: -30 },
  { label: "Compras", angle: 30 },
  { label: "Operativa", angle: 90 },
  { label: "Talento Humano", angle: 150 },
  { label: "Diseño y Desarrollo", angle: 210 },
].map((m, i) => {
  const rad = (m.angle * Math.PI) / 180;
  return {
    ...m,
    i,
    x: round(CX + R_NODES * Math.cos(rad)),
    y: round(CY + R_NODES * Math.sin(rad)),
    labelX: round(CX + (R_NODES + 26) * Math.cos(rad)),
    labelY: round(CY + (R_NODES + 26) * Math.sin(rad)),
    stemX: round(CX + (R_RING + 6) * Math.cos(rad)),
    stemY: round(CY + (R_RING + 6) * Math.sin(rad)),
  };
});

export default function ComplianceInstrument() {
  return (
    <div className="relative w-full max-w-[360px] mx-auto aspect-square">
      <div
        className="absolute inset-0 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle at center, rgba(245,166,35,0.22) 0%, transparent 65%)" }}
      />
      <svg viewBox="0 0 500 500" className="relative w-full h-full iso-fade-in-soft">
        {/* Anillos decorativos exteriores */}
        <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#F5A623" strokeOpacity={0.1} strokeWidth={1.5} />
        <circle cx={CX} cy={CY} r={R_OUTER + 18} fill="none" stroke="#F5A623" strokeOpacity={0.06} strokeWidth={1.5} />

        {/* Marcas tipo instrumento de precisión */}
        <g stroke="#F5A623" strokeOpacity={0.35}>
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 2.25 : 1.25} />
          ))}
        </g>

        {/* Barrido tipo radar */}
        <g className="iso-radar-sweep" style={{ transformOrigin: `${CX}px ${CY}px` }}>
          <line x1={CX} y1={CY} x2={CX} y2={CY - R_TICKS} stroke="url(#sweepGradient)" strokeWidth={3} />
        </g>
        <defs>
          <linearGradient id="sweepGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#F5A623" stopOpacity="0" />
            <stop offset="100%" stopColor="#F5A623" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Anillo de progreso principal */}
        <circle
          cx={CX}
          cy={CY}
          r={R_RING}
          fill="none"
          stroke="#F5A623"
          strokeOpacity={0.15}
          strokeWidth={4.5}
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_RING}
          fill="none"
          stroke="#F5A623"
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeDasharray={RING_CIRC}
          strokeDashoffset={RING_OFFSET}
          transform={`rotate(-90 ${CX} ${CY})`}
          className="iso-ring-breathe"
        />

        {/* Texto central */}
        <text x={CX} y={CY - 8} textAnchor="middle" fill="#FFFFFF" fontSize={56} fontWeight={800} fontFamily="Poppins, Montserrat, Arial, sans-serif">
          98%
        </text>
        <text x={CX} y={CY + 26} textAnchor="middle" fill="#A3A3A3" fontSize={13} fontWeight={600} letterSpacing={1} fontFamily="Poppins, Montserrat, Arial, sans-serif">
          CUMPLIMIENTO DEL SISTEMA
        </text>

        {/* Nodos de módulos orbitando */}
        {modules.map((m) => (
          <g key={m.label}>
            <line
              x1={m.stemX}
              y1={m.stemY}
              x2={m.x}
              y2={m.y}
              stroke="#F5A623"
              strokeOpacity={0.18}
              strokeWidth={1.5}
            />
            <circle cx={m.x} cy={m.y} r={6} fill="#F5A623" className="iso-orbit-pulse" style={{ animationDelay: `${m.i * 0.4}s` }} />
            <circle cx={m.x} cy={m.y} r={11} fill="none" stroke="#F5A623" strokeOpacity={0.35} strokeWidth={1.5} />
            <text
              x={m.labelX}
              y={m.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#D4D4D4"
              fontSize={11}
              fontWeight={700}
              fontFamily="Poppins, Montserrat, Arial, sans-serif"
            >
              {m.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
