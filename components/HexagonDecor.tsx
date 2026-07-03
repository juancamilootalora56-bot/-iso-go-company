interface HexagonDecorProps {
  className?: string;
  color?: string;
  size?: number;
}

export default function HexagonDecor({
  className = "",
  color = "#F5A623",
  size = 80,
}: HexagonDecorProps) {
  const h = size * 0.866;
  const points = `${size / 2},0 ${size},${h * 0.25} ${size},${h * 0.75} ${size / 2},${h} 0,${h * 0.75} 0,${h * 0.25}`;
  return (
    <svg
      width={size}
      height={h}
      viewBox={`0 0 ${size} ${h}`}
      className={className}
      aria-hidden="true"
    >
      <polygon points={points} fill={color} />
    </svg>
  );
}

export function HexagonOutline({
  className = "",
  color = "#F5A623",
  size = 80,
}: HexagonDecorProps) {
  const h = size * 0.866;
  const points = `${size / 2},0 ${size},${h * 0.25} ${size},${h * 0.75} ${size / 2},${h} 0,${h * 0.75} 0,${h * 0.25}`;
  return (
    <svg
      width={size}
      height={h}
      viewBox={`0 0 ${size} ${h}`}
      className={className}
      aria-hidden="true"
    >
      <polygon points={points} fill="none" stroke={color} strokeWidth="3" />
    </svg>
  );
}

export function DiagonalBand({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(105deg, #F5A623 0%, #F5A623 30%, transparent 30%)",
        }}
      />
    </div>
  );
}
