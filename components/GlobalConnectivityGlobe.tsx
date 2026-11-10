const CX = 300;
const CY = 300;
const R = 220;

// Nodos: nodos tipo "hub" que representan mercados certificados alrededor del globo
const nodes = [
  { id: "na", x: 185, y: 185, label: "Norteamérica" },
  { id: "eu", x: 310, y: 155, label: "Europa" },
  { id: "me", x: 365, y: 235 },
  { id: "asia", x: 435, y: 205, label: "Asia" },
  { id: "apac", x: 445, y: 355 },
  { id: "sa", x: 225, y: 405, label: "Latinoamérica" },
  { id: "afr", x: 335, y: 415 },
];

// Arcos: conexiones curvas entre hubs, con un punto de control para el "abultado" de la curva
const arcs = [
  { from: "na", to: "eu", c: { x: 245, y: 90 }, dur: "6s" },
  { from: "eu", to: "asia", c: { x: 375, y: 110 }, dur: "7.5s" },
  { from: "asia", to: "apac", c: { x: 480, y: 270 }, dur: "6.5s" },
  { from: "na", to: "sa", c: { x: 140, y: 300 }, dur: "8s" },
  { from: "sa", to: "afr", c: { x: 265, y: 470 }, dur: "7s" },
  { from: "afr", to: "me", c: { x: 385, y: 360 }, dur: "6.8s" },
  { from: "eu", to: "afr", c: { x: 305, y: 300 }, dur: "9s" },
];

const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));

// Estrellas de fondo (puntos decorativos fijos, look "espacio")
const stars = [
  [60, 80], [520, 60], [40, 420], [550, 150], [500, 500],
  [90, 520], [560, 380], [30, 250], [300, 40], [300, 560],
];

export default function GlobalConnectivityGlobe() {
  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto">
      <div
        className="absolute inset-0 rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle at center, rgba(245,166,35,0.25) 0%, transparent 65%)" }}
      />
      <svg viewBox="0 0 600 600" className="relative w-full h-full">
        {stars.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.4} fill="#F5A623" opacity={0.4} />
        ))}

        {/* Esfera wireframe */}
        <g stroke="#F5A623" strokeOpacity={0.35} fill="none">
          <circle cx={CX} cy={CY} r={R} />
          <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} />
          <ellipse cx={CX} cy={CY} rx={190} ry={R} />
          <ellipse cx={CX} cy={CY} rx={110} ry={R} />
          <line x1="80" y1={CY} x2="520" y2={CY} />
          <line x1="100.6" y1={CY - 93} x2="499.4" y2={CY - 93} />
          <line x1="100.6" y1={CY + 93} x2="499.4" y2={CY + 93} />
          <line x1="158.5" y1={CY - 168.5} x2="441.5" y2={CY - 168.5} />
          <line x1="158.5" y1={CY + 168.5} x2="441.5" y2={CY + 168.5} />
        </g>

        {/* Arcos de conexión con partícula de luz viajando */}
        {arcs.map((arc, i) => {
          const a = nodeById[arc.from];
          const b = nodeById[arc.to];
          const d = `M ${a.x} ${a.y} Q ${arc.c.x} ${arc.c.y} ${b.x} ${b.y}`;
          return (
            <g key={i}>
              <path d={d} stroke="#F5A623" strokeOpacity={0.3} strokeWidth={1.3} strokeDasharray="3 5" fill="none" />
              <circle r={3.5} fill="#F5A623" filter="drop-shadow(0 0 4px rgba(245,166,35,0.9))">
                <animateMotion dur={arc.dur} repeatCount="indefinite" path={d} />
              </circle>
            </g>
          );
        })}

        {/* Nodos (hubs certificados) */}
        {nodes.map((n, i) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={14}
              fill="none"
              stroke="#F5A623"
              strokeWidth={1}
              className="iso-node-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            <circle cx={n.x} cy={n.y} r={5} fill="#F5A623" />
            {n.label && (
              <text
                x={n.x}
                y={n.y - 20}
                textAnchor="middle"
                fill="#E5E5E5"
                fontSize={13}
                fontWeight={700}
                fontFamily="Poppins, Montserrat, Arial, sans-serif"
              >
                {n.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
