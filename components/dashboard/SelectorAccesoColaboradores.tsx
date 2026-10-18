"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ColaboradorResumen = {
  empleadoId: string;
  nombre: string;
  apellido: string;
  cargo: string | null;
  foto: string | null;
};

// Botón + panel desplegable para elegir, desde un registro puntual
// (un procedimiento, un producto, un servicio), a qué colaboradores del
// dueño se les da acceso de solo lectura a ESE registro. Guarda IDs de
// Empleado (lib/personal.ts), no IDs de login — es el mismo identificador
// que ya usa el resto del sistema de colaboradores.
export default function SelectorAccesoColaboradores({
  ownerId,
  value,
  onChange,
}: {
  ownerId: string | null;
  value: string[];
  onChange: (empleadoIds: string[]) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [colaboradores, setColaboradores] = useState<ColaboradorResumen[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!ownerId) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("client_colaboradores")
        .select("empleado_id, nombre, apellido, cargo, foto")
        .eq("owner_id", ownerId)
        .eq("activo", true)
        .not("empleado_id", "is", null);
      setColaboradores(
        (data ?? []).map((c) => ({
          empleadoId: c.empleado_id as string,
          nombre: c.nombre,
          apellido: c.apellido,
          cargo: c.cargo,
          foto: c.foto,
        }))
      );
      setCargando(false);
    })();
  }, [ownerId]);

  function toggle(empleadoId: string) {
    onChange(value.includes(empleadoId) ? value.filter((id) => id !== empleadoId) : [...value, empleadoId]);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#1A1A1A] bg-white border border-gray-200 px-3 py-1.5 rounded-full"
      >
        👥 {value.length > 0 ? `Compartido con ${value.length} colaborador${value.length !== 1 ? "es" : ""}` : "¿Quién puede ver esto?"}
      </button>

      {abierto && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setAbierto(false)} />
          <div className="absolute z-40 top-full mt-2 right-0 w-72 bg-white rounded-xl border border-gray-200 shadow-lg p-3 max-h-80 overflow-y-auto">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">Colaboradores con acceso de lectura</p>
            {cargando && <p className="text-xs text-gray-400">Cargando...</p>}
            {!cargando && colaboradores.length === 0 && (
              <p className="text-xs text-gray-400">Todavía no creaste colaboradores en Perfil → Colaboradores.</p>
            )}
            <div className="space-y-1.5">
              {colaboradores.map((c) => (
                <label key={c.empleadoId} className="flex items-center gap-2 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={value.includes(c.empleadoId)}
                    onChange={() => toggle(c.empleadoId)}
                    className="w-3.5 h-3.5 accent-[#F5A623] flex-shrink-0"
                  />
                  <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {c.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.foto} alt={c.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px]">👤</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-700 truncate">
                    {c.nombre} {c.apellido}
                    {c.cargo && <span className="text-gray-400"> · {c.cargo}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
