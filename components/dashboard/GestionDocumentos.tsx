"use client";

import Link from "next/link";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import type { ItemGestion } from "@/lib/gestionGerenciaItems";
import { estaCompletoActividad as estaCompleto } from "@/lib/gestionGerenciaCompletitud";
import {
  Calendar,
  PenTool,
  Compass,
  Users,
  Star,
  Network,
  AlertTriangle,
  Target,
  Telescope,
  Gem,
  FileText,
  Map,
  Gauge,
  Building2,
  type LucideIcon,
} from "lucide-react";

export type { ItemGestion };

// Un ícono + color propio por actividad — reemplaza las fotos de stock
// genéricas por algo que realmente representa cada actividad. Si en algún
// momento se agrega una actividad nueva sin entrada acá, cae en el ícono
// y color por defecto (no rompe nada, solo se ve neutro).
const ICONO_POR_ACTIVIDAD: Record<string, { icono: LucideIcon; color: string }> = {
  cronograma_general: { icono: Calendar, color: "#F5A623" },
  compromiso_direccion: { icono: PenTool, color: "#D97706" },
  foda: { icono: Compass, color: "#E8366B" },
  matriz_cliente_partes_interesadas: { icono: Users, color: "#2EA3F2" },
  matriz_productos_estrella: { icono: Star, color: "#F59E0B" },
  mapa_procesos: { icono: Network, color: "#0891B2" },
  matriz_gestion_riesgos: { icono: AlertTriangle, color: "#EF4444" },
  mision: { icono: Target, color: "#16A34A" },
  vision: { icono: Telescope, color: "#2563EB" },
  valores_organizacionales: { icono: Gem, color: "#7C4DFF" },
  politica_calidad: { icono: FileText, color: "#6366F1" },
  alcance_sistema: { icono: Map, color: "#0EA5A4" },
  objetivos_calidad: { icono: Gauge, color: "#F97316" },
  estructura_organizacional: { icono: Building2, color: "#475569" },
};
const ICONO_DEFECTO = { icono: FileText, color: "#9CA3AF" };

export default function GestionDocumentos({
  modulo,
  titulo,
  descripcion,
  items,
  userId,
  basePath,
  locale,
}: {
  modulo: string;
  titulo: string;
  descripcion: string;
  items: ItemGestion[];
  userId: string | null;
  basePath: string;
  locale: string;
}) {
  const { docs, loading } = useGestionDocumentos(modulo, userId);

  const completados = items.filter((i) => estaCompleto(i.key, docs)).length;
  const porcentaje = items.length ? Math.round((completados / items.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden mb-6">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-white">{titulo}</h1>
          <p className="text-gray-400 text-sm mt-1 max-w-md">{descripcion}</p>

          {!loading && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                <span>{completados} de {items.length} completadas</span>
                <span className="font-bold" style={{ color: "#F5A623" }}>{porcentaje}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F5A623] rounded-full transition-all"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((item) => {
              const completo = estaCompleto(item.key, docs);
              const { icono: Icono, color } = ICONO_POR_ACTIVIDAD[item.key] ?? ICONO_DEFECTO;
              return (
                <Link
                  key={item.key}
                  href={`${basePath}/${item.key}`}
                  className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
                  style={{ borderLeftColor: color }}
                >
                  <span
                    className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ background: `${color}18` }}
                  >
                    <Icono size={22} style={{ color }} strokeWidth={2} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-sm text-[#1A1A1A]">{item.titulo}</h2>
                      <span
                        className={`text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          completo ? "text-green-700 bg-green-100" : "text-[#F5A623] bg-[#F5A623]/10"
                        }`}
                      >
                        {completo ? "Completo" : "Pendiente"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.descripcion}</p>
                  </div>
                  <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 bg-[#1A1A1A] rounded-xl p-6 text-center">
            <p className="text-[#F5A623] font-semibold mb-2">¿Necesitás ayuda con esta área?</p>
            <p className="text-gray-400 text-sm mb-4">
              Un asesor de Iso Go puede acompañarte a implementarla dentro de tu sistema de gestión.
            </p>
            <a
              href={`/${locale}/contacto`}
              className="inline-block bg-[#F5A623] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-[#C9790A] transition-colors text-sm"
            >
              Hablar con un asesor
            </a>
          </div>
        </>
      )}
    </div>
  );
}
