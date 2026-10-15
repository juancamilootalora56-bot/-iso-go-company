"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseCaracterizaciones, caracterizacionVacia, siguienteCodigo, numeroDeCodigo, completitud } from "@/lib/caracterizacionProcesos";
import { parseLista, parseClasificacion, CATEGORIAS_PROCESO } from "@/lib/mapaProcesos";

const ITEM_KEY = "caracterizaciones_lista";
const NARANJA = "#F97316";

const VISUAL_CATEGORIA: Record<string, { color: string; icono: string; descripcion: string }> = {
  estrategicos: { color: "#7C4DFF", icono: "🧭", descripcion: "Dirigen y orientan la organización" },
  misionales: { color: "#F97316", icono: "⚙️", descripcion: "Generan el producto o servicio para el cliente" },
  apoyo: { color: "#2EA3F2", icono: "🛠️", descripcion: "Proveen los recursos que necesitan los demás procesos" },
};
const VISUAL_DEFAULT = { color: "#9CA3AF", icono: "🧩", descripcion: "" };

export default function CaracterizacionesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const { docs: docsGerencia, loading: loadingGerencia } = useGestionDocumentos("gerencia", user?.id ?? null);

  const caracterizaciones = useMemo(() => parseCaracterizaciones(docs[ITEM_KEY] ?? ""), [docs]);
  const procesosMapa = useMemo(() => parseLista(docsGerencia["mapa_procesos_seleccion"] ?? ""), [docsGerencia]);
  const clasificacion = useMemo(() => parseClasificacion(docsGerencia["mapa_procesos_clasificacion"] ?? ""), [docsGerencia]);

  if (loading || loadingGerencia) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  async function abrirOCrear(proceso: string, categoria: string) {
    const existente = caracterizaciones.find((c) => c.proceso === proceso);
    if (existente) {
      router.push(`${basePath}/caracterizaciones/${existente.id}`);
      return;
    }
    const codigo = siguienteCodigo(caracterizaciones.map((c) => numeroDeCodigo(c.codigo)));
    const nueva = caracterizacionVacia(proceso, categoria, codigo);
    await save(ITEM_KEY, JSON.stringify([...caracterizaciones, nueva]));
    router.push(`${basePath}/caracterizaciones/${nueva.id}`);
  }

  const grupos = CATEGORIAS_PROCESO.map((cat) => ({
    ...cat,
    procesos: procesosMapa.filter((p) => (clasificacion[p] ?? "") === cat.key),
  })).filter((g) => g.procesos.length > 0);

  const sinClasificar = procesosMapa.filter((p) => !clasificacion[p]);

  const huerfanas = caracterizaciones.filter((c) => !procesosMapa.includes(c.proceso));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Calidad
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Caracterizaciones de Procesos</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Ficha visual tipo SIPOC de cada proceso del Mapa de Procesos: proveedores, entradas, actividades, salidas,
          clientes, recursos, indicadores y ciclo PHVA (ISO 9001, cl. 4.4).
        </p>
      </div>

      {procesosMapa.length === 0 ? (
        <div className="bg-[#FFF6E5] border border-[#F5A623]/30 rounded-xl p-6 text-sm text-gray-600 text-center">
          Primero cargá el <strong>Mapa de Procesos</strong> en Gestión de la Gerencia — las caracterizaciones se
          organizan según los procesos que definas ahí.
        </div>
      ) : (
        <div className="space-y-8">
          {grupos.map((g) => {
            const v = VISUAL_CATEGORIA[g.key] ?? VISUAL_DEFAULT;
            return (
              <div key={g.key}>
                <SeccionCategoria titulo={g.label} descripcion={v.descripcion} color={v.color} icono={v.icono} cantidad={g.procesos.length} />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {g.procesos.map((proceso) => (
                    <TarjetaProceso
                      key={proceso}
                      proceso={proceso}
                      color={v.color}
                      icono={v.icono}
                      caracterizacion={caracterizaciones.find((c) => c.proceso === proceso)}
                      onClick={() => abrirOCrear(proceso, g.key)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {sinClasificar.length > 0 && (
            <div>
              <SeccionCategoria titulo="Sin clasificar" descripcion="Todavía no tienen una categoría asignada en el Mapa de Procesos" color={VISUAL_DEFAULT.color} icono={VISUAL_DEFAULT.icono} cantidad={sinClasificar.length} />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sinClasificar.map((proceso) => (
                  <TarjetaProceso key={proceso} proceso={proceso} color={VISUAL_DEFAULT.color} icono={VISUAL_DEFAULT.icono} caracterizacion={caracterizaciones.find((c) => c.proceso === proceso)} onClick={() => abrirOCrear(proceso, "")} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {huerfanas.length > 0 && (
        <div>
          <SeccionCategoria titulo="Otras caracterizaciones" descripcion="Procesos que ya no están en el Mapa de Procesos actual" color={VISUAL_DEFAULT.color} icono={VISUAL_DEFAULT.icono} cantidad={huerfanas.length} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {huerfanas.map((c) => (
              <TarjetaProceso key={c.id} proceso={c.proceso} color={VISUAL_DEFAULT.color} icono={VISUAL_DEFAULT.icono} caracterizacion={c} onClick={() => router.push(`${basePath}/caracterizaciones/${c.id}`)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SeccionCategoria({
  titulo,
  descripcion,
  color,
  icono,
  cantidad,
}: {
  titulo: string;
  descripcion: string;
  color: string;
  icono: string;
  cantidad: number;
}) {
  return (
    <div className="flex items-center gap-3 mb-3 pb-2.5" style={{ borderBottom: `2px solid ${color}` }}>
      <span className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${color}1A` }}>
        {icono}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color }}>
            {titulo}
          </h2>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: color }}>
            {cantidad}
          </span>
        </div>
        {descripcion && <p className="text-xs text-gray-400 truncate">{descripcion}</p>}
      </div>
    </div>
  );
}

function TarjetaProceso({
  proceso,
  color,
  icono,
  caracterizacion,
  onClick,
}: {
  proceso: string;
  color: string;
  icono: string;
  caracterizacion?: ReturnType<typeof parseCaracterizaciones>[number];
  onClick: () => void;
}) {
  const pct = caracterizacion ? completitud(caracterizacion) : 0;
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.15)] transition-all"
      style={{ borderColor: `${color}30` }}
    >
      <div className="h-1" style={{ backgroundColor: color }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold" style={{ backgroundColor: `${color}1A`, color }}>
            {icono}
          </span>
          {caracterizacion ? (
            <span className="font-mono text-[10px] text-gray-400">{caracterizacion.codigo}</span>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Sin crear</span>
          )}
        </div>
        <p className="text-sm font-semibold text-[#1A1A1A] mt-2.5">{proceso}</p>

        {caracterizacion ? (
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
              <span>Completitud</span>
              <span className="font-bold" style={{ color: pct >= 80 ? "#22C55E" : pct >= 40 ? "#F5A623" : "#9CA3AF" }}>
                {pct}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "#22C55E" : pct >= 40 ? "#F5A623" : "#D1D5DB" }} />
            </div>
          </div>
        ) : (
          <p className="text-xs mt-2.5 font-semibold" style={{ color: NARANJA }}>
            + Crear caracterización
          </p>
        )}
      </div>
    </button>
  );
}
