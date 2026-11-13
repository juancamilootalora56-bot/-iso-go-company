"use client";

import { Users, Heart, Target, Workflow, ShieldCheck, ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";

type Categoria = "estrategicos" | "misionales" | "apoyo";

const CATEGORIAS: { key: Categoria; label: string; color: string; colorHasta: string; icono: LucideIcon }[] = [
  { key: "estrategicos", label: "Procesos Estratégicos", color: "#6366F1", colorHasta: "#4338CA", icono: Target },
  { key: "misionales", label: "Procesos Misionales", color: "#F5A623", colorHasta: "#e09410", icono: Workflow },
  { key: "apoyo", label: "Procesos de Apoyo", color: "#2DD4CF", colorHasta: "#0d8f8e", icono: ShieldCheck },
];

function BandaLateral({
  icono: Icono,
  texto,
  variante,
}: {
  icono: typeof Users;
  texto: string;
  variante: "entrada" | "salida";
}) {
  const gradient = variante === "entrada" ? "from-[#1A1A1A] to-[#2A2A2A]" : "from-[#F5A623] to-[#e09410]";
  return (
    <div
      className={`bg-gradient-to-b ${gradient} rounded-2xl flex flex-col items-center justify-center gap-3 px-3 py-6 flex-shrink-0 w-16 sm:w-20 border border-white/10`}
    >
      <Icono size={18} className="text-white flex-shrink-0" />
      <span
        className="text-white text-[11px] font-bold leading-tight text-center"
        style={{ writingMode: "vertical-rl", transform: variante === "entrada" ? "rotate(180deg)" : undefined }}
      >
        {texto}
      </span>
    </div>
  );
}

function FlujoConector({ variante }: { variante: "entrada" | "salida" }) {
  const color = variante === "entrada" ? "#9CA3AF" : "#F5A623";
  return (
    <svg viewBox="0 0 40 20" className="hidden sm:block w-8 h-5 flex-shrink-0 self-center" preserveAspectRatio="none">
      <line
        x1={variante === "entrada" ? 0 : 40}
        y1={10}
        x2={variante === "entrada" ? 40 : 0}
        y2={10}
        stroke={color}
        strokeOpacity={0.6}
        strokeWidth={2}
        strokeDasharray="5 5"
        className="iso-flow-line"
      />
    </svg>
  );
}

// Tallo vertical de conexión (hub → hijos, o logo → hub).
function Tallo({ color, h = 22 }: { color: string; h?: number }) {
  return <div className="flex-shrink-0" style={{ width: 2, height: h, background: color, opacity: 0.55 }} />;
}

// Cada proceso es un anillo (círculo con borde de color + punto central),
// igual lenguaje visual que el resto del sitio — con su nombre debajo.
function ProcesoAnillo({
  proceso,
  color,
  onClick,
}: {
  proceso: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 w-[86px] flex-shrink-0"
    >
      <span
        className="relative w-11 h-11 rounded-full border-2 flex items-center justify-center bg-[#1F1F1F] group-hover:bg-[#262626] transition-colors"
        style={{ borderColor: color }}
      >
        <span
          className="absolute inset-0 rounded-full iso-orbit-pulse"
          style={{ boxShadow: `0 0 0 3px ${color}33` }}
        />
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      </span>
      <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white text-center leading-tight transition-colors">
        {proceso}
      </span>
    </button>
  );
}

// Organigrama de una categoría: un hub arriba (con su color e ícono) y sus
// procesos como cajas conectadas debajo mediante una barra + tallos — igual
// idea que un organigrama clásico, para que se entienda de un vistazo quién
// pertenece a quién, sin líneas cruzadas por toda la pantalla.
function ColumnaCategoria({
  categoria,
  procesos,
  onClickProceso,
}: {
  categoria: (typeof CATEGORIAS)[number];
  procesos: string[];
  onClickProceso: (proceso: string) => void;
}) {
  const Icono = categoria.icono;
  return (
    <div className="w-full min-w-0 flex flex-col items-center">
      {/* Hub de la categoría */}
      <div
        className="w-full rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-lg"
        style={{ background: `linear-gradient(to right, ${categoria.color}, ${categoria.colorHasta})` }}
      >
        <Icono size={16} className="text-white flex-shrink-0" />
        <span className="text-white text-xs font-bold uppercase tracking-wide flex-1 truncate">{categoria.label}</span>
        <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
          {procesos.length}
        </span>
      </div>

      {procesos.length === 0 ? (
        <p className="text-gray-500 text-xs italic mt-3">Sin procesos asignados</p>
      ) : (
        <>
          <Tallo color={categoria.color} />
          <div className="relative w-full">
            <div
              className="absolute left-3 right-3 top-0 h-px"
              style={{ background: categoria.color, opacity: 0.4 }}
            />
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-4 pt-4">
              {procesos.map((p) => (
                <div key={p} className="relative flex flex-col items-center">
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-px"
                    style={{ height: 16, background: categoria.color, opacity: 0.4 }}
                  />
                  <ProcesoAnillo proceso={p} color={categoria.color} onClick={() => onClickProceso(p)} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function MapaProcesosOrbitCompleto({
  estrategicos,
  misionales,
  apoyo,
  logoUrl,
  companyLabel,
  onClickProceso,
}: {
  estrategicos: string[];
  misionales: string[];
  apoyo: string[];
  logoUrl: string | null;
  companyLabel: string;
  onClickProceso: (proceso: string, categoria: Categoria) => void;
}) {
  const porCategoria: Record<Categoria, string[]> = { estrategicos, misionales, apoyo };

  const iniciales = companyLabel
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const colorEstrategicos = CATEGORIAS[0].color;
  const [estrategicosCat, misionalesCat, apoyoCat] = CATEGORIAS;

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-[#1A1A1A] rounded-2xl p-4 sm:p-6 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 10%, rgba(245,166,35,0.12) 0%, transparent 55%)" }}
      />

      <p className="relative z-10 text-center text-xs text-gray-400 mb-4">
        Hacé clic en un proceso para ver o crear su caracterización
      </p>

      <div className="relative z-10 flex items-stretch gap-1 sm:gap-2">
        <BandaLateral icono={Users} texto="Requisitos del cliente y partes interesadas" variante="entrada" />
        <FlujoConector variante="entrada" />

        {/* 3 bandas apiladas (Estratégicos arriba, Misionales en el medio,
            Apoyo abajo) — Misionales recibe dirección desde Estratégicos y
            soporte desde Apoyo, igual lógica que un mapa de procesos
            clásico. El logo de la empresa inicia arriba de todo y se
            desprende únicamente hacia Procesos Estratégicos. */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-[#1F1F1F] border-2 border-[#F5A623] flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="w-full h-full object-contain p-1.5" />
            ) : (
              <span className="text-[#F5A623] text-sm font-extrabold">{iniciales}</span>
            )}
          </div>
          <Tallo color={colorEstrategicos} h={18} />

          <div className="w-full">
            <ColumnaCategoria
              categoria={estrategicosCat}
              procesos={porCategoria.estrategicos}
              onClickProceso={(p) => onClickProceso(p, "estrategicos")}
            />
          </div>

          <ChevronDown size={18} className="text-gray-400 animate-bounce my-0.5" style={{ animationDuration: "1.6s" }} />

          <div className="w-full">
            <ColumnaCategoria
              categoria={misionalesCat}
              procesos={porCategoria.misionales}
              onClickProceso={(p) => onClickProceso(p, "misionales")}
            />
          </div>

          <ChevronUp size={18} className="text-gray-400 animate-bounce my-0.5" style={{ animationDuration: "1.6s" }} />

          <div className="w-full">
            <ColumnaCategoria
              categoria={apoyoCat}
              procesos={porCategoria.apoyo}
              onClickProceso={(p) => onClickProceso(p, "apoyo")}
            />
          </div>
        </div>

        <FlujoConector variante="salida" />
        <BandaLateral icono={Heart} texto="Satisfacción del cliente y partes interesadas" variante="salida" />
      </div>
    </div>
  );
}
