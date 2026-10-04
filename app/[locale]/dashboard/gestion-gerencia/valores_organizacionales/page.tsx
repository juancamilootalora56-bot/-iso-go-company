"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { ESTRUCTURA_VALORES, estructuraVacia, parseEstructura } from "@/lib/valoresEstructura";

const ITEM_KEY_ESTRUCTURA = "valores_estructura";

export default function ValoresEstructuraPage() {
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
    router.push(`${basePath}/valores_organizacionales/valores`);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const inputClass =
    "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] resize-y";

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-2">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Valores Organizacionales</h1>
        <p className="text-gray-500 text-sm mt-1">Carga de la estructura de valores</p>
      </div>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Este formulario les permite reflexionar sobre los valores organizacionales de la empresa antes de
        definirlos. Consideren cómo cada valor contribuye a la misión y visión, y cómo se van a vivir en el
        día a día. Esto va a enriquecer la cultura y fortalecer el sentido de identidad del equipo.
      </p>

      <div className="space-y-6">
        {ESTRUCTURA_VALORES.map((g) => (
          <div key={g.grupo}>
            <h2 className="text-sm font-bold text-purple-700 border-b border-dashed border-purple-200 pb-1 mb-3">
              {g.grupo}
            </h2>
            <div className="space-y-3">
              {g.campos.map((c) => (
                <div key={c.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{c.pregunta}</label>
                  <textarea
                    value={form[c.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))}
                    rows={2}
                    className={inputClass}
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
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar y definir los 7 valores →"}
        </button>
      </div>
    </div>
  );
}
