"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseLista, parseClasificacion } from "@/lib/mapaProcesos";
import { parseCaracterizaciones, caracterizacionVacia, siguienteCodigo, numeroDeCodigo } from "@/lib/caracterizacionProcesos";
import MapaProcesosOrbitCompleto from "@/components/dashboard/MapaProcesosOrbitCompleto";

const ITEM_KEY_SELECCION = "mapa_procesos_seleccion";
const ITEM_KEY_CLASIFICACION = "mapa_procesos_clasificacion";
const ITEM_KEY_CARACTERIZACIONES = "caracterizaciones_lista";

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
      router.push(`${basePathCalidad}/caracterizaciones/${existente.id}?origen=mapa`);
      return;
    }
    const codigo = siguienteCodigo(caracterizaciones.map((c) => numeroDeCodigo(c.codigo)));
    const nueva = caracterizacionVacia(proceso, categoria, codigo);
    await saveCalidad(ITEM_KEY_CARACTERIZACIONES, JSON.stringify([...caracterizaciones, nueva]));
    router.push(`${basePathCalidad}/caracterizaciones/${nueva.id}?origen=mapa`);
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
        <MapaProcesosOrbitCompleto
          estrategicos={estrategicos}
          misionales={misionales}
          apoyo={apoyo}
          logoUrl={profile?.logo_url ?? null}
          companyLabel={profile?.company_name || "ISO Go"}
          onClickProceso={irACaracterizacion}
        />
      )}
    </div>
  );
}
