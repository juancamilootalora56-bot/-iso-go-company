"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Briefcase, Plus, Users, UserCheck, ClipboardList } from "lucide-react";
import {
  parseVacantes,
  parseCandidatos,
  vacanteVacia,
  siguienteCodigo,
  numeroDeCodigo,
  colorEstadoVacante,
  ESTADOS_VACANTE,
  type Vacante,
} from "@/lib/seleccionPersonal";

const ITEM_KEY_VACANTES = "seleccion_vacantes_lista";
const ITEM_KEY_CANDIDATOS = "seleccion_candidatos_lista";
const NARANJA = "#F5A623";

export default function SeleccionPersonalPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading, save } = useGestionDocumentos("talento_humano", user?.id ?? null);

  const vacantes = useMemo(() => parseVacantes(docs[ITEM_KEY_VACANTES] ?? ""), [docs]);
  const candidatos = useMemo(() => parseCandidatos(docs[ITEM_KEY_CANDIDATOS] ?? ""), [docs]);
  const [filtroEstado, setFiltroEstado] = useState("");

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  async function nuevaVacante() {
    const codigo = siguienteCodigo(vacantes.map((v) => numeroDeCodigo(v.codigo)));
    const nueva = vacanteVacia(codigo);
    await save(ITEM_KEY_VACANTES, JSON.stringify([...vacantes, nueva]));
    router.push(`${basePath}/seleccion_personal/${nueva.id}`);
  }

  const filtradas = vacantes.filter((v) => !filtroEstado || v.estado === filtroEstado);
  const vacantesAbiertas = vacantes.filter((v) => v.estado === "Abierta").length;
  const candidatosActivos = candidatos.filter((c) => c.etapa !== "Descartado" && c.etapa !== "Contratado").length;
  const contratados = candidatos.filter((c) => c.etapa === "Contratado").length;

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión del Talento Humano
      </Link>

      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${NARANJA}33` }} />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Selección y Contratación de Personal</h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              Pipeline de reclutamiento: requerimiento, búsqueda, entrevistas, test de habilidades, selección y
              contratación de cada vacante.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`${basePath}/seleccion_personal/test_habilidades`}
              className="flex items-center gap-1.5 bg-white/10 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-white/15 transition-colors text-sm"
            >
              <ClipboardList size={16} strokeWidth={2.5} /> Test de Habilidades
            </Link>
            <button
              onClick={nuevaVacante}
              className="flex items-center gap-1.5 bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm"
            >
              <Plus size={16} strokeWidth={2.5} /> Nuevo requerimiento
            </button>
          </div>
        </div>

        {vacantes.length > 0 && (
          <div className="relative z-10 flex items-center gap-5 mt-5 pt-5 border-t border-white/10 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{vacantesAbiertas}</span>
              <span className="text-xs text-gray-400">vacantes abiertas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: NARANJA }}>{candidatosActivos}</span>
              <span className="text-xs text-gray-400">candidatos en proceso</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-400">{contratados}</span>
              <span className="text-xs text-gray-400">contratados</span>
            </div>
          </div>
        )}
      </div>

      {vacantes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_VACANTE.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      )}

      {vacantes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <Briefcase size={28} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
          <p className="text-gray-500 text-sm mb-2">Todavía no hay requerimientos de personal cargados.</p>
          <button onClick={nuevaVacante} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
            Crear el primero →
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtradas.map((v) => {
            const candidatosVacante = candidatos.filter((c) => c.vacanteId === v.id);
            const activos = candidatosVacante.filter((c) => c.etapa !== "Descartado" && c.etapa !== "Contratado").length;
            const contratados = candidatosVacante.filter((c) => c.etapa === "Contratado").length;
            return (
              <TarjetaVacante key={v.id} vacante={v} activos={activos} contratados={contratados} href={`${basePath}/seleccion_personal/${v.id}`} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TarjetaVacante({ vacante, activos, contratados, href }: { vacante: Vacante; activos: number; contratados: number; href: string }) {
  const color = colorEstadoVacante(vacante.estado);
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: `${color}18` }}>
          <Briefcase size={18} style={{ color }} strokeWidth={2} />
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: color }}>
          {vacante.estado}
        </span>
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A] mt-2.5">{vacante.cargo || "Sin nombre de cargo"}</p>
      <p className="text-xs text-gray-400">{vacante.codigo} {vacante.area && <>· {vacante.area}</>}</p>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        {activos > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
            <Users size={11} strokeWidth={2.5} /> {activos} en proceso
          </span>
        )}
        {contratados > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
            <UserCheck size={11} strokeWidth={2.5} /> {contratados} contratado{contratados !== 1 ? "s" : ""}
          </span>
        )}
        {activos === 0 && contratados === 0 && <span className="text-[10px] text-gray-300">Sin candidatos todavía</span>}
      </div>
    </Link>
  );
}
