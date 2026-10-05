"use client";

const WIDTH = 920;
const HEIGHT = 260;
const PAD_X = 40;
const PAD_TOP = 30;
const PAD_BOTTOM = 40;

function pathSuave(puntos: { x: number; y: number }[]) {
  if (puntos.length < 2) return "";
  let d = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i];
    const p1 = puntos[i + 1];
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function LineChartSimple({
  puntos,
  color = "#F5A623",
  gradientId,
}: {
  puntos: { label: string; valor: number }[];
  color?: string;
  gradientId: string;
}) {
  const maxVal = Math.max(1, ...puntos.map((p) => p.valor));
  const usableH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const usableW = WIDTH - PAD_X * 2;

  const y = (v: number) => PAD_TOP + usableH - (v / maxVal) * usableH;
  const x = (i: number) => PAD_X + (usableW * i) / Math.max(1, puntos.length - 1);

  const coords = puntos.map((p, i) => ({ x: x(i), y: y(p.valor), ...p }));
  const linea = pathSuave(coords);
  const area = `${linea} L ${coords[coords.length - 1].x} ${y(0)} L ${coords[0].x} ${y(0)} Z`;

  const guias = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="max-w-2xl mx-auto">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {guias.map((v) => (
          <g key={v}>
            <line x1={PAD_X} x2={WIDTH - PAD_X} y1={y(v)} y2={y(v)} stroke="#F2F2F2" strokeWidth={1} />
            <text x={4} y={y(v) + 4} fontSize={13} fill="#C4C4C4">{v}</text>
          </g>
        ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={linea} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />

        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={4.5} fill="#fff" stroke={color} strokeWidth={2.5} />
            {c.valor > 0 && (
              <text x={c.x} y={c.y - 12} fontSize={12} fontWeight={700} fill="#1A1A1A" textAnchor="middle">
                {c.valor}
              </text>
            )}
            <text x={c.x} y={HEIGHT - 14} fontSize={11} fill="#AEAEAE" textAnchor="middle">
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
