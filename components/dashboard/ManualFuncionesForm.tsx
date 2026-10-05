"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import type { Empleado } from "@/lib/personal";
import {
  manualVacio,
  parseManual,
  itemVacio,
  NIVELES_CARGO,
  type ManualFunciones,
  type ItemLista,
} from "@/lib/manualFunciones";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function Seccion({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
        <span className="w-6 h-6 rounded-md bg-[#F5A623] text-[#1A1A1A] text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">
          {numero}
        </span>
        <h3 className="text-white text-xs font-bold uppercase tracking-wide">{titulo}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ListaEditable({
  items,
  onChange,
  placeholder,
}: {
  items: ItemLista[];
  onChange: (items: ItemLista[]) => void;
  placeholder: string;
}) {
  function setTexto(id: string, texto: string) {
    onChange(items.map((i) => (i.id === id ? { ...i, texto } : i)));
  }
  function eliminar(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-start gap-2.5">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623]/10 text-[#F5A623] text-[11px] font-bold flex items-center justify-center mt-0.5">
            {idx + 1}
          </span>
          <input
            value={item.texto}
            onChange={(e) => setTexto(item.id, e.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => eliminar(item.id)}
            className="flex-shrink-0 text-gray-300 hover:text-red-500 mt-1.5 text-xs"
            title="Quitar"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, itemVacio()])}
        className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410] ml-8"
      >
        + Agregar
      </button>
    </div>
  );
}

export default function ManualFuncionesForm({ userId, empleado }: { userId: string | null; empleado: Empleado }) {
  const { profile } = useDashboardUser();
  const itemKey = `manual_funciones_${empleado.id}`;
  const { docs, loading, save } = useGestionDocumentos("talento_humano", userId);

  const [form, setForm] = useState<ManualFunciones>(manualVacio());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) {
      const cargado = parseManual(docs[itemKey] ?? "");
      if (!docs[itemKey] && empleado.jefeDirecto) {
        cargado.cargoSuperior = empleado.jefeDirecto;
      }
      setForm(cargado);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function handleGuardar() {
    setSaving(true);
    await save(itemKey, JSON.stringify(form));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-6 text-center">Cargando...</p>;
  }

  return (
    <div className="space-y-5">
      {/* Portada del manual */}
      <div className="relative rounded-2xl overflow-hidden bg-[#1A1A1A]">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />
        {profile?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logo_url}
            alt=""
            className="absolute right-4 bottom-0 w-32 h-32 object-contain opacity-[0.08] pointer-events-none"
          />
        )}
        <div className="relative p-6">
          <span className="inline-block bg-[#F5A623] text-[#1A1A1A] text-[10px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
            Manual de Funciones
          </span>
          <h1 className="text-white text-2xl font-extrabold leading-tight">{empleado.cargo || "Cargo sin definir"}</h1>
          <p className="text-gray-400 text-sm mt-1">{empleado.nombre} {empleado.apellido}</p>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Código</p>
              <input
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                placeholder="MF-001"
                className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none placeholder-gray-600"
              />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Versión</p>
              <input
                value={form.version}
                onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none"
              />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Fecha</p>
              <input
                type="date"
                value={form.fechaElaboracion}
                onChange={(e) => setForm((f) => ({ ...f, fechaElaboracion: e.target.value }))}
                className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1. Identificación del cargo */}
      <Seccion numero="1" titulo="Identificación del Cargo">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Nivel del cargo</label>
            <select
              value={form.nivelCargo}
              onChange={(e) => setForm((f) => ({ ...f, nivelCargo: e.target.value }))}
              className={inputClass}
            >
              <option value="">Seleccioná</option>
              {NIVELES_CARGO.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Reporta a (cargo superior)</label>
            <input
              value={form.cargoSuperior}
              onChange={(e) => setForm((f) => ({ ...f, cargoSuperior: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Cargos que supervisa</label>
            <input
              value={form.cargosQueSupervisa}
              onChange={(e) => setForm((f) => ({ ...f, cargosQueSupervisa: e.target.value }))}
              placeholder="Ninguno, si aplica"
              className={inputClass}
            />
          </div>
        </div>
      </Seccion>

      {/* 2. Objetivo del cargo */}
      <Seccion numero="2" titulo="Objetivo del Cargo">
        <textarea
          value={form.objetivoCargo}
          onChange={(e) => setForm((f) => ({ ...f, objetivoCargo: e.target.value }))}
          placeholder="Razón de ser del puesto: qué resultado debe garantizar esta posición dentro de la organización."
          rows={3}
          className={`${inputClass} resize-y`}
        />
      </Seccion>

      {/* 3. Funciones principales */}
      <Seccion numero="3" titulo="Funciones Principales">
        <ListaEditable
          items={form.funcionesPrincipales}
          onChange={(items) => setForm((f) => ({ ...f, funcionesPrincipales: items }))}
          placeholder="Ej: Elaborar y dar seguimiento a las cotizaciones comerciales"
        />
      </Seccion>

      {/* 4. Funciones secundarias */}
      <Seccion numero="4" titulo="Funciones Secundarias / Eventuales">
        <ListaEditable
          items={form.funcionesSecundarias}
          onChange={(items) => setForm((f) => ({ ...f, funcionesSecundarias: items }))}
          placeholder="Ej: Reemplazar a un compañero del área en su ausencia"
        />
      </Seccion>

      {/* 5. Relaciones del cargo */}
      <Seccion numero="5" titulo="Relaciones del Cargo">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Relaciones internas</label>
            <textarea
              value={form.relacionesInternas}
              onChange={(e) => setForm((f) => ({ ...f, relacionesInternas: e.target.value }))}
              placeholder="Áreas o cargos con los que interactúa dentro de la empresa."
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div>
            <label className={labelClass}>Relaciones externas</label>
            <textarea
              value={form.relacionesExternas}
              onChange={(e) => setForm((f) => ({ ...f, relacionesExternas: e.target.value }))}
              placeholder="Clientes, proveedores, entes externos."
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
      </Seccion>

      {/* 6. Perfil requerido */}
      <Seccion numero="6" titulo="Perfil Requerido">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Formación requerida</label>
            <textarea
              value={form.formacionRequerida}
              onChange={(e) => setForm((f) => ({ ...f, formacionRequerida: e.target.value }))}
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div>
            <label className={labelClass}>Experiencia requerida</label>
            <textarea
              value={form.experienciaRequerida}
              onChange={(e) => setForm((f) => ({ ...f, experienciaRequerida: e.target.value }))}
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div>
            <label className={labelClass}>Competencias técnicas</label>
            <textarea
              value={form.competenciasTecnicas}
              onChange={(e) => setForm((f) => ({ ...f, competenciasTecnicas: e.target.value }))}
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div>
            <label className={labelClass}>Competencias blandas</label>
            <textarea
              value={form.competenciasBlandas}
              onChange={(e) => setForm((f) => ({ ...f, competenciasBlandas: e.target.value }))}
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
      </Seccion>

      {/* 7. Indicadores y autoridad */}
      <Seccion numero="7" titulo="Indicadores de Desempeño y Autoridad">
        <div className="mb-4">
          <label className={labelClass}>Indicadores de desempeño del cargo</label>
          <ListaEditable
            items={form.indicadoresDesempeno}
            onChange={(items) => setForm((f) => ({ ...f, indicadoresDesempeno: items }))}
            placeholder="Ej: % de cumplimiento de plazos de entrega"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Autoridad / toma de decisiones</label>
            <textarea
              value={form.autoridadDecision}
              onChange={(e) => setForm((f) => ({ ...f, autoridadDecision: e.target.value }))}
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div>
            <label className={labelClass}>Recursos a cargo</label>
            <textarea
              value={form.recursosACargo}
              onChange={(e) => setForm((f) => ({ ...f, recursosACargo: e.target.value }))}
              placeholder="Equipos, presupuesto, personal a cargo."
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
      </Seccion>

      {/* 8. Control de elaboración */}
      <Seccion numero="8" titulo="Control de Elaboración">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Elaborado por</label>
            <input value={form.elaboradoPor} onChange={(e) => setForm((f) => ({ ...f, elaboradoPor: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Revisado por</label>
            <input value={form.revisadoPor} onChange={(e) => setForm((f) => ({ ...f, revisadoPor: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Aprobado por</label>
            <input value={form.aprobadoPor} onChange={(e) => setForm((f) => ({ ...f, aprobadoPor: e.target.value }))} className={inputClass} />
          </div>
        </div>
      </Seccion>

      <div className="flex items-center gap-3 sticky bottom-4">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 shadow-lg"
        >
          {saving ? "Guardando..." : "Guardar Manual de Funciones"}
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
      </div>
    </div>
  );
}
