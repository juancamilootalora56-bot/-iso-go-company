"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion, Dato } from "@/components/dashboard/SeccionDocumento";
import { parseProyectosDiseno, colorEstadoProyectoDiseno } from "@/lib/disenoDesarrollo";
import DiagramaEtapasDiseno from "@/components/dashboard/DiagramaEtapasDiseno";
import PlanificacionDisenoForm from "@/components/dashboard/PlanificacionDisenoForm";
import EntradasDisenoForm from "@/components/dashboard/EntradasDisenoForm";
import SalidasDisenoForm from "@/components/dashboard/SalidasDisenoForm";
import ControlDisenoForm from "@/components/dashboard/ControlDisenoForm";
import CambiosDisenoForm from "@/components/dashboard/CambiosDisenoForm";

const ITEM_KEY = "proyectos_diseno_lista";

const TABS = [
  { key: "generales", label: "Datos Generales" },
  { key: "planificacion", label: "Planificación" },
  { key: "entradas", label: "Entradas" },
  { key: "salidas", label: "Salidas" },
  { key: "control", label: "Revisión, Verificación y Validación" },
  { key: "cambios", label: "Control de Cambios" },
];

function fechaLegible(iso?: string) {
  if (!iso) return undefined;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function PerfilProyectoDisenoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-diseno-desarrollo`;

  const { docs, loading } = useGestionDocumentos("diseno_desarrollo", user?.id ?? null);
  const [tab, setTab] = useState("generales");

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const proyectos = parseProyectosDiseno(docs[ITEM_KEY] ?? "");
  const p = proyectos.find((x) => x.id === id);

  if (!p) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`${basePath}/proyectos`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
          ← Proyectos de Diseño
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">No se encontró este proyecto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Link href={`${basePath}/proyectos`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Proyectos de Diseño
      </Link>

      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 overflow-hidden flex flex-col sm:flex-row sm:items-center gap-5">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#14B8A6]/20 rounded-full blur-3xl" />

        <div className="relative w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 flex-shrink-0 overflow-hidden mx-auto sm:mx-0 z-10 flex items-center justify-center">
          {p.imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">🧪</span>
          )}
        </div>
        <div className="relative flex-1 min-w-0 text-center sm:text-left z-10">
          <h1 className="text-xl font-bold text-white">{p.nombre}</h1>
          {p.codigo && <p className="text-[#14B8A6] font-semibold text-sm">{p.codigo}</p>}
          <div className="flex items-center justify-center sm:justify-start gap-x-4 gap-y-1 flex-wrap text-xs text-gray-400 mt-2">
            {p.tipo && <span>🏷️ {p.tipo}</span>}
            {p.responsableDiseno && <span>👤 {p.responsableDiseno}</span>}
            {p.clienteSolicitante && <span>🏢 {p.clienteSolicitante}</span>}
          </div>
          {p.estado && (
            <span
              className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: colorEstadoProyectoDiseno(p.estado) }}
            >
              {p.estado}
            </span>
          )}
        </div>
        <Link
          href={`${basePath}/inscripcion_proyecto`}
          className="relative z-10 text-xs font-semibold text-[#14B8A6] hover:text-[#0d9488] flex-shrink-0 self-center sm:self-start bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
        >
          ✎ Editar datos
        </Link>
      </div>

      {/* Diagrama del ciclo de diseño: se remonta al cambiar de pestaña para reflejar los últimos datos guardados */}
      <DiagramaEtapasDiseno key={tab} userId={user?.id ?? null} proyecto={p} />

      {/* Pestañas */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto sticky top-0 z-20">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? "border-[#F5A623] text-[#1A1A1A]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      {tab === "generales" && (
        <div className="space-y-4">
          <Seccion icono="🧪" titulo="Datos del proyecto">
            <div className="grid sm:grid-cols-3 gap-3">
              <Dato icono="🪪" label="Código" valor={p.codigo} />
              <Dato icono="🏷️" label="Tipo" valor={p.tipo} />
              <Dato icono="👤" label="Responsable de diseño" valor={p.responsableDiseno} />
              <Dato icono="🏢" label="Cliente / solicitante" valor={p.clienteSolicitante} />
            </div>
            {p.descripcion && (
              <p className="text-sm text-gray-600 whitespace-pre-wrap mt-3 pt-3 border-t border-gray-100">{p.descripcion}</p>
            )}
          </Seccion>

          <Seccion icono="📅" titulo="Cronograma">
            <div className="grid sm:grid-cols-3 gap-3">
              <Dato icono="🚀" label="Fecha de inicio" valor={fechaLegible(p.fechaInicio)} />
              <Dato icono="🎯" label="Fin planeado" valor={fechaLegible(p.fechaFinPlaneada)} />
              <Dato icono="🏁" label="Fin real" valor={fechaLegible(p.fechaFinReal)} />
            </div>
            {p.observaciones && (
              <p className="text-sm text-gray-600 whitespace-pre-wrap mt-3 pt-3 border-t border-gray-100">{p.observaciones}</p>
            )}
          </Seccion>
        </div>
      )}

      {tab === "planificacion" && <PlanificacionDisenoForm userId={user?.id ?? null} proyecto={p} />}
      {tab === "entradas" && <EntradasDisenoForm userId={user?.id ?? null} proyecto={p} />}
      {tab === "salidas" && <SalidasDisenoForm userId={user?.id ?? null} proyecto={p} />}
      {tab === "control" && <ControlDisenoForm userId={user?.id ?? null} proyecto={p} />}
      {tab === "cambios" && <CambiosDisenoForm userId={user?.id ?? null} proyectoFijo={p} />}
    </div>
  );
}
