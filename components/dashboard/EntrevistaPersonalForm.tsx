"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import type { Empleado } from "@/lib/personal";
import {
  GRUPOS_PREGUNTAS,
  entrevistaVacia,
  parseEntrevista,
  experienciaVacia,
  formacionVacia,
  type EntrevistaPersonal,
} from "@/lib/entrevistaPersonal";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors";

export default function EntrevistaPersonalForm({ userId, empleado }: { userId: string | null; empleado: Empleado }) {
  const itemKey = `entrevista_${empleado.id}`;
  const { docs, loading, save } = useGestionDocumentos("talento_humano", userId);

  const [form, setForm] = useState<EntrevistaPersonal>(entrevistaVacia());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) setForm(parseEntrevista(docs[itemKey] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function setRespuesta(key: string, valor: string) {
    setForm((f) => ({ ...f, respuestas: { ...f.respuestas, [key]: valor } }));
  }

  function setExperiencia(id: string, campo: "empresa" | "tiempo" | "cargo" | "motivoRetiro", valor: string) {
    setForm((f) => ({
      ...f,
      experiencias: f.experiencias.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)),
    }));
  }

  function setFormacion(id: string, campo: "institucion" | "anioFinalizacion" | "titulo" | "logros", valor: string) {
    setForm((f) => ({
      ...f,
      formaciones: f.formaciones.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)),
    }));
  }

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
    <div className="space-y-6">
      {/* Encabezado estilo documento */}
      <div className="rounded-xl overflow-hidden border border-[#E8C77A]">
        <div className="bg-[#F5A623] text-center py-2.5">
          <p className="text-[#1A1A1A] font-extrabold text-sm tracking-wide">MÓDULO DE GESTIÓN HUMANA</p>
        </div>
        <div className="bg-[#F8C04F] text-center py-2">
          <p className="text-[#1A1A1A] font-bold text-xs tracking-wide">ENTREVISTA</p>
        </div>
        <div className="bg-[#FAD37A] text-center py-2">
          <p className="text-[#1A1A1A] text-xs font-medium">
            Cuestionario de preguntas — Entrevista y actualización de datos
          </p>
        </div>
      </div>

      {/* Datos personales (encabezado) */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623]/15 -m-5 mb-4 px-5 py-2 rounded-t-xl">
          Datos personales
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de la entrevista</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">¿Conocías anteriormente la organización?</label>
            <input
              value={form.conociaOrganizacion}
              onChange={(e) => setForm((f) => ({ ...f, conociaOrganizacion: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          Nombre, documento, fecha de nacimiento, domicilio, ciudad, teléfono y cargo se toman de la ficha del
          colaborador en Alta de Personal.
        </p>
      </div>

      {/* Información laboral */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-x-auto">
        <h3 className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623]/15 -mx-5 -mt-5 mb-4 px-5 py-2 rounded-t-xl">
          Información laboral
        </h3>
        <table className="w-full text-xs min-w-[560px] border-collapse">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="p-2 font-semibold border-b border-gray-100">Empresa donde laboró</th>
              <th className="p-2 font-semibold border-b border-gray-100 w-28">Tiempo</th>
              <th className="p-2 font-semibold border-b border-gray-100">Cargo</th>
              <th className="p-2 font-semibold border-b border-gray-100">Motivo de retiro</th>
            </tr>
          </thead>
          <tbody>
            {form.experiencias.map((e) => (
              <tr key={e.id} className="border-b border-gray-50">
                <td className="p-1.5">
                  <input value={e.empresa} onChange={(ev) => setExperiencia(e.id, "empresa", ev.target.value)} className={inputClass} />
                </td>
                <td className="p-1.5">
                  <input value={e.tiempo} onChange={(ev) => setExperiencia(e.id, "tiempo", ev.target.value)} className={inputClass} />
                </td>
                <td className="p-1.5">
                  <input value={e.cargo} onChange={(ev) => setExperiencia(e.id, "cargo", ev.target.value)} className={inputClass} />
                </td>
                <td className="p-1.5">
                  <input value={e.motivoRetiro} onChange={(ev) => setExperiencia(e.id, "motivoRetiro", ev.target.value)} className={inputClass} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, experiencias: [...f.experiencias, experienciaVacia()] }))}
          className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410] mt-3"
        >
          + Agregar experiencia
        </button>
      </div>

      {/* Formación académica */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-x-auto">
        <h3 className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623]/15 -mx-5 -mt-5 mb-4 px-5 py-2 rounded-t-xl">
          Formación académica <span className="font-normal text-gray-500">(universitario, bachiller, cursos e idiomas)</span>
        </h3>
        <table className="w-full text-xs min-w-[560px] border-collapse">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="p-2 font-semibold border-b border-gray-100">Institución</th>
              <th className="p-2 font-semibold border-b border-gray-100 w-24">Año de finalización</th>
              <th className="p-2 font-semibold border-b border-gray-100">Título</th>
              <th className="p-2 font-semibold border-b border-gray-100">Logros</th>
            </tr>
          </thead>
          <tbody>
            {form.formaciones.map((f2) => (
              <tr key={f2.id} className="border-b border-gray-50">
                <td className="p-1.5">
                  <input value={f2.institucion} onChange={(ev) => setFormacion(f2.id, "institucion", ev.target.value)} className={inputClass} />
                </td>
                <td className="p-1.5">
                  <input value={f2.anioFinalizacion} onChange={(ev) => setFormacion(f2.id, "anioFinalizacion", ev.target.value)} className={inputClass} />
                </td>
                <td className="p-1.5">
                  <input value={f2.titulo} onChange={(ev) => setFormacion(f2.id, "titulo", ev.target.value)} className={inputClass} />
                </td>
                <td className="p-1.5">
                  <input value={f2.logros} onChange={(ev) => setFormacion(f2.id, "logros", ev.target.value)} className={inputClass} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, formaciones: [...f.formaciones, formacionVacia()] }))}
          className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410] mt-3"
        >
          + Agregar formación
        </button>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6 flex-wrap">
          <p className="text-xs font-medium text-gray-500">¿Habla idiomas?</p>
          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
            <input
              type="radio"
              checked={form.hablaIdiomas === "si"}
              onChange={() => setForm((f) => ({ ...f, hablaIdiomas: "si" }))}
              className="accent-[#F5A623]"
            />
            Sí
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
            <input
              type="radio"
              checked={form.hablaIdiomas === "no"}
              onChange={() => setForm((f) => ({ ...f, hablaIdiomas: "no", idiomaCual: "" }))}
              className="accent-[#F5A623]"
            />
            No
          </label>
          {form.hablaIdiomas === "si" && (
            <input
              value={form.idiomaCual}
              onChange={(e) => setForm((f) => ({ ...f, idiomaCual: e.target.value }))}
              placeholder="¿Cuál?"
              className={`${inputClass} flex-1 min-w-[160px]`}
            />
          )}
        </div>
      </div>

      {/* Preguntas agrupadas */}
      {GRUPOS_PREGUNTAS.map((grupo) => (
        <div key={grupo.grupo} className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623]/15 -m-5 mb-4 px-5 py-2 rounded-t-xl italic">
            Preguntas de entrevista — {grupo.grupo}
          </h3>
          <div className="space-y-4">
            {grupo.preguntas.map((p) => (
              <div key={p.key}>
                <label className="block text-xs font-semibold text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-1.5">
                  {p.pregunta}
                </label>
                <textarea
                  value={form.respuestas[p.key] ?? ""}
                  onChange={(e) => setRespuesta(p.key, e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Observaciones */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623]/15 -m-5 mb-4 px-5 py-2 rounded-t-xl">
          Observaciones de la entrevista
        </h3>
        <textarea
          value={form.observaciones}
          onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
          rows={4}
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="flex items-center gap-3 sticky bottom-4">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 shadow-lg"
        >
          {saving ? "Guardando..." : "Guardar entrevista"}
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
      </div>
    </div>
  );
}
