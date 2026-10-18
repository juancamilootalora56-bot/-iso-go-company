"use client";

import { useState } from "react";
import {
  MODULOS_PERMISOS,
  ACTIVIDADES_POR_MODULO,
  ETAPAS_POR_ACTIVIDAD,
  type PermisosColaborador,
  type PermisoActividad,
} from "@/lib/colaboradoresCliente";

export default function SelectorPermisosColaborador({
  value,
  onChange,
}: {
  value: PermisosColaborador;
  onChange: (p: PermisosColaborador) => void;
}) {
  const [moduloAbierto, setModuloAbierto] = useState<string | null>(null);

  function toggleCompleto(modulo: string) {
    const actual = value[modulo];
    const yaCompleto = actual && "completo" in actual && actual.completo;
    const next = { ...value };
    if (yaCompleto) {
      delete next[modulo];
    } else {
      next[modulo] = { completo: true };
    }
    onChange(next);
  }

  function toggleActividad(modulo: string, actividad: string) {
    const actual = value[modulo];
    const actividades = actual && "actividades" in actual ? { ...actual.actividades } : {};
    if (actividad in actividades) {
      delete actividades[actividad];
    } else {
      actividades[actividad] = true;
    }
    const next = { ...value };
    if (Object.keys(actividades).length === 0) {
      delete next[modulo];
    } else {
      next[modulo] = { actividades };
    }
    onChange(next);
  }

  function toggleEtapa(modulo: string, actividad: string, etapa: string) {
    const actual = value[modulo];
    if (!actual || !("actividades" in actual)) return;
    const actividades = { ...actual.actividades };
    const permisoActual = actividades[actividad];
    const etapasActuales = permisoActual === true ? ETAPAS_POR_ACTIVIDAD[actividad] ?? [] : permisoActual?.etapas ?? [];
    const nuevasEtapas = etapasActuales.includes(etapa)
      ? etapasActuales.filter((e) => e !== etapa)
      : [...etapasActuales, etapa];
    const todasLasEtapas = ETAPAS_POR_ACTIVIDAD[actividad] ?? [];
    const nuevoPermiso: PermisoActividad =
      nuevasEtapas.length === todasLasEtapas.length ? true : { etapas: nuevasEtapas };
    actividades[actividad] = nuevoPermiso;
    onChange({ ...value, [modulo]: { actividades } });
  }

  return (
    <div className="space-y-2">
      {MODULOS_PERMISOS.map((m) => {
        const permisoModulo = value[m.modulo];
        const completo = !!(permisoModulo && "completo" in permisoModulo && permisoModulo.completo);
        const actividades = permisoModulo && "actividades" in permisoModulo ? permisoModulo.actividades : {};
        const cantidadActividades = Object.keys(actividades).length;
        const abierto = moduloAbierto === m.modulo;
        const catalogo = ACTIVIDADES_POR_MODULO[m.modulo] ?? [];

        return (
          <div key={m.modulo} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#FAFAFA]">
              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                <input type="checkbox" checked={completo} onChange={() => toggleCompleto(m.modulo)} className="w-4 h-4 accent-[#F5A623] flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">
                  {m.icon} {m.label}
                </span>
              </label>
              <button
                type="button"
                onClick={() => setModuloAbierto(abierto ? null : m.modulo)}
                disabled={completo}
                className="text-[11px] font-semibold text-gray-400 hover:text-[#1A1A1A] disabled:opacity-30 flex-shrink-0"
              >
                {completo ? "acceso completo" : `${cantidadActividades > 0 ? `${cantidadActividades} actividad${cantidadActividades !== 1 ? "es" : ""}` : "elegir actividades"} ${abierto ? "▲" : "▼"}`}
              </button>
            </div>

            {abierto && !completo && (
              <div className="p-3 space-y-2 border-t border-gray-100">
                {catalogo.map((a) => {
                  const permisoActividad = actividades[a.actividad];
                  const tieneAcceso = permisoActividad !== undefined;
                  const esPipeline = a.actividad in ETAPAS_POR_ACTIVIDAD;
                  const etapasDeEstaActividad = ETAPAS_POR_ACTIVIDAD[a.actividad] ?? [];
                  const etapasSeleccionadas =
                    permisoActividad === true ? etapasDeEstaActividad : permisoActividad?.etapas ?? [];

                  return (
                    <div key={a.actividad}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tieneAcceso}
                          onChange={() => toggleActividad(m.modulo, a.actividad)}
                          className="w-3.5 h-3.5 accent-[#F5A623]"
                        />
                        <span className="text-xs text-gray-600">{a.label}</span>
                      </label>
                      {tieneAcceso && esPipeline && (
                        <div className="ml-6 mt-1 flex flex-wrap gap-2">
                          {etapasDeEstaActividad.map((etapa) => (
                            <label key={etapa} className="flex items-center gap-1 cursor-pointer bg-white border border-gray-200 rounded-full px-2 py-0.5">
                              <input
                                type="checkbox"
                                checked={etapasSeleccionadas.includes(etapa)}
                                onChange={() => toggleEtapa(m.modulo, a.actividad, etapa)}
                                className="w-3 h-3 accent-[#F5A623]"
                              />
                              <span className="text-[10px] text-gray-500">{etapa}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {catalogo.length === 0 && <p className="text-[11px] text-gray-400">Sin actividades configuradas.</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
