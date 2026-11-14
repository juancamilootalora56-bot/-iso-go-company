"use client";

import { useState } from "react";
import Image from "next/image";
import { useDashboardUser } from "./DashboardUserContext";
import { useColorDesdeLogo, ajustarColor } from "@/lib/colorMarca";

const COLOR_RESPALDO = "#F5A623";

function defaultTexto(empresa: string) {
  const nombre = empresa || "[Nombre de la empresa]";
  return `La Gerencia reitera el compromiso total e incondicional en dirigir y conducir la actividad empresarial de ${nombre}, cumpliendo y satisfaciendo tanto los requisitos del cliente como los legales y reglamentarios, bajo los parámetros establecidos en nuestras Políticas y Objetivos del Sistema de Gestión de Calidad. Para lograr esto, contamos con el respaldo de nuestro personal y el de los demás miembros del equipo de la dirección para implementar y hacer cumplir las estrategias establecidas y, a la vez, facilitar los recursos para lograrlos.`;
}

export default function CompromisoDireccionCard({
  empresa,
  contenido,
  onSave,
}: {
  empresa: string;
  contenido: string;
  onSave: (valor: string) => Promise<void>;
}) {
  const { profile } = useDashboardUser();
  const textoActual = contenido.trim() ? contenido : defaultTexto(empresa);
  const [editing, setEditing] = useState(false);
  const [valor, setValor] = useState(textoActual);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const completo = contenido.trim().length > 0;

  // Color de marca extraído del propio logo del cliente — cada empresa ve
  // su certificado en sus propios colores, sin tener que configurar nada.
  // Si el logo es mayormente blanco/negro/gris (o no hay logo), usamos el
  // dorado de ISO Go como respaldo.
  const colorExtraido = useColorDesdeLogo(profile?.logo_url);
  const colorBase = colorExtraido ?? COLOR_RESPALDO;
  const colorClaro = ajustarColor(colorBase, 0.1);
  const colorOscuro = ajustarColor(colorBase, -0.32);

  async function handleSave() {
    setSaving(true);
    await onSave(valor);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4">
        <span
          className={`text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded-full ${
            completo ? "text-green-700 bg-green-100" : "text-[#F5A623] bg-[#F5A623]/10"
          }`}
        >
          {completo ? "Completo" : "Pendiente"}
        </span>
        <div className="flex items-center gap-3">
          {saved && <span className="text-green-600 text-xs">✓ Guardado</span>}
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setValor(textoActual);
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setValor(textoActual);
                setEditing(true);
              }}
              className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]"
            >
              ✎ Editar
            </button>
          )}
        </div>
      </div>

      {/* Certificado */}
      <div className="flex flex-col sm:flex-row m-4 rounded-xl overflow-hidden shadow-lg" style={{ boxShadow: `0 10px 30px -12px ${colorBase}55` }}>
        {/* Panel izquierdo — color de marca del cliente */}
        <div
          className="relative text-white p-6 sm:w-[38%] flex flex-col justify-between overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${colorClaro}, ${colorOscuro})` }}
        >
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          <div className="relative mb-6">
            {profile?.logo_url ? (
              <div className="bg-white/95 rounded-lg p-2.5 inline-flex max-w-[180px] shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.logo_url} alt={profile.company_name || "Logo"} className="max-h-16 max-w-full object-contain" />
              </div>
            ) : (
              <Image src="/logo.jpg" alt="Iso Go" width={110} height={122} className="object-contain" />
            )}
          </div>
          <div className="relative">
            <div className="border-t border-white/40 mb-3" />
            <h2 className="text-3xl font-extrabold leading-tight">COMPROMISO</h2>
            <p className="text-lg font-medium">DE LA DIRECCIÓN</p>
            <div className="border-t border-white/40 mt-3" />
          </div>
          <div className="relative flex gap-1 mt-6">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
          </div>
        </div>

        {/* Panel derecho */}
        <div className="bg-white p-6 flex-1 relative">
          <h3
            className="font-bold text-[#1A1A1A] text-sm mb-3 border-b-2 inline-block pb-1"
            style={{ borderColor: colorBase }}
          >
            Compromiso con el Sistema de Gestión de Calidad
          </h3>

          {editing ? (
            <textarea
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              rows={8}
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] text-left focus:outline-none focus:border-[#F5A623] resize-y mt-2"
            />
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed text-left whitespace-pre-wrap">{textoActual}</p>
          )}

          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-[#1A1A1A] mb-4">JUNTA DIRECTIVA</p>
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="border-t border-gray-300 w-20 mb-1" />
                  <p className="text-[10px] text-gray-400">PERSONA</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-300 w-20 mb-1" />
                  <p className="text-[10px] text-gray-400">FIRMA</p>
                </div>
              </div>
            </div>

            {/* Sello de certificación — discreto, no compite con el logo del cliente */}
            <div
              className="w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: `${colorBase}55` }}
              title="Documento gestionado en Iso Go"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden opacity-80">
                <Image src="/logo.jpg" alt="Iso Go" width={44} height={49} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
