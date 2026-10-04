"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { COLORES_VALORES, parseValores, valoresVacios } from "@/lib/valoresEstructura";

const ITEM_KEY_VALORES = "valores_lista";

export default function ValoresListaPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [valores, setValores] = useState<string[]>(valoresVacios());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setValores(parseValores(docs[ITEM_KEY_VALORES] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function update(idx: number, valor: string) {
    setValores((prev) => prev.map((v, i) => (i === idx ? valor : v)));
  }

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY_VALORES, JSON.stringify(valores));
    setSaving(false);
    router.push(`${basePath}/valores_organizacionales/resultado`);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`${basePath}/valores_organizacionales`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Editar estructura
      </Link>

      <div className="mb-2">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Valores Organizacionales</h1>
        <p className="text-gray-500 text-sm mt-1">Definición de los 7 valores</p>
      </div>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Describan los 7 valores que quieren reflejar en su organización, del más al menos prioritario.
      </p>

      <div className="space-y-4">
        {valores.map((v, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-semibold w-4 flex-shrink-0">{idx + 1}</span>
            <input
              value={v}
              onChange={(e) => update(idx, e.target.value)}
              placeholder={`Valor ${idx + 1}`}
              className="flex-1 bg-white border-2 rounded-lg px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none"
              style={{ borderColor: COLORES_VALORES[idx] }}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar y ver pirámide →"}
        </button>
      </div>
    </div>
  );
}
