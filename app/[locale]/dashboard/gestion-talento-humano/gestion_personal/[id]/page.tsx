"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parsePersonal } from "@/lib/personal";
import EntrevistaPersonalForm from "@/components/dashboard/EntrevistaPersonalForm";

const ITEM_KEY = "personal_lista";

const TABS = [
  { key: "generales", label: "Datos Generales" },
  { key: "entrevista", label: "Entrevista" },
  { key: "referencias", label: "Referencias" },
  { key: "funciones", label: "Funciones" },
  { key: "capacitacion", label: "Capacitación" },
];

function Dato({ label, valor }: { label: string; valor?: string }) {
  if (!valor) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">{label}</p>
      <p className="text-sm text-[#1A1A1A]">{valor}</p>
    </div>
  );
}

function fechaLegible(iso?: string) {
  if (!iso) return undefined;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function PerfilPersonalPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const [tab, setTab] = useState("generales");

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const personal = parsePersonal(docs[ITEM_KEY] ?? "");
  const p = personal.find((x) => x.id === id);

  if (!p) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`${basePath}/gestion_personal`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
          ← Gestión del Personal
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">No se encontró este colaborador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={`${basePath}/gestion_personal`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión del Personal
      </Link>

      {/* Encabezado */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="relative w-24 h-24 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden mx-auto sm:mx-0">
          {p.foto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.foto} alt={p.nombre} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="text-xl font-bold text-[#1A1A1A]">{p.nombre} {p.apellido}</h1>
          <p className="text-[#F5A623] font-semibold text-sm">{p.cargo || "—"}</p>
          <div className="flex items-center justify-center sm:justify-start gap-x-4 gap-y-1 flex-wrap text-xs text-gray-500 mt-2">
            {p.area && <span>🏢 {p.area}</span>}
            {p.identificacion && <span>🪪 {p.identificacion}</span>}
            {p.nacionalidad && <span>🌎 {p.nacionalidad}</span>}
            {p.email && <span>✉️ {p.email}</span>}
          </div>
        </div>
        <Link
          href={`${basePath}/alta_personal`}
          className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410] flex-shrink-0 self-center sm:self-start"
        >
          ✎ Editar datos
        </Link>
      </div>

      {/* Pestañas */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
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

        <div className="p-6">
          {tab === "generales" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Datos personales</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Dato label="Identificación" valor={p.identificacion} />
                  <Dato label="Fecha de nacimiento" valor={fechaLegible(p.fechaNacimiento)} />
                  <Dato label="Género" valor={p.genero} />
                  <Dato label="Estado civil" valor={p.estadoCivil} />
                  <Dato label="Nacionalidad" valor={p.nacionalidad} />
                  <Dato label="Teléfono" valor={p.telefono} />
                  <Dato label="Email" valor={p.email} />
                  <Dato label="Dirección" valor={p.direccion} />
                </div>
              </div>

              {(p.contactoEmergenciaNombre || p.contactoEmergenciaTelefono) && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Contacto de emergencia</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Dato label="Nombre" valor={p.contactoEmergenciaNombre} />
                    <Dato label="Parentesco" valor={p.contactoEmergenciaParentesco} />
                    <Dato label="Teléfono" valor={p.contactoEmergenciaTelefono} />
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Datos laborales</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Dato label="Fecha de ingreso" valor={fechaLegible(p.fechaIngreso)} />
                  <Dato label="Jefe directo" valor={p.jefeDirecto} />
                  <Dato label="Tipo de contrato" valor={p.tipoContrato} />
                  <Dato label="Jornada" valor={p.jornada} />
                  <Dato label="Salario" valor={p.salario} />
                </div>
              </div>

              {(p.nivelEducativo || p.profesion) && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Formación</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Dato label="Nivel educativo" valor={p.nivelEducativo} />
                    <Dato label="Profesión / Título" valor={p.profesion} />
                  </div>
                </div>
              )}

              {p.observaciones && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Observaciones</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{p.observaciones}</p>
                </div>
              )}
            </div>
          )}

          {tab === "entrevista" && <EntrevistaPersonalForm userId={user?.id ?? null} empleado={p} />}

          {tab !== "generales" && tab !== "entrevista" && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <span className="text-3xl mb-3">
                {tab === "referencias" && "📇"}
                {tab === "funciones" && "📋"}
                {tab === "capacitacion" && "🎓"}
              </span>
              <p className="text-gray-500 text-sm font-medium">
                {TABS.find((t) => t.key === tab)?.label} — Próximamente
              </p>
              <p className="text-gray-400 text-xs mt-1 max-w-xs">
                Esta sección del perfil de {p.nombre} va a estar disponible pronto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
