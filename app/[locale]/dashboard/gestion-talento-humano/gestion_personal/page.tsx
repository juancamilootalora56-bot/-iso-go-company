"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parsePersonal, type Empleado } from "@/lib/personal";

const ITEM_KEY = "personal_lista";

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

export default function GestionPersonalPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const [seleccionado, setSeleccionado] = useState<Empleado | null>(null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const personal = parsePersonal(docs[ITEM_KEY] ?? "");

  return (
    <div className="max-w-5xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión del Talento Humano
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión del Personal</h1>
          <p className="text-gray-500 text-sm mt-1">Perfil de cada colaborador cargado.</p>
        </div>
        <Link
          href={`${basePath}/alta_personal`}
          className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
        >
          + Agregar / editar personal
        </Link>
      </div>

      {personal.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no cargaste ningún colaborador.</p>
          <Link
            href={`${basePath}/alta_personal`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Cargar personal
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personal.map((p) => (
            <button
              key={p.id}
              onClick={() => setSeleccionado(p)}
              className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-[#F5A623]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.foto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.foto} alt={p.nombre} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[#1A1A1A] truncate">{p.nombre} {p.apellido}</p>
                  <p className="text-xs text-gray-500 truncate">{p.cargo || "—"}</p>
                  {p.area && <p className="text-[11px] text-gray-400 truncate">{p.area}</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {seleccionado && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSeleccionado(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado tipo carnet */}
            <div className="bg-[#1A1A1A] p-6 flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex-shrink-0 overflow-hidden">
                {seleccionado.foto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={seleccionado.foto} alt={seleccionado.nombre} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-lg truncate">{seleccionado.nombre} {seleccionado.apellido}</p>
                <p className="text-[#F5A623] text-sm font-semibold truncate">{seleccionado.cargo || "—"}</p>
                {seleccionado.area && <p className="text-gray-400 text-xs">{seleccionado.area}</p>}
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Datos personales</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Dato label="Identificación" valor={seleccionado.identificacion} />
                  <Dato label="Fecha de nacimiento" valor={fechaLegible(seleccionado.fechaNacimiento)} />
                  <Dato label="Género" valor={seleccionado.genero} />
                  <Dato label="Estado civil" valor={seleccionado.estadoCivil} />
                  <Dato label="Nacionalidad" valor={seleccionado.nacionalidad} />
                  <Dato label="Teléfono" valor={seleccionado.telefono} />
                  <Dato label="Email" valor={seleccionado.email} />
                  <Dato label="Dirección" valor={seleccionado.direccion} />
                </div>
              </div>

              {(seleccionado.contactoEmergenciaNombre || seleccionado.contactoEmergenciaTelefono) && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Contacto de emergencia</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Dato label="Nombre" valor={seleccionado.contactoEmergenciaNombre} />
                    <Dato label="Parentesco" valor={seleccionado.contactoEmergenciaParentesco} />
                    <Dato label="Teléfono" valor={seleccionado.contactoEmergenciaTelefono} />
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Datos laborales</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Dato label="Fecha de ingreso" valor={fechaLegible(seleccionado.fechaIngreso)} />
                  <Dato label="Jefe directo" valor={seleccionado.jefeDirecto} />
                  <Dato label="Tipo de contrato" valor={seleccionado.tipoContrato} />
                  <Dato label="Jornada" valor={seleccionado.jornada} />
                  <Dato label="Salario" valor={seleccionado.salario} />
                </div>
              </div>

              {(seleccionado.nivelEducativo || seleccionado.profesion) && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Formación</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Dato label="Nivel educativo" valor={seleccionado.nivelEducativo} />
                    <Dato label="Profesión / Título" valor={seleccionado.profesion} />
                  </div>
                </div>
              )}

              {seleccionado.observaciones && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Observaciones</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{seleccionado.observaciones}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <Link
                href={`${basePath}/alta_personal`}
                className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
              >
                ✎ Editar en Alta de Personal
              </Link>
              <button onClick={() => setSeleccionado(null)} className="text-sm text-gray-400 hover:text-gray-600">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
