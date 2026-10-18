"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseServicios, colorEstadoServicio } from "@/lib/servicios";
import { Seccion, Dato } from "@/components/dashboard/SeccionDocumento";
import ProcesoOperativoForm from "@/components/dashboard/ProcesoOperativoForm";
import DiagramaFlujoView from "@/components/dashboard/DiagramaFlujoView";

const ITEM_KEY = "servicios_lista";

const TABS = [
  { key: "generales", label: "Datos Generales" },
  { key: "proceso", label: "Proceso Operativo" },
  { key: "diagrama", label: "Diagrama de Flujo" },
];

function fechaLegible(iso?: string) {
  if (!iso) return undefined;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function PerfilServicioPage() {
  const { user, colaborador } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading } = useGestionDocumentos("operativa", user?.id ?? null);
  const [tab, setTab] = useState("generales");

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const servicios = parseServicios(docs[ITEM_KEY] ?? "");
  const s = servicios.find((x) => x.id === id);

  if (!s) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`${basePath}/lista_maestra_servicios`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
          ← Lista Maestra de Servicios
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">No se encontró este servicio.</p>
        </div>
      </div>
    );
  }

  const soloLectura = !!colaborador;
  if (colaborador && !s.colaboradoresConAcceso?.includes(colaborador.empleadoId ?? "")) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`${basePath}/lista_maestra_servicios`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
          ← Lista Maestra de Servicios
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">No tenés acceso a este servicio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Link href={`${basePath}/lista_maestra_servicios`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Lista Maestra de Servicios
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
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />

        <div className="relative w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 flex-shrink-0 overflow-hidden mx-auto sm:mx-0 z-10 flex items-center justify-center">
          {s.imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.imagen} alt={s.nombre} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">🧰</span>
          )}
        </div>
        <div className="relative flex-1 min-w-0 text-center sm:text-left z-10">
          <h1 className="text-xl font-bold text-white">{s.nombre}</h1>
          {s.codigo && <p className="text-[#F5A623] font-semibold text-sm">{s.codigo}</p>}
          <div className="flex items-center justify-center sm:justify-start gap-x-4 gap-y-1 flex-wrap text-xs text-gray-400 mt-2">
            {s.categoria && <span>🏷️ {s.categoria}</span>}
            {s.duracionEstimada > 0 && <span>⏱️ {s.duracionEstimada} {s.unidadDuracion.toLowerCase()}</span>}
          </div>
          {s.estado && (
            <span
              className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: colorEstadoServicio(s.estado) }}
            >
              {s.estado}
            </span>
          )}
        </div>
        {!soloLectura && (
          <Link
            href={`${basePath}/inscripcion_servicios`}
            className="relative z-10 text-xs font-semibold text-[#F5A623] hover:text-[#e09410] flex-shrink-0 self-center sm:self-start bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
          >
            ✎ Editar datos
          </Link>
        )}
      </div>

      {soloLectura && <p className="text-xs font-semibold text-gray-400">🔒 Modo solo lectura — no se puede modificar</p>}

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
          <Seccion icono="🧰" titulo="Datos del servicio">
            <div className="grid sm:grid-cols-3 gap-3">
              <Dato icono="🪪" label="Código" valor={s.codigo} />
              <Dato icono="🏷️" label="Categoría" valor={s.categoria} />
              <Dato icono="⏱️" label="Duración estimada" valor={s.duracionEstimada > 0 ? `${s.duracionEstimada} ${s.unidadDuracion.toLowerCase()}` : undefined} />
            </div>
            {s.descripcion && (
              <p className="text-sm text-gray-600 whitespace-pre-wrap mt-3 pt-3 border-t border-gray-100">{s.descripcion}</p>
            )}
          </Seccion>

          {s.criteriosAceptacion && (
            <Seccion icono="✅" titulo="Criterios de Aceptación">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{s.criteriosAceptacion}</p>
            </Seccion>
          )}

          <Seccion icono="📝" titulo="Registro">
            <div className="grid sm:grid-cols-3 gap-3">
              <Dato icono="📅" label="Fecha de alta" valor={fechaLegible(s.fechaAlta)} />
            </div>
            {s.observaciones && (
              <p className="text-sm text-gray-600 whitespace-pre-wrap mt-3 pt-3 border-t border-gray-100">{s.observaciones}</p>
            )}
          </Seccion>
        </div>
      )}

      {tab === "proceso" && (
        <fieldset disabled={soloLectura} className="border-0 p-0 m-0 min-w-0">
          <ProcesoOperativoForm userId={user?.id ?? null} entidadId={s.id} />
        </fieldset>
      )}
      {tab === "diagrama" && <DiagramaFlujoView userId={user?.id ?? null} entidadId={s.id} />}
    </div>
  );
}
