"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { COLORES_VALORES, parseValores, valoresVacios, type ValorOrganizacional } from "@/lib/valoresEstructura";

const ITEM_KEY_VALORES = "valores_lista";

export default function ValoresListaPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [valores, setValores] = useState<ValorOrganizacional[]>(valoresVacios());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setValores(parseValores(docs[ITEM_KEY_VALORES] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function update(idx: number, campo: keyof ValorOrganizacional, valor: string) {
    setValores((prev) => prev.map((v, i) => (i === idx ? { ...v, [campo]: valor } : v)));
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

  const completos = valores.filter((v) => v.nombre.trim()).length;

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <Link href={`${basePath}/valores_organizacionales`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Editar estructura
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
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#F5A623" }}>
              Gestión de la Gerencia
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
              <span>💎</span> Valores Organizacionales
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-md">
              Describí los 7 valores que querés reflejar, del más al menos prioritario.
            </p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-white text-2xl font-extrabold">{completos}/7</p>
            <p className="text-gray-400 text-[10px] uppercase tracking-wide">Definidos</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {valores.map((v, idx) => (
          <div
            key={idx}
            className="flex gap-3 bg-white rounded-2xl border-2 p-4 shadow-sm"
            style={{ borderColor: `${COLORES_VALORES[idx]}55` }}
          >
            <span
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
              style={{ backgroundColor: COLORES_VALORES[idx] }}
            >
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Valor</label>
                <input
                  value={v.nombre}
                  onChange={(e) => update(idx, "nombre", e.target.value)}
                  placeholder={`Nombre del valor ${idx + 1}`}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[color:var(--ac)]/15 focus:border-[color:var(--ac)] transition-colors"
                  style={{ "--ac": COLORES_VALORES[idx] } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">¿Qué significa este valor para la empresa?</label>
                <textarea
                  value={v.descripcion}
                  onChange={(e) => update(idx, "descripcion", e.target.value)}
                  placeholder="Describan brevemente este valor..."
                  rows={2}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[color:var(--ac)]/15 focus:border-[color:var(--ac)] transition-colors resize-y"
                  style={{ "--ac": COLORES_VALORES[idx] } as React.CSSProperties}
                />
              </div>
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
          {saving ? "Guardando..." : "Guardar y ver pirámide →"}
        </button>
      </div>
    </div>
  );
}
