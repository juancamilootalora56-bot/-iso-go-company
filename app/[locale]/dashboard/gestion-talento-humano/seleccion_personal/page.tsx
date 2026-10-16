"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
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

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión del Talento Humano
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Selección y Contratación de Personal</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-xl">
            Pipeline de reclutamiento: requerimiento, búsqueda, entrevistas, test de habilidades, selección y
            contratación de cada vacante.
          </p>
        </div>
        <button onClick={nuevaVacante} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm flex-shrink-0">
          + Nuevo requerimiento
        </button>
      </div>

      {vacantes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]">
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
  return (
    <Link href={href} className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_16px_-4px_rgba(245,166,35,0.2)] transition-all">
      <div className="flex items-start justify-between gap-2">
        <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FFF6E5] text-[#F5A623] flex items-center justify-center text-base">💼</span>
        <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: colorEstadoVacante(vacante.estado) }}>
          {vacante.estado}
        </span>
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A] mt-2.5">{vacante.cargo || "Sin nombre de cargo"}</p>
      <p className="text-xs text-gray-400">{vacante.codigo} {vacante.area && <>· {vacante.area}</>}</p>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        {activos > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{activos} en proceso</span>
        )}
        {contratados > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600">{contratados} contratado{contratados !== 1 ? "s" : ""}</span>
        )}
        {activos === 0 && contratados === 0 && <span className="text-[10px] text-gray-300">Sin candidatos todavía</span>}
      </div>
    </Link>
  );
}
