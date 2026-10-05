"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import EncabezadoDocumento from "@/components/dashboard/EncabezadoDocumento";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { ESTRUCTURA_POLITICA, parseEstructura } from "@/lib/politicaCalidadEstructura";

const ITEM_KEY_ESTRUCTURA = "politica_calidad_estructura";
const ITEM_KEY_POLITICA = "politica_calidad";

export default function RedactarPoliticaCalidadPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verEstructura, setVerEstructura] = useState(false);

  useEffect(() => {
    if (!loading) setTexto(docs[ITEM_KEY_POLITICA] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY_POLITICA, texto);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const estructura = parseEstructura(docs[ITEM_KEY_ESTRUCTURA] ?? "");
  const hayEstructura = Object.values(estructura).some((v) => v.trim().length > 0);

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`${basePath}/politica_calidad`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Editar estructura
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <span>📜</span> Política de Calidad
        </h1>
        <p className="text-gray-500 text-sm mt-1">Redactá la declaración final de la política.</p>
      </div>

      {hayEstructura && (
        <div className="mb-4 bg-white rounded-xl border border-gray-100 p-4">
          <button
            onClick={() => setVerEstructura((v) => !v)}
            className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410]"
          >
            {verEstructura ? "▾ Ocultar" : "▸ Ver"} tus respuestas de la estructura
          </button>
          {verEstructura && (
            <div className="mt-3 space-y-3">
              {ESTRUCTURA_POLITICA.map((g) => (
                <div key={g.grupo}>
                  <p className="text-xs font-bold text-blue-700 mb-1">{g.grupo}</p>
                  {g.campos.map(
                    (c) =>
                      estructura[c.key] && (
                        <p key={c.key} className="text-xs text-gray-600 mb-1">
                          <span className="text-gray-400">{c.pregunta}</span> {estructura[c.key]}
                        </p>
                      )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <EncabezadoDocumento />
        <label className="block text-xs font-medium text-gray-500 mb-1">Declaración de Política de Calidad</label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: En [Empresa] nos comprometemos a..."
          rows={8}
          className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] resize-y"
        />

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
        </div>
      </div>
    </div>
  );
}
