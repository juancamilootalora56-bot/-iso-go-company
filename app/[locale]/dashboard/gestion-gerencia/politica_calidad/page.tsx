"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { ESTRUCTURA_POLITICA, estructuraVacia, parseEstructura } from "@/lib/politicaCalidadEstructura";

const ITEM_KEY_ESTRUCTURA = "politica_calidad_estructura";
const COLOR = "#6366F1";

export default function PoliticaCalidadEstructuraPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [form, setForm] = useState<Record<string, string>>(estructuraVacia());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setForm(parseEstructura(docs[ITEM_KEY_ESTRUCTURA] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY_ESTRUCTURA, JSON.stringify(form));
    setSaving(false);
    router.push(`${basePath}/politica_calidad/redactar`);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const respondidos = Object.values(form).filter((v) => v.trim()).length;
  const totalCampos = ESTRUCTURA_POLITICA.reduce((s, g) => s + g.campos.length, 0);

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden mb-6">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${COLOR}33` }} />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLOR }}>
              Gestión de la Gerencia
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
              <span>📜</span> Estructura de la Política de Calidad
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-md">
              Reflexioná sobre cada elemento que debe contener la política: compromiso con el cliente, mejora
              continua, cumplimiento de requisitos y marco para los objetivos.
            </p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-white text-2xl font-extrabold">
              {respondidos}/{totalCampos}
            </p>
            <p className="text-gray-400 text-[10px] uppercase tracking-wide">Respondidas</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {ESTRUCTURA_POLITICA.map((g) => (
          <div key={g.grupo} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 border-l-4" style={{ borderColor: COLOR, background: `${COLOR}0A` }}>
              <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: COLOR }}>
                {g.grupo}
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {g.campos.map((c) => (
                <div key={c.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{c.pregunta}</label>
                  <textarea
                    value={form[c.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))}
                    rows={2}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[color:var(--ac)]/15 focus:border-[color:var(--ac)] transition-colors resize-y"
                    style={{ "--ac": COLOR } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 transition-colors"
        >
          {saving ? "Guardando..." : "Guardar y redactar Política →"}
        </button>
      </div>
    </div>
  );
}
