"use client";

import { useState } from "react";
import Image from "next/image";
import { useDashboardUser } from "./DashboardUserContext";

function defaultTexto(empresa: string) {
  const nombre = empresa || "[Nombre de la empresa]";
  return `La Gerencia reitera el compromiso total e incondicional en dirigir y conducir la actividad empresarial de ${nombre}, cumpliendo y satisfaciendo tanto los requisitos del cliente como los legales y reglamentarios, bajo los parámetros establecidos en nuestras Políticas y Objetivos del Sistema de Gestión de Calidad. Para lograr esto, contamos con el respaldo de nuestro personal y el de los demás miembros del equipo de la dirección para implementar y hacer cumplir las estrategias establecidas y, a la vez, facilitar los recursos para lograrlos.`;
}

const CIERRE =
  "En ese sentido, agradecemos su colaboración y oportunamente estaremos informando de cualquier requisito necesario por parte de ustedes.";

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
      <div className="flex flex-col sm:flex-row m-4 rounded-lg overflow-hidden border border-gray-100">
        {/* Panel izquierdo */}
        <div className="bg-[#F5A623] text-white p-6 sm:w-[38%] flex flex-col justify-between">
          <div className="bg-white rounded-md p-3 w-fit mb-6">
            {profile?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logo_url} alt={profile.company_name || "Logo"} className="w-[70px] h-[78px] object-contain" />
            ) : (
              <Image src="/logo.jpg" alt="Iso Go" width={70} height={78} className="rounded" />
            )}
          </div>
          <div>
            <div className="border-t border-white/40 mb-3" />
            <h2 className="text-3xl font-extrabold leading-tight">COMPROMISO</h2>
            <p className="text-lg font-medium">DE LA DIRECCIÓN</p>
            <div className="border-t border-white/40 mt-3" />
          </div>
          <div className="flex gap-1 mt-6">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
          </div>
        </div>

        {/* Panel derecho */}
        <div className="bg-white p-6 flex-1 relative">
          <h3 className="font-bold text-[#1A1A1A] text-sm mb-3 border-b border-[#F5A623] inline-block pb-1">
            Compromiso con el Sistema de Gestión de Calidad
          </h3>

          {editing ? (
            <textarea
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              rows={8}
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] resize-y mt-2"
            />
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{textoActual}</p>
          )}

          <p className="text-xs text-gray-400 italic mt-4 border-t border-gray-100 pt-3">{CIERRE}</p>

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
            <div className="w-14 h-14 rounded-full bg-[#1A1A1A] flex flex-col items-center justify-center flex-shrink-0 text-center">
              <span className="text-[#F5A623] text-xs font-extrabold leading-none">ISO</span>
              <span className="text-white text-xs font-extrabold leading-none">GO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
