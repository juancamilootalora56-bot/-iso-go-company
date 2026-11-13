"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { PROCESOS_COMUNES, parseLista } from "@/lib/mapaProcesos";
import {
  Landmark,
  Target,
  TrendingUp,
  Settings,
  Users,
  Wallet,
  ShoppingCart,
  BadgeCheck,
  Truck,
  Wrench,
  Monitor,
  Headphones,
  Scale,
  ClipboardCheck,
  Sparkles,
  FlaskConical,
  Check,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";

const ITEM_KEY_SELECCION = "mapa_procesos_seleccion";

// Un ícono por proceso común — puramente visual, para que la grilla de
// selección se lea como tarjetas reales y no como una lista de checkboxes.
const ICONO_POR_PROCESO: Record<string, LucideIcon> = {
  "Gerencia General": Landmark,
  "Planificación Estratégica": Target,
  "Gestión Comercial": TrendingUp,
  "Producción / Operaciones": Settings,
  "Gestión Humana": Users,
  "Tesorería / Finanzas": Wallet,
  Compras: ShoppingCart,
  "Gestión de Calidad": BadgeCheck,
  "Logística y Distribución": Truck,
  Mantenimiento: Wrench,
  "Sistemas / TI": Monitor,
  "Atención al Cliente": Headphones,
  "Gestión Jurídica": Scale,
  "Auditoría Interna": ClipboardCheck,
  "Mejora Continua": Sparkles,
  "Investigación y Desarrollo": FlaskConical,
};

export default function MapaProcesosSeleccionPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [nuevoProceso, setNuevoProceso] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSeleccion(parseLista(docs[ITEM_KEY_SELECCION] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function toggle(proceso: string) {
    setSeleccion((prev) =>
      prev.includes(proceso) ? prev.filter((p) => p !== proceso) : [...prev, proceso]
    );
  }

  function agregarPersonalizado() {
    const texto = nuevoProceso.trim();
    if (!texto) return;
    setSeleccion((prev) => (prev.includes(texto) ? prev : [...prev, texto]));
    setNuevoProceso("");
  }

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY_SELECCION, JSON.stringify(seleccion));
    setSaving(false);
    router.push(`${basePath}/mapa_procesos/clasificar`);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const personalizados = seleccion.filter((p) => !PROCESOS_COMUNES.includes(p));

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      {/* Encabezado — mismo lenguaje visual que el resto de los flujos paso a
          paso del sistema (fondo oscuro, grilla sutil, glow dorado). */}
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
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#F5A623" }}>
              Paso 1 de 3
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Mapa de Procesos</h1>
            <p className="text-gray-400 text-sm mt-1 max-w-md">
              Seleccioná los procesos que forman parte de tu organización. Vas a clasificarlos en el próximo paso.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white text-2xl font-extrabold">{seleccion.length}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wide">Seleccionados</p>
            </div>
            {seleccion.length > 0 && (
              <Link
                href={`${basePath}/mapa_procesos/resultado`}
                className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2.5 rounded-lg flex-shrink-0"
              >
                Ver mapa actual →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Procesos frecuentes</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-6">
          {PROCESOS_COMUNES.map((p) => {
            const activo = seleccion.includes(p);
            const Icono = ICONO_POR_PROCESO[p] ?? Target;
            return (
              <button
                key={p}
                type="button"
                onClick={() => toggle(p)}
                aria-pressed={activo}
                className={`relative text-left rounded-xl border-2 px-3.5 py-3 transition-all ${
                  activo
                    ? "border-[#F5A623] bg-[#F5A623]/5 shadow-sm"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                {activo && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#F5A623] flex items-center justify-center">
                    <Check size={11} strokeWidth={3} className="text-[#1A1A1A]" />
                  </span>
                )}
                <Icono size={18} className="mb-2" style={{ color: activo ? "#F5A623" : "#9CA3AF" }} />
                <p className={`text-[12.5px] font-semibold leading-tight pr-4 ${activo ? "text-[#1A1A1A]" : "text-gray-600"}`}>
                  {p}
                </p>
              </button>
            );
          })}
        </div>

        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Agregar un proceso propio</p>
        <div className="flex gap-2 mb-3">
          <input
            value={nuevoProceso}
            onChange={(e) => setNuevoProceso(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarPersonalizado();
              }
            }}
            placeholder="Ej: Relaciones Institucionales..."
            className="flex-1 bg-[#FAFAFA] border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/15 transition-colors"
          />
          <button
            type="button"
            onClick={agregarPersonalizado}
            disabled={!nuevoProceso.trim()}
            className="flex items-center gap-1.5 text-sm font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] disabled:opacity-40 disabled:hover:bg-[#F5A623] px-4 rounded-lg transition-colors flex-shrink-0"
          >
            <Plus size={15} strokeWidth={3} />
            Agregar
          </button>
        </div>

        {personalizados.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {personalizados.map((p) => (
              <span
                key={p}
                className="text-xs font-semibold bg-[#F5A623]/10 text-[#1A1A1A] pl-3 pr-1.5 py-1.5 rounded-full flex items-center gap-1.5 border border-[#F5A623]/20"
              >
                {p}
                <button
                  onClick={() => toggle(p)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-red-400 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {seleccion.length === 0 && (
          <p className="text-xs text-gray-400">Seleccioná al menos un proceso para continuar.</p>
        )}
        <button
          onClick={handleGuardar}
          disabled={saving || seleccion.length === 0}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-40 transition-colors"
        >
          {saving ? "Guardando..." : `Continuar con ${seleccion.length} ${seleccion.length === 1 ? "proceso" : "procesos"} →`}
        </button>
      </div>
    </div>
  );
}
