"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseLista } from "@/lib/mapaProcesos";
import {
  fodaLibreVacio,
  parseFodaLibre,
  parseFilasRiesgo,
  slugify,
  DOFA_LABEL,
  DOFA_TIPO,
  DOFA_EFECTO,
  type DofaCat,
  type RiesgoFila,
} from "@/lib/riesgos";

const CATS: { key: DofaCat; label: string; placeholder: string }[] = [
  { key: "debilidades", label: "Debilidades", placeholder: "Una por línea. Ej:\nFalta de personal\nProcesos no documentados" },
  { key: "amenazas", label: "Amenazas", placeholder: "Una por línea. Ej:\nCompetencia\nCambios regulatorios" },
];

export default function RiesgosFodaPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const procesoSlug = params.proceso as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [form, setForm] = useState(fodaLibreVacio());
  const [saving, setSaving] = useState(false);

  const procesosMapa = parseLista(docs["mapa_procesos_seleccion"] ?? "");
  const procesoNombre = procesosMapa.find((p) => slugify(p) === procesoSlug) ?? procesoSlug;

  const itemKeyFoda = `riesgos_foda_${procesoSlug}`;
  const itemKeyMatriz = `riesgos_matriz_${procesoSlug}`;

  useEffect(() => {
    if (!loading) {
      setForm(parseFodaLibre(docs[itemKeyFoda] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function handleGuardar() {
    setSaving(true);
    await save(itemKeyFoda, JSON.stringify(form));

    // Generar filas de riesgo a partir del FODA, preservando ediciones previas con la misma línea.
    const existentes = parseFilasRiesgo(docs[itemKeyMatriz] ?? "");
    const existentesPorTexto = new Map(existentes.map((f) => [f.riesgo, f]));

    const nuevasFilas: RiesgoFila[] = [];
    CATS.forEach((cat) => {
      form[cat.key]
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((linea) => {
          const previa = existentesPorTexto.get(linea);
          nuevasFilas.push(
            previa ?? {
              id: crypto.randomUUID(),
              riesgo: linea,
              proceso: procesoNombre,
              tipo: DOFA_TIPO[cat.key],
              dofa: DOFA_LABEL[cat.key],
              descripcion: "",
              efecto: DOFA_EFECTO[cat.key],
              impacto: "",
              probabilidad: "",
              control: "",
              porcentaje: 0,
              estado: "",
            }
          );
        });
    });

    await save(itemKeyMatriz, JSON.stringify(nuevasFilas));
    setSaving(false);
    router.push(`${basePath}/matriz_gestion_riesgos/${procesoSlug}`);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const inputClass =
    "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] resize-y";

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`${basePath}/matriz_gestion_riesgos`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Matriz de la Gestión de Riesgos
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">{procesoNombre}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Describí el FODA de este proceso con tus propias palabras — una idea por línea.
        </p>
      </div>

      <div className="space-y-4">
        {CATS.map((cat) => (
          <div key={cat.key} className="bg-white rounded-xl border border-gray-100 p-4">
            <label className="block text-sm font-bold text-[#1A1A1A] mb-2">{cat.label}</label>
            <textarea
              value={form[cat.key]}
              onChange={(e) => setForm((f) => ({ ...f, [cat.key]: e.target.value }))}
              placeholder={cat.placeholder}
              rows={4}
              className={inputClass}
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
          {saving ? "Guardando..." : "Guardar y ver matriz de riesgos →"}
        </button>
      </div>
    </div>
  );
}
