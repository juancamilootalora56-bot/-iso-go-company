"use client";

import { useEffect, useRef, useState } from "react";
import { useDashboardUser } from "./DashboardUserContext";
import { temaPanelDe } from "@/lib/temaPanel";
import { cumplimientoFase, fotoBitacoraVacia, type FaseCronograma, type FotoBitacora } from "@/lib/planesCalidad";
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
  Layers,
} from "lucide-react";

// Bitácora Fotográfica de Obra: documenta el avance real con fotos subidas
// desde el sitio. Cada fase del Cronograma del Proyecto tiene su propia
// bitácora independiente — se elige la fase y se navega solo entre sus
// propias actividades, sin mezclarlas con las de otras fases.

const MAX_FOTO_BYTES = 1_200_000; // ~1.2MB

function colorPorPorcentaje(pct: number): string {
  if (pct >= 100) return "#14B8A6";
  if (pct <= 0) return "#9CA3AF";
  const t = Math.max(0, Math.min(100, pct)) / 100;
  const a = [245, 158, 11];
  const b = [20, 184, 166];
  const rgb = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${rgb.join(",")})`;
}

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
  const [faseId, setFaseId] = useState<string | null>(fases[0]?.id ?? null);
  const [indice, setIndice] = useState(0);
  const [fotoActivaIdx, setFotoActivaIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const totalFotos = fases.reduce((acc, f) => acc + f.actividades.reduce((a2, act) => a2 + act.fotos.length, 0), 0);
  const totalActividades = fases.reduce((acc, f) => acc + f.actividades.length, 0);
  const totalDocumentadas = fases.reduce(
    (acc, f) => acc + f.actividades.filter((a) => a.fotos.length > 0).length,
    0
  );

  useEffect(() => {
    if (!faseId && fases.length > 0) setFaseId(fases[0].id);
  }, [fases, faseId]);

  if (fases.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
        Cargá fases y actividades en &quot;Cronograma del Proyecto&quot; para empezar la bitácora fotográfica.
      </div>
    );
  }

  const fase = fases.find((f) => f.id === faseId) ?? fases[0];
  const actividades = fase.actividades;
  const actividad = actividades[Math.min(indice, Math.max(0, actividades.length - 1))] ?? null;
  const pct = actividad?.porcentajeCompletado ?? 0;
  const fotoActiva = actividad?.fotos[Math.min(fotoActivaIdx, actividad.fotos.length - 1)] ?? null;
  const documentadasFase = actividades.filter((a) => a.fotos.length > 0).length;

  function elegirFase(id: string) {
    setFaseId(id);
    setIndice(0);
    setFotoActivaIdx(0);
    setError(null);
  }

  function irA(nuevoIndice: number) {
    setIndice(Math.max(0, Math.min(actividades.length - 1, nuevoIndice)));
    setFotoActivaIdx(0);
    setError(null);
  }

  function handleSubirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !actividad) return;
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
    if (!fotoActiva || !actividad) return;
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
              Cada fase tiene su propia bitácora — elegí una y recorré solo sus actividades.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="rounded-xl px-4 py-2.5 text-center" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <p className="text-lg font-bold" style={{ color: tema.textPrimary }}>{fases.length}</p>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: tema.textMuted }}>Fases</p>
            </div>
            <div className="rounded-xl px-4 py-2.5 text-center" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <p className="text-lg font-bold" style={{ color: tema.textPrimary }}>{totalFotos}</p>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: tema.textMuted }}>Fotos</p>
            </div>
            <div className="rounded-xl px-4 py-2.5 text-center" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <p className="text-lg font-bold" style={{ color: tema.textPrimary }}>
                {totalDocumentadas}/{totalActividades}
              </p>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: tema.textMuted }}>Documentadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de fases — cada una es su propia bitácora */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 px-2 mb-2 flex items-center gap-1.5">
          <Layers size={12} /> Fases del proyecto
        </p>
        <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
          {fases.map((f) => {
            const pctFase = cumplimientoFase(f) ?? 0;
            const doc = f.actividades.filter((a) => a.fotos.length > 0).length;
            const activo = f.id === fase.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => elegirFase(f.id)}
                className="flex-shrink-0 w-44 text-left rounded-xl border-2 p-3 transition-colors"
                style={{
                  borderColor: activo ? "#F5A623" : "transparent",
                  backgroundColor: activo ? "#FFF8EC" : "#FAFAFA",
                }}
              >
                <p className="text-xs font-bold text-[#1A1A1A] leading-snug line-clamp-2 min-h-[32px]">{f.nombre}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-400">
                    {doc}/{f.actividades.length} docum.
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: colorPorPorcentaje(pctFase) }}>
                    {pctFase}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden mt-1.5">
                  <div className="h-full rounded-full" style={{ width: `${pctFase}%`, backgroundColor: colorPorPorcentaje(pctFase) }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!actividad ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          Esta fase todavía no tiene actividades cargadas.
        </div>
      ) : (
        <>
          {/* Visor principal — acotado a la fase elegida */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#14B8A6]">{fase.nombre}</span>
              <span className="text-[11px] font-semibold text-gray-400">
                Actividad {indice + 1} de {actividades.length} de esta fase
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

                <p className="text-[11px] text-gray-400 mt-3">
                  {documentadasFase}/{actividades.length} actividades documentadas en esta fase
                </p>

                {error && <p className="text-[11px] text-red-500 mt-2">{error}</p>}

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
                    disabled={indice === actividades.length - 1}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#1A1A1A] hover:bg-[#2A2A2A] px-3 py-2 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    Siguiente <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filmstrip — solo de esta fase */}
          <div className="bg-white rounded-2xl border border-gray-100 p-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {actividades.map((a, i) => {
                const activo = i === indice;
                const foto = a.fotos[0];
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => irA(i)}
                    className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                    style={{ borderColor: activo ? "#F5A623" : "transparent" }}
                    title={a.actividad}
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
                      style={{ backgroundColor: colorPorPorcentaje(a.porcentajeCompletado) }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
