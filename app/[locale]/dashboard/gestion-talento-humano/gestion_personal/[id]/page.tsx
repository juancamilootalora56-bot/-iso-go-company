"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parsePersonal } from "@/lib/personal";
import { Seccion, Dato } from "@/components/dashboard/SeccionDocumento";
import EntrevistaPersonalForm from "@/components/dashboard/EntrevistaPersonalForm";
import ManualFuncionesForm from "@/components/dashboard/ManualFuncionesForm";
import CapacitacionPersonalForm from "@/components/dashboard/CapacitacionPersonalForm";
import ReferenciasPersonalForm from "@/components/dashboard/ReferenciasPersonalForm";

const ITEM_KEY = "personal_lista";

const TABS = [
  { key: "generales", label: "Datos Generales" },
  { key: "entrevista", label: "Entrevista" },
  { key: "referencias", label: "Referencias" },
  { key: "funciones", label: "Funciones" },
  { key: "capacitacion", label: "Capacitación" },
];

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
    <div className="max-w-4xl mx-auto space-y-4">
      <Link href={`${basePath}/gestion_personal`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión del Personal
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

        <div className="relative w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex-shrink-0 overflow-hidden mx-auto sm:mx-0 z-10">
          {p.foto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.foto} alt={p.nombre} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="relative flex-1 min-w-0 text-center sm:text-left z-10">
          <h1 className="text-xl font-bold text-white">{p.nombre} {p.apellido}</h1>
          <p className="text-[#F5A623] font-semibold text-sm">{p.cargo || "—"}</p>
          <div className="flex items-center justify-center sm:justify-start gap-x-4 gap-y-1 flex-wrap text-xs text-gray-400 mt-2">
            {p.area && <span>🏢 {p.area}</span>}
            {p.identificacion && <span>🪪 {p.identificacion}</span>}
            {p.nacionalidad && <span>🌎 {p.nacionalidad}</span>}
            {p.email && <span>✉️ {p.email}</span>}
          </div>
        </div>
        <Link
          href={`${basePath}/alta_personal`}
          className="relative z-10 text-xs font-semibold text-[#F5A623] hover:text-[#e09410] flex-shrink-0 self-center sm:self-start bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
        >
          ✎ Editar datos
        </Link>
      </div>

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
          <Seccion icono="🪪" titulo="Datos personales">
            <div className="grid sm:grid-cols-3 gap-3">
              <Dato icono="🪪" label="Identificación" valor={p.identificacion} />
              <Dato icono="🎂" label="Fecha de nacimiento" valor={fechaLegible(p.fechaNacimiento)} />
              <Dato icono="⚧" label="Género" valor={p.genero} />
              <Dato icono="💍" label="Estado civil" valor={p.estadoCivil} />
              <Dato icono="🌎" label="Nacionalidad" valor={p.nacionalidad} />
              <Dato icono="📞" label="Teléfono" valor={p.telefono} />
              <Dato icono="✉️" label="Email" valor={p.email} />
              <Dato icono="📍" label="Dirección" valor={p.direccion} />
            </div>
          </Seccion>

          {(p.contactoEmergenciaNombre || p.contactoEmergenciaTelefono) && (
            <Seccion icono="🚨" titulo="Contacto de emergencia">
              <div className="grid sm:grid-cols-3 gap-3">
                <Dato label="Nombre" valor={p.contactoEmergenciaNombre} />
                <Dato label="Parentesco" valor={p.contactoEmergenciaParentesco} />
                <Dato label="Teléfono" valor={p.contactoEmergenciaTelefono} />
              </div>
            </Seccion>
          )}

          <Seccion icono="💼" titulo="Datos laborales">
            <div className="grid sm:grid-cols-3 gap-3">
              <Dato icono="📅" label="Fecha de ingreso" valor={fechaLegible(p.fechaIngreso)} />
              <Dato icono="🧑‍💼" label="Jefe directo" valor={p.jefeDirecto} />
              <Dato icono="📄" label="Tipo de contrato" valor={p.tipoContrato} />
              <Dato icono="⏰" label="Jornada" valor={p.jornada} />
              <Dato icono="💵" label="Salario" valor={p.salario} />
            </div>
          </Seccion>

          {(p.nivelEducativo || p.profesion) && (
            <Seccion icono="🎓" titulo="Formación">
              <div className="grid sm:grid-cols-3 gap-3">
                <Dato label="Nivel educativo" valor={p.nivelEducativo} />
                <Dato label="Profesión / Título" valor={p.profesion} />
              </div>
            </Seccion>
          )}

          {p.observaciones && (
            <Seccion icono="📝" titulo="Observaciones">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{p.observaciones}</p>
            </Seccion>
          )}
        </div>
      )}

      {tab === "entrevista" && <EntrevistaPersonalForm userId={user?.id ?? null} empleado={p} />}
      {tab === "funciones" && <ManualFuncionesForm userId={user?.id ?? null} empleado={p} />}
      {tab === "capacitacion" && <CapacitacionPersonalForm userId={user?.id ?? null} empleado={p} />}
      {tab === "referencias" && <ReferenciasPersonalForm userId={user?.id ?? null} empleado={p} />}

      {tab !== "generales" && tab !== "entrevista" && tab !== "funciones" && tab !== "capacitacion" && tab !== "referencias" && (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-14 text-center">
          <p className="text-gray-500 text-sm font-medium">
            {TABS.find((t) => t.key === tab)?.label} — Próximamente
          </p>
          <p className="text-gray-400 text-xs mt-1 max-w-xs">
            Esta sección del perfil de {p.nombre} va a estar disponible pronto.
          </p>
        </div>
      )}
    </div>
  );
}
