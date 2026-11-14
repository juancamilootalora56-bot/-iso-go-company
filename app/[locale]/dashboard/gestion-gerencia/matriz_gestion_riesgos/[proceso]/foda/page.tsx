"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseLista } from "@/lib/mapaProcesos";
import { FODA_CATEGORIAS } from "@/lib/fodaItems";
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
import { Plus, X } from "lucide-react";

// Mismas 4 categorías, mismos colores e íconos que ya usa el FODA general
// (gestion-gerencia/foda) — acá "fortalezas"/"debilidades"/etc. son
// exactamente las mismas claves, solo que enfocadas en un proceso puntual.
const DOFA_LABEL_LARGO: Record<DofaCat, string> = {
  fortalezas: "Fortalezas",
  debilidades: "Debilidades",
  oportunidades: "Oportunidades",
  amenazas: "Amenazas",
};

// La matriz de riesgos (Excel) solo toma Debilidades y Amenazas.
const CATS_RIESGO: DofaCat[] = ["debilidades", "amenazas"];

function lineasDe(texto: string): string[] {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function ChipsCategoria({
  cat,
  items,
  onAdd,
  onRemove,
}: {
  cat: (typeof FODA_CATEGORIAS)[number];
  items: string[];
  onAdd: (texto: string) => void;
  onRemove: (texto: string) => void;
}) {
  const [nuevo, setNuevo] = useState("");

  function agregar() {
    const texto = nuevo.trim();
    if (!texto) return;
    onAdd(texto);
    setNuevo("");
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: cat.color }}>
        <span className="text-base flex-shrink-0">{cat.icono}</span>
        <h2 className="text-white font-bold text-xs uppercase tracking-wide flex-1">{DOFA_LABEL_LARGO[cat.key]}</h2>
        <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
          {items.length}
        </span>
      </div>

      <div className="p-4">
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {items.map((item) => (
              <span
                key={item}
                className="text-xs font-semibold pl-3 pr-1.5 py-1.5 rounded-full flex items-center gap-1.5 border"
                style={{ background: `${cat.color}14`, borderColor: `${cat.color}33`, color: "#1A1A1A" }}
              >
                {item}
                <button
                  onClick={() => onRemove(item)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-red-400 transition-colors flex-shrink-0"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregar();
              }
            }}
            placeholder={`Agregar ${DOFA_LABEL_LARGO[cat.key].toLowerCase()}...`}
            className="flex-1 bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors focus:ring-[color:var(--cat-color)]/15 focus:border-[color:var(--cat-color)]"
            style={{ "--cat-color": cat.color } as React.CSSProperties}
          />
          <button
            type="button"
            onClick={agregar}
            disabled={!nuevo.trim()}
            className="flex items-center gap-1.5 text-sm font-bold text-white disabled:opacity-40 px-4 rounded-lg transition-colors flex-shrink-0"
            style={{ background: cat.color }}
          >
            <Plus size={15} strokeWidth={3} />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RiesgosFodaPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const procesoSlug = params.proceso as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [items, setItems] = useState<Record<DofaCat, string[]>>({
    fortalezas: [],
    debilidades: [],
    oportunidades: [],
    amenazas: [],
  });
  const [saving, setSaving] = useState(false);

  const procesosMapa = parseLista(docs["mapa_procesos_seleccion"] ?? "");
  const procesoNombre = procesosMapa.find((p) => slugify(p) === procesoSlug) ?? procesoSlug;

  const itemKeyFoda = `riesgos_foda_${procesoSlug}`;
  const itemKeyMatriz = `riesgos_matriz_${procesoSlug}`;

  useEffect(() => {
    if (!loading) {
      const cargado = parseFodaLibre(docs[itemKeyFoda] ?? "");
      setItems({
        fortalezas: lineasDe(cargado.fortalezas),
        debilidades: lineasDe(cargado.debilidades),
        oportunidades: lineasDe(cargado.oportunidades),
        amenazas: lineasDe(cargado.amenazas),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function agregarItem(cat: DofaCat, texto: string) {
    setItems((prev) => (prev[cat].includes(texto) ? prev : { ...prev, [cat]: [...prev[cat], texto] }));
  }

  function quitarItem(cat: DofaCat, texto: string) {
    setItems((prev) => ({ ...prev, [cat]: prev[cat].filter((i) => i !== texto) }));
  }

  const totalItems = Object.values(items).reduce((s, arr) => s + arr.length, 0);

  async function handleGuardar() {
    setSaving(true);
    const form = fodaLibreVacio();
    (Object.keys(items) as DofaCat[]).forEach((cat) => {
      form[cat] = items[cat].join("\n");
    });
    await save(itemKeyFoda, JSON.stringify(form));

    // Generar filas de riesgo a partir del FODA, preservando ediciones previas con la misma línea.
    const existentes = parseFilasRiesgo(docs[itemKeyMatriz] ?? "");
    const existentesPorTexto = new Map(existentes.map((f) => [f.riesgo, f]));

    const nuevasFilas: RiesgoFila[] = [];
    CATS_RIESGO.forEach((cat) => {
      items[cat].forEach((linea) => {
        const previa = existentesPorTexto.get(linea);
        nuevasFilas.push(
          previa ?? {
            id: crypto.randomUUID(),
            riesgo: linea,
            proceso: procesoNombre,
            tipo: DOFA_TIPO[cat],
            dofa: DOFA_LABEL[cat],
            descripcion: "",
            efecto: DOFA_EFECTO[cat],
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
    router.push(`${basePath}/matriz_gestion_riesgos/resultado`);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <Link href={`${basePath}/matriz_gestion_riesgos`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Matriz de la Gestión de Riesgos
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
              Gestión de Riesgos
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">{procesoNombre}</h1>
            <p className="text-gray-400 text-sm mt-1 max-w-md">
              Agregá ítems de a uno — Debilidades y Amenazas se convierten automáticamente en filas de la matriz de riesgos.
            </p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-white text-2xl font-extrabold">{totalItems}</p>
            <p className="text-gray-400 text-[10px] uppercase tracking-wide">Ítems</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {FODA_CATEGORIAS.map((cat) => (
          <ChipsCategoria
            key={cat.key}
            cat={cat}
            items={items[cat.key]}
            onAdd={(texto) => agregarItem(cat.key, texto)}
            onRemove={(texto) => quitarItem(cat.key, texto)}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 transition-colors"
        >
          {saving ? "Guardando..." : "Guardar y ver matriz de riesgos →"}
        </button>
      </div>
    </div>
  );
}
