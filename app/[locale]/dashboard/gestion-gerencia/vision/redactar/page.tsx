"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import EncabezadoDocumento from "@/components/dashboard/EncabezadoDocumento";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { ESTRUCTURA_VISION, parseEstructura } from "@/lib/visionEstructura";
import { ChevronDown } from "lucide-react";

const ITEM_KEY_ESTRUCTURA = "vision_estructura";
const ITEM_KEY_VISION = "vision";
const COLOR = "#2563EB";

function AutoTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 160)}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--ac)]/15 focus:border-[color:var(--ac)] resize-none overflow-hidden transition-colors leading-relaxed"
      style={{ "--ac": COLOR } as React.CSSProperties}
    />
  );
}

export default function RedactarVisionPage() {
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
    if (!loading) setTexto(docs[ITEM_KEY_VISION] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY_VISION, texto);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const estructura = parseEstructura(docs[ITEM_KEY_ESTRUCTURA] ?? "");
  const hayEstructura = Object.values(estructura).some((v) => v.trim().length > 0);
  const palabras = texto.trim() ? texto.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <Link href={`${basePath}/vision`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
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
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${COLOR}33` }} />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLOR }}>
            Gestión de la Gerencia
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
            <span>🔭</span> Visión
          </h1>
          <p className="text-gray-400 text-sm mt-1">Redactá la declaración final de la visión.</p>
        </div>
      </div>

      {hayEstructura && (
        <div className="mb-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setVerEstructura((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold"
            style={{ color: COLOR }}
          >
            Ver tus respuestas de la estructura
            <ChevronDown size={16} className={`transition-transform ${verEstructura ? "rotate-180" : ""}`} />
          </button>
          {verEstructura && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
              {ESTRUCTURA_VISION.map((g) => (
                <div key={g.grupo}>
                  <p className="text-xs font-bold mb-1" style={{ color: COLOR }}>{g.grupo}</p>
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

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <EncabezadoDocumento />
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-500">Declaración de Visión</label>
          <span className="text-[11px] text-gray-400">{palabras} {palabras === 1 ? "palabra" : "palabras"}</span>
        </div>
        <AutoTextarea value={texto} onChange={setTexto} placeholder="Ej: Ser reconocidos en [año] como..." />

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 transition-colors"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          {saved && <span className="text-green-600 text-sm font-semibold">✓ Guardado</span>}
        </div>
      </div>
    </div>
  );
}
