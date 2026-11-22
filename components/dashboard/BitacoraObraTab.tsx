"use client";

import { useMemo, useRef, useState } from "react";
import { useDashboardUser } from "./DashboardUserContext";
import { temaPanelDe } from "@/lib/temaPanel";
import {
  cumplimientoFase,
  fotoBitacoraVacia,
  type ActividadFase,
  type FaseCronograma,
  type FotoBitacora,
} from "@/lib/planesCalidad";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Calendar,
  ImagePlus,
  Images,
} from "lucide-react";

// Bitácora Fotográfica de Obra: en vez de simular un modelo 3D, documenta
// el avance real con fotos subidas desde el sitio, una por actividad del
// Cronograma del Proyecto, navegables paso a paso en orden cronológico.

const MAX_FOTO_BYTES = 1_200_000; // ~1.2MB
const COLOR_AMBAR = "#F59E0B";
const COLOR_TEAL = "#14B8A6";
const COLOR_ROJO = "#EF4444";

function colorPorPorcentaje(pct: number): string {
  if (pct >= 100) return COLOR_TEAL;
  if (pct <= 0) return "#9CA3AF";
  // interpolación simple ámbar -> teal
  const t = Math.max(0, Math.min(100, pct)) / 100;
  const a = [245, 158, 11];
  const b = [20, 184, 166];
  const rgb = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${rgb.join(",")})`;
}

type ActividadConContexto = {
  fase: FaseCronograma;
  actividad: ActividadFase;
};

export default function BitacoraObraTab({
  fases,
  soloLectura,
  onCambiarFotos,
}: {
  fases: FaseCronograma[];
  soloLectura: boolean;
  onCambiarFotos: (faseId: string, actividadId: string, fotos: FotoBitacora[]) => void;
}) {
  const { profile } = useDashboardUser();
  const tema = temaPanelDe(profile?.tema_panel);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [indice, setIndice] = useState(0);
  const [fotoActivaIdx, setFotoActivaIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const lista: ActividadConContexto[] = useMemo(() => {
    const todas: ActividadConContexto[] = [];
    fases.forEach((fase) => fase.actividades.forEach((actividad) => todas.push({ fase, actividad })));
    return todas.sort((a, b) => (a.actividad.fechaInicio || "").localeCompare(b.actividad.fechaInicio || ""));
  }, [fases]);

  const totalFotos = lista.reduce((acc, { actividad }) => acc + actividad.fotos.length, 0);
  const documentadas = lista.filter(({ actividad }) => actividad.fotos.length > 0).length;

  if (lista.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
        Cargá fases y actividades en &quot;Cronograma del Proyecto&quot; para empezar la bitácora fotográfica.
      </div>
    );
  }

  const actual = lista[Math.min(indice, lista.length - 1)];
  const { fase, actividad } = actual;
  const pct = actividad.porcentajeCompletado;
  const fotoActiva = actividad.fotos[Math.min(fotoActivaIdx, actividad.fotos.length - 1)] ?? null;

  function irA(nuevoIndice: number) {
    setIndice(Math.max(0, Math.min(lista.length - 1, nuevoIndice)));
    setFotoActivaIdx(0);
    setError(null);
  }

  function handleSubirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FOTO_BYTES) {
      setError("La foto es muy pesada. Usá una de menos de 1.2MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const nueva: FotoBitacora = { ...fotoBitacoraVacia(), dataUrl: reader.result as string };
      const fotos = [...actividad.fotos, nueva];
      onCambiarFotos(fase.id, actividad.id, fotos);
      setFotoActivaIdx(fotos.length - 1);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function quitarFotoActiva() {
    if (!fotoActiva) return;
    const fotos = actividad.fotos.filter((f) => f.id !== fotoActiva.id);
    onCambiarFotos(fase.id, actividad.id, fotos);
    setFotoActivaIdx(0);
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div
        className="relative rounded-2xl p-6 sm:p-7 overflow-hidden"
        style={{ background: `linear-gradient(to bottom right, ${tema.bgFrom}, ${tema.bgTo})` }}
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, ${tema.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${tema.gridColor} 1px, transparent 1px)`,
            backgroundSize: "26px 26px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#14B8A6]/25 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#14B8A6" }}>
              Evidencia real de obra
            </p>
            <h2 className="text-lg sm:text-xl font-bold mt-0.5" style={{ color: tema.textPrimary }}>
              Bitácora Fotográfica de Obra
            </h2>
            <p className="text-sm mt-1" style={{ color: tema.textMuted }}>
              Fotos reales cargadas desde el sitio, recorriendo el Cronograma del Proyecto paso a paso.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="rounded-xl px-4 py-2.5 text-center" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <p className="text-lg font-bold" style={{ color: tema.textPrimary }}>{totalFotos}</p>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: tema.textMuted }}>Fotos</p>
            </div>
            <div className="rounded-xl px-4 py-2.5 text-center" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <p className="text-lg font-bold" style={{ color: tema.textPrimary }}>
                {documentadas}/{lista.length}
              </p>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: tema.textMuted }}>Documentadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visor principal */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#14B8A6]">{fase.nombre}</span>
          <span className="text-[11px] font-semibold text-gray-400">
            Actividad {indice + 1} de {lista.length}
          </span>
        </div>

        <div className="grid sm:grid-cols-[1.3fr_1fr]">
          {/* Foto */}
          <div className="relative bg-[#0D0D0D] aspect-[4/3] sm:aspect-auto sm:h-[420px] flex items-center justify-center">
            {fotoActiva?.dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoActiva.dataUrl} alt={actividad.actividad} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Camera size={36} strokeWidth={1.5} />
                <p className="text-xs">Sin foto cargada todavía</p>
              </div>
            )}

            {!soloLectura && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                {fotoActiva && (
                  <button
                    type="button"
                    onClick={quitarFotoActiva}
                    className="w-9 h-9 rounded-full bg-black/60 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors"
                    title="Quitar esta foto"
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 bg-[#F5A623] hover:bg-[#e09410] text-[#1A1A1A] text-xs font-bold px-3.5 py-2 rounded-full transition-colors"
                >
                  <ImagePlus size={14} /> Subir foto
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleSubirFoto}
                  className="hidden"
                />
              </div>
            )}

            {actividad.fotos.length > 1 && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 rounded-full px-2 py-1">
                <Images size={12} className="text-white" />
                <span className="text-[11px] font-bold text-white">
                  {fotoActivaIdx + 1}/{actividad.fotos.length}
                </span>
              </div>
            )}

            {actividad.fotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setFotoActivaIdx((i) => (i - 1 + actividad.fotos.length) % actividad.fotos.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setFotoActivaIdx((i) => (i + 1) % actividad.fotos.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {/* Detalle */}
          <div className="p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              {actividad.fotos.length > 0 ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} /> Documentada
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  <AlertCircle size={12} /> Sin evidencia
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[#1A1A1A]">{actividad.actividad || "(sin nombre)"}</h3>

            <div className="mt-3 space-y-2 text-xs text-gray-500">
              <p className="flex items-center gap-1.5">
                <User size={13} /> {actividad.responsable || "Sin responsable asignado"}
              </p>
              {actividad.fechaInicio && (
                <p className="flex items-center gap-1.5">
                  <Calendar size={13} /> {actividad.fechaInicio} → {actividad.fechaEntrega || "?"}
                  {actividad.duracion && <span className="text-gray-300">· {actividad.duracion}</span>}
                </p>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1">
                <span>Avance</span>
                <span style={{ color: colorPorPorcentaje(pct) }}>{pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colorPorPorcentaje(pct) }} />
              </div>
            </div>

            {error && <p className="text-[11px] text-red-500 mt-3">{error}</p>}

            <div className="flex-1" />

            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-50">
              <button
                type="button"
                onClick={() => irA(indice - 1)}
                disabled={indice === 0}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-[#1A1A1A] bg-white border border-gray-200 hover:border-[#14B8A6]/50 px-3 py-2 rounded-lg disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              <button
                type="button"
                onClick={() => irA(indice + 1)}
                disabled={indice === lista.length - 1}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#1A1A1A] hover:bg-[#2A2A2A] px-3 py-2 rounded-lg disabled:opacity-30 transition-colors"
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filmstrip cronológico */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {lista.map((item, i) => {
            const activo = i === indice;
            const foto = item.actividad.fotos[0];
            return (
              <button
                key={item.actividad.id}
                type="button"
                onClick={() => irA(i)}
                className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                style={{ borderColor: activo ? "#F5A623" : "transparent" }}
                title={item.actividad.actividad}
              >
                {foto?.dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={foto.dataUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#FAFAFA] flex items-center justify-center">
                    <Camera size={16} className="text-gray-300" />
                  </div>
                )}
                <span
                  className="absolute bottom-0 inset-x-0 h-1"
                  style={{ backgroundColor: colorPorPorcentaje(item.actividad.porcentajeCompletado) }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
