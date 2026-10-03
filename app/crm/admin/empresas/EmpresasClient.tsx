"use client";

import { useMemo, useState } from "react";
import { etapaInfo } from "@/hooks/useLeads";

type LeadRow = {
  id: string;
  empresa: string | null;
  representante: string | null;
  nombre: string;
  cargo: string | null;
  rubro: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  num_colaboradores: number | null;
  etapa: string;
  created_by: string;
  created_at: string;
};

type Perfil = {
  id: string;
  nombre: string | null;
  email: string;
};

export default function EmpresasClient({
  initialLeads,
  perfiles,
}: {
  initialLeads: LeadRow[];
  perfiles: Perfil[];
}) {
  const [search, setSearch] = useState("");

  const perfilMap = useMemo(() => {
    const m = new Map<string, Perfil>();
    perfiles.forEach((p) => m.set(p.id, p));
    return m;
  }, [perfiles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return initialLeads;
    return initialLeads.filter((l) =>
      [l.empresa, l.representante, l.nombre, l.cargo, l.rubro, l.telefono, l.email, l.direccion]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [initialLeads, search]);

  const empresasUnicas = new Set(
    initialLeads.map((l) => (l.empresa || "").toLowerCase()).filter(Boolean)
  ).size;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A26]">Base de datos de empresas</h1>
          <p className="text-sm text-[#8A8478] mt-1">
            Se alimenta automáticamente de los leads cargados por todo el equipo comercial.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#E8E2D8] rounded-xl p-4">
          <p className="text-xs text-[#8A8478]">Registros totales</p>
          <p className="text-xl font-bold text-[#2D2A26]">{initialLeads.length}</p>
        </div>
        <div className="bg-white border border-[#E8E2D8] rounded-xl p-4">
          <p className="text-xs text-[#8A8478]">Empresas únicas</p>
          <p className="text-xl font-bold text-[#2D2A26]">{empresasUnicas}</p>
        </div>
        <div className="bg-white border border-[#E8E2D8] rounded-xl p-4">
          <p className="text-xs text-[#8A8478]">Comerciales activos</p>
          <p className="text-xl font-bold text-[#2D2A26]">{perfiles.length}</p>
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por empresa, contacto, rubro, teléfono..."
        className="w-full sm:max-w-sm bg-white border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] placeholder-[#B5AEA0] focus:outline-none focus:border-[#F5A623] mb-4"
      />

      <div className="bg-white border border-[#E8E2D8] rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="border-b border-[#E8E2D8] text-left text-[#8A8478]">
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Dueño / representante</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Cargo</th>
              <th className="px-4 py-3 font-medium">Rubro</th>
              <th className="px-4 py-3 font-medium">Teléfono</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Dirección</th>
              <th className="px-4 py-3 font-medium">Colab.</th>
              <th className="px-4 py-3 font-medium">Etapa</th>
              <th className="px-4 py-3 font-medium">Cargado por</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const info = etapaInfo(l.etapa);
              const comercial = perfilMap.get(l.created_by);
              return (
                <tr key={l.id} className="border-b border-[#E8E2D8] last:border-0 hover:bg-[#F0EBE2]">
                  <td className="px-4 py-3 font-semibold text-[#2D2A26]">{l.empresa || "—"}</td>
                  <td className="px-4 py-3 text-[#2D2A26]">{l.representante || "—"}</td>
                  <td className="px-4 py-3 text-[#2D2A26]">{l.nombre}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{l.cargo || "—"}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{l.rubro || "—"}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{l.telefono || "—"}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{l.email || "—"}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{l.direccion || "—"}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{l.num_colaboradores ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${info.color}22`, color: info.color }}
                    >
                      {info.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8A8478] text-xs">
                    {comercial?.nombre || comercial?.email || "—"}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-[#8A8478]">
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
