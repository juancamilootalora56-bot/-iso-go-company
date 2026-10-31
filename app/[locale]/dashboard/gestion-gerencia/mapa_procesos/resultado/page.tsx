"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseLista, parseClasificacion } from "@/lib/mapaProcesos";
import { parseCaracterizaciones, caracterizacionVacia, siguienteCodigo, numeroDeCodigo } from "@/lib/caracterizacionProcesos";
import { Target, Workflow, ShieldCheck, ChevronDown, ChevronUp, Users, Heart } from "lucide-react";

const ITEM_KEY_SELECCION = "mapa_procesos_seleccion";
const ITEM_KEY_CLASIFICACION = "mapa_procesos_clasificacion";
const ITEM_KEY_CARACTERIZACIONES = "caracterizaciones_lista";

function Chip({ texto, color, onClick }: { texto: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white text-[#1A1A1A] text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm border border-gray-100 border-l-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
      style={{ borderLeftColor: color }}
    >
      {texto}
    </button>
  );
}

function Banda({
  icono: Icono,
  titulo,
  procesos,
  conFlechas,
  colorDesde,
  colorHasta,
  onClickProceso,
}: {
  icono: typeof Target;
  titulo: string;
  procesos: string[];
  conFlechas?: boolean;
  colorDesde: string;
  colorHasta: string;
  onClickProceso: (proceso: string) => void;
}) {
  return (
    <div className="bg-[#FAFAFA] rounded-2xl border border-gray-100 overflow-hidden">
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ background: `linear-gradient(to right, ${colorDesde}, ${colorHasta})` }}
      >
        <Icono size={15} className="text-white flex-shrink-0" />
        <h3 className="text-white text-xs font-bold uppercase tracking-wide flex-1">{titulo}</h3>
        <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{procesos.length}</span>
      </div>
      <div className="p-4 flex flex-wrap items-center justify-center gap-2.5">
        {procesos.length === 0 ? (
          <span className="text-gray-400 text-xs italic py-2">Sin procesos asignados</span>
        ) : (
          procesos.map((p, i) => (
            <span key={p} className="flex items-center gap-2.5">
              <Chip texto={p} color={colorHasta} onClick={() => onClickProceso(p)} />
              {conFlechas && i < procesos.length - 1 && <span className="text-gray-300 text-sm">›</span>}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function BandaLateral({ icono: Icono, texto, variante }: { icono: typeof Users; texto: string; variante: "entrada" | "salida" }) {
  const gradient = variante === "entrada" ? "from-[#1A1A1A] to-[#2A2A2A]" : "from-[#F5A623] to-[#e09410]";
  return (
    <div className={`bg-gradient-to-b ${gradient} rounded-2xl flex flex-col items-center justify-center gap-3 px-3 py-6 flex-shrink-0 w-16 sm:w-20`}>
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

export default function MapaProcesosResultadoPage() {
  const { user, profile } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;
  const basePathCalidad = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading } = useGestionDocumentos("gerencia", user?.id ?? null);
  const { docs: docsCalidad, loading: loadingCalidad, save: saveCalidad } = useGestionDocumentos("calidad", user?.id ?? null);

  if (loading || loadingCalidad) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const procesos = parseLista(docs[ITEM_KEY_SELECCION] ?? "");
  const clasificacion = parseClasificacion(docs[ITEM_KEY_CLASIFICACION] ?? "");
  const caracterizaciones = parseCaracterizaciones(docsCalidad[ITEM_KEY_CARACTERIZACIONES] ?? "");

  const estrategicos = procesos.filter((p) => clasificacion[p] === "estrategicos");
  const misionales = procesos.filter((p) => clasificacion[p] === "misionales");
  const apoyo = procesos.filter((p) => clasificacion[p] === "apoyo");

  const vacio = procesos.length === 0;

  // Lleva a la caracterización del proceso clickeado — si ya existe, directo
  // a verla/editarla; si no, la crea (misma lógica que en Caracterizaciones).
  async function irACaracterizacion(proceso: string, categoria: string) {
    const existente = caracterizaciones.find((c) => c.proceso === proceso);
    if (existente) {
      router.push(`${basePathCalidad}/caracterizaciones/${existente.id}`);
      return;
    }
    const codigo = siguienteCodigo(caracterizaciones.map((c) => numeroDeCodigo(c.codigo)));
    const nueva = caracterizacionVacia(proceso, categoria, codigo);
    await saveCalidad(ITEM_KEY_CARACTERIZACIONES, JSON.stringify([...caracterizaciones, nueva]));
    router.push(`${basePathCalidad}/caracterizaciones/${nueva.id}`);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 overflow-hidden mb-6">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#F5A623" }}>
              Paso 3 de 3
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Mapa de Procesos</h1>
            <p className="text-gray-400 text-sm mt-1">ISO 9001, cláusula 4.4 — Enfoque basado en procesos</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white text-2xl font-extrabold">{procesos.length}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wide">Procesos</p>
            </div>
            <Link
              href={`${basePath}/mapa_procesos/clasificar`}
              className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2.5 rounded-lg flex-shrink-0"
            >
              ✎ Editar clasificación
            </Link>
          </div>
        </div>
      </div>

      {vacio ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no armaste tu mapa de procesos.</p>
          <Link
            href={`${basePath}/mapa_procesos`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Empezar
          </Link>
        </div>
      ) : (
        <div className="relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 overflow-hidden">
          <p className="relative text-center text-xs text-gray-400 mb-4">
            Hacé clic en un proceso para ver o crear su caracterización
          </p>
          {profile?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logo_url}
              alt=""
              className="absolute right-6 bottom-6 w-40 h-40 object-contain opacity-[0.05] pointer-events-none select-none"
            />
          )}
          <div className="relative flex items-stretch gap-3 sm:gap-4">
            <BandaLateral icono={Users} texto="Requisitos del cliente y partes interesadas" variante="entrada" />

            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <Banda
                icono={Target}
                titulo="Procesos Estratégicos"
                procesos={estrategicos}
                colorDesde="#4F46E5"
                colorHasta="#4338CA"
                onClickProceso={(p) => irACaracterizacion(p, "estrategicos")}
              />

              <div className="flex justify-center text-gray-300 py-0.5">
                <ChevronDown size={16} className="animate-bounce" style={{ animationDuration: "1.6s" }} />
              </div>

              <Banda
                icono={Workflow}
                titulo="Procesos Misionales (cadena de valor)"
                procesos={misionales}
                conFlechas
                colorDesde="#F5A623"
                colorHasta="#e09410"
                onClickProceso={(p) => irACaracterizacion(p, "misionales")}
              />

              <div className="flex justify-center text-gray-300 py-0.5">
                <ChevronUp size={16} className="animate-bounce" style={{ animationDuration: "1.6s" }} />
              </div>

              <Banda
                icono={ShieldCheck}
                titulo="Procesos de Apoyo"
                procesos={apoyo}
                colorDesde="#0EA5A4"
                colorHasta="#0d8f8e"
                onClickProceso={(p) => irACaracterizacion(p, "apoyo")}
              />
            </div>

            <BandaLateral icono={Heart} texto="Satisfacción del cliente y partes interesadas" variante="salida" />
          </div>
        </div>
      )}
    </div>
  );
}
