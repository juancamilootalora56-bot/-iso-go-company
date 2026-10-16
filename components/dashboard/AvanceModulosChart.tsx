"use client";

import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { ITEMS_GERENCIA } from "@/lib/gestionGerenciaItems";
import { estaCompletoActividad } from "@/lib/gestionGerenciaCompletitud";

const MODULOS = [
  { label: "Gerencia", corto: "GER" },
  { label: "Talento Humano", corto: "RRHH" },
  { label: "Compras", corto: "COM" },
  { label: "Comercial", corto: "VTA" },
  { label: "Operativa", corto: "OPER" },
  { label: "Diseño y Desarrollo", corto: "D&D" },
  { label: "Calidad", corto: "CAL" },
];

const WIDTH = 460;
const HEIGHT = 190;
const PAD_X = 28;
const PAD_TOP = 24;
const PAD_BOTTOM = 34;

function y(pct: number) {
  const usable = HEIGHT - PAD_TOP - PAD_BOTTOM;
  return PAD_TOP + usable - (pct / 100) * usable;
}

function x(i: number, n: number) {
  const usable = WIDTH - PAD_X * 2;
  return PAD_X + (usable * i) / (n - 1);
}

// Curva suave tipo "cardinal spline" usando puntos de control intermedios.
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

// Una "actividad" de un módulo se considera completa si su item_key tiene al
// menos un registro guardado — mismo criterio de fondo que usan las tarjetas
// "Completo/Pendiente" en cada módulo, aplicado acá para resumir el avance.
function tieneRegistros(docs: Record<string, string>, key: string): boolean {
  try {
    const parsed = JSON.parse(docs[key] ?? "");
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

function tieneRegistrosConPrefijo(docs: Record<string, string>, prefijo: string): boolean {
  return Object.keys(docs).some((k) => {
    if (!k.startsWith(prefijo)) return false;
    try {
      const parsed = JSON.parse(docs[k] ?? "");
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  });
}

function porcentaje(actividades: boolean[]): number {
  if (actividades.length === 0) return 0;
  return Math.round((actividades.filter(Boolean).length / actividades.length) * 100);
}

export default function AvanceModulosChart({
  userId,
  docsGerencia,
  loadingGerencia,
}: {
  userId: string | null;
  docsGerencia: Record<string, string>;
  loadingGerencia: boolean;
}) {
  const { docs: docsRRHH, loading: loadingRRHH } = useGestionDocumentos("talento_humano", userId);
  const { docs: docsCompras, loading: loadingCompras } = useGestionDocumentos("compras", userId);
  const { docs: docsComercial, loading: loadingComercial } = useGestionDocumentos("comercial", userId);
  const { docs: docsOperativa, loading: loadingOperativa } = useGestionDocumentos("operativa", userId);
  const { docs: docsDyD, loading: loadingDyD } = useGestionDocumentos("diseno_desarrollo", userId);
  const { docs: docsCalidad, loading: loadingCalidad } = useGestionDocumentos("calidad", userId);

  const loading =
    loadingGerencia || loadingRRHH || loadingCompras || loadingComercial || loadingOperativa || loadingDyD || loadingCalidad;

  const pctGerencia = Math.round(
    (ITEMS_GERENCIA.filter((i) => estaCompletoActividad(i.key, docsGerencia)).length / ITEMS_GERENCIA.length) * 100
  );

  const pctRRHH = porcentaje([
    tieneRegistros(docsRRHH, "personal_lista"),
    tieneRegistrosConPrefijo(docsRRHH, "capacitacion_"),
    tieneRegistrosConPrefijo(docsRRHH, "evaluacion_"),
  ]);

  const pctCompras = porcentaje([
    tieneRegistros(docsCompras, "proveedores_lista"),
    tieneRegistrosConPrefijo(docsCompras, "evaluacion_proveedor_"),
    tieneRegistros(docsCompras, "ordenes_compra_lista"),
  ]);

  const pctComercial = porcentaje([
    tieneRegistros(docsComercial, "clientes_lista"),
    tieneRegistrosConPrefijo(docsComercial, "pqrsf_cliente_"),
    tieneRegistrosConPrefijo(docsComercial, "satisfaccion_cliente_"),
    tieneRegistros(docsComercial, "ventas_registro") || tieneRegistros(docsComercial, "ventas_metas"),
  ]);

  const pctOperativa = porcentaje([
    tieneRegistros(docsOperativa, "productos_lista"),
    tieneRegistros(docsOperativa, "inventario_lista"),
    tieneRegistros(docsOperativa, "no_conformidades_lista"),
  ]);

  const pctDyD = porcentaje([
    tieneRegistros(docsDyD, "proyectos_diseno_lista"),
    tieneRegistros(docsDyD, "planes_calidad_lista"),
    tieneRegistros(docsDyD, "cambios_diseno_lista"),
  ]);

  const pctCalidad = porcentaje([
    tieneRegistros(docsCalidad, "procedimientos_lista"),
    tieneRegistros(docsCalidad, "oportunidades_mejora_lista"),
    tieneRegistros(docsCalidad, "lecciones_aprendidas_lista"),
    tieneRegistros(docsCalidad, "matriz_requisitos_legales"),
    tieneRegistros(docsCalidad, "matriz_comunicaciones"),
    tieneRegistros(docsCalidad, "matriz_competencias"),
    tieneRegistros(docsCalidad, "caracterizaciones_lista"),
    tieneRegistros(docsCalidad, "control_documentos_otros") || tieneRegistros(docsCalidad, "control_documentos_cambios"),
  ]);

  const porcentajes = [pctGerencia, pctRRHH, pctCompras, pctComercial, pctOperativa, pctDyD, pctCalidad];

  const puntos = porcentajes.map((pct, i) => ({ x: x(i, porcentajes.length), y: y(pct), pct }));
  const linea = pathSuave(puntos);
  const area = `${linea} L ${puntos[puntos.length - 1].x} ${y(0)} L ${puntos[0].x} ${y(0)} Z`;

  const promedio = Math.round(porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-[#1A1A1A]">Avance por módulo</h2>
        <span className="text-xs font-bold text-[#F5A623] bg-[#F5A623]/10 px-2 py-1 rounded-full">
          {promedio}% promedio
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-3">% de actividades completadas en cada módulo de gestión.</p>

      {loading ? (
        <p className="text-gray-400 text-sm py-10 text-center">Cargando...</p>
      ) : (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto">
          <defs>
            <linearGradient id="avanceGradiente" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5A623" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Líneas guía horizontales (0 / 50 / 100%) */}
          {[0, 50, 100].map((v) => (
            <g key={v}>
              <line x1={PAD_X} x2={WIDTH - PAD_X} y1={y(v)} y2={y(v)} stroke="#F1F1F1" strokeWidth={1} />
              <text x={2} y={y(v) + 3} fontSize={9} fill="#B0B0B0">
                {v}%
              </text>
            </g>
          ))}

          {/* Área bajo la curva */}
          <path d={area} fill="url(#avanceGradiente)" />

          {/* Línea suave */}
          <path d={linea} fill="none" stroke="#F5A623" strokeWidth={2.5} strokeLinecap="round" />

          {/* Puntos + etiquetas */}
          {puntos.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="#fff" stroke="#F5A623" strokeWidth={2.5} />
              <text x={p.x} y={p.y - 10} fontSize={10} fontWeight={700} fill="#1A1A1A" textAnchor="middle">
                {p.pct}%
              </text>
              <text x={p.x} y={HEIGHT - 10} fontSize={9} fill="#9CA3AF" textAnchor="middle">
                {MODULOS[i].corto}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
