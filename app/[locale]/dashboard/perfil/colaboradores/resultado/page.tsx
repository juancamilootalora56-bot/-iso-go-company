"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { MODULOS_PERMISOS, type Colaborador } from "@/lib/colaboradoresCliente";

const MAX_FOTO_BYTES = 800_000;

export default function ColaboradoresResultadoPage() {
  const { user } = useUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/perfil`;
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetenado, setReseteando] = useState<string | null>(null);
  const [passwordsNuevas, setPasswordsNuevas] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const [editando, setEditando] = useState<Colaborador | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [errorEdit, setErrorEdit] = useState<string | null>(null);

  async function cargarColaboradores() {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("client_colaboradores")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    setColaboradores(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    cargarColaboradores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function labelsPermisos(permisos: string[]) {
    return permisos
      .map((p) => MODULOS_PERMISOS.find((m) => m.modulo === p)?.label ?? p)
      .join(", ");
  }

  async function restablecerPassword(id: string) {
    setError(null);
    setReseteando(id);
    try {
      const res = await fetch("/api/dashboard/colaboradores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo restablecer la contraseña");
        return;
      }
      setPasswordsNuevas((prev) => ({ ...prev, [id]: data.password }));
    } catch {
      setError("Error de conexión.");
    } finally {
      setReseteando(null);
    }
  }

  function abrirEditar(c: Colaborador) {
    setErrorEdit(null);
    setEditando({ ...c });
  }

  function cerrarEditar() {
    setEditando(null);
    setErrorEdit(null);
    if (fotoInputRef.current) fotoInputRef.current.value = "";
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editando) return;
    if (file.size > MAX_FOTO_BYTES) {
      setErrorEdit("La foto es muy pesada. Usá una imagen de menos de 800KB.");
      return;
    }
    setErrorEdit(null);
    const reader = new FileReader();
    reader.onload = () => setEditando((c) => (c ? { ...c, foto: reader.result as string } : c));
    reader.readAsDataURL(file);
  }

  function togglePermisoEdit(modulo: string) {
    setEditando((c) =>
      c
        ? {
            ...c,
            permisos: c.permisos.includes(modulo)
              ? c.permisos.filter((m) => m !== modulo)
              : [...c.permisos, modulo],
          }
        : c
    );
  }

  async function guardarEdicion() {
    if (!editando) return;
    if (!editando.nombre.trim() || !editando.apellido.trim()) {
      setErrorEdit("Nombre y apellido son obligatorios.");
      return;
    }
    setSavingEdit(true);
    setErrorEdit(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("client_colaboradores")
      .update({
        nombre: editando.nombre,
        apellido: editando.apellido,
        cargo: editando.cargo,
        identificacion: editando.identificacion,
        foto: editando.foto,
        permisos: editando.permisos,
      })
      .eq("id", editando.id);
    setSavingEdit(false);
    if (error) {
      setErrorEdit("No se pudo guardar. Intentá de nuevo.");
      return;
    }
    await cargarColaboradores();
    cerrarEditar();
  }

  const inputClass =
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#F5A623]";

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Perfil
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz de Colaboradores</h1>
        <p className="text-gray-500 text-sm mt-1">
          Todos los accesos de tu equipo. Por seguridad, las contraseñas no se guardan — usá
          &quot;Restablecer&quot; para generar una nueva y compartirla.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : colaboradores.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no creaste ningún colaborador.</p>
          <Link
            href={basePath}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Crear colaborador
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-xs min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="p-3 font-semibold border-b border-gray-100 w-14">Foto</th>
                <th className="p-3 font-semibold border-b border-gray-100">Nombre</th>
                <th className="p-3 font-semibold border-b border-gray-100">Apellido</th>
                <th className="p-3 font-semibold border-b border-gray-100">Cargo</th>
                <th className="p-3 font-semibold border-b border-gray-100">Identificación</th>
                <th className="p-3 font-semibold border-b border-gray-100">Email</th>
                <th className="p-3 font-semibold border-b border-gray-100">Módulos</th>
                <th className="p-3 font-semibold border-b border-gray-100">Estado</th>
                <th className="p-3 font-semibold border-b border-gray-100 w-56">Contraseña</th>
                <th className="p-3 font-semibold border-b border-gray-100 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {colaboradores.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 align-top">
                  <td className="p-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                      {c.foto && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.foto} alt={c.nombre} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-[#1A1A1A]">{c.nombre}</td>
                  <td className="p-3 text-gray-600">{c.apellido}</td>
                  <td className="p-3 text-gray-600">{c.cargo || "—"}</td>
                  <td className="p-3 text-gray-600">{c.identificacion || "—"}</td>
                  <td className="p-3 text-gray-600">{c.email || "—"}</td>
                  <td className="p-3 text-gray-600">{labelsPermisos(c.permisos) || "—"}</td>
                  <td className="p-3">
                    <span className={c.activo ? "text-green-600 font-semibold" : "text-gray-400"}>
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3">
                    {passwordsNuevas[c.id] ? (
                      <span className="font-mono font-semibold text-[#1A1A1A]">{passwordsNuevas[c.id]}</span>
                    ) : (
                      <button
                        onClick={() => restablecerPassword(c.id)}
                        disabled={resetenado === c.id}
                        className="text-[#F5A623] font-semibold hover:text-[#e09410] disabled:opacity-50"
                      >
                        {resetenado === c.id ? "Generando..." : "Restablecer contraseña"}
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    <button onClick={() => abrirEditar(c)} className="text-gray-400 hover:text-[#1A1A1A] font-semibold">
                      ✎ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" onClick={cerrarEditar}>
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-bold text-[#1A1A1A]">Editar colaborador</h2>

            {errorEdit && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{errorEdit}</div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fotoInputRef.current?.click()}
                className="relative w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden"
              >
                {editando.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editando.foto} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
                <span className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200 text-xs">✎</span>
              </button>
              <input ref={fotoInputRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                <input
                  value={editando.nombre}
                  onChange={(e) => setEditando((c) => c && { ...c, nombre: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Apellido</label>
                <input
                  value={editando.apellido}
                  onChange={(e) => setEditando((c) => c && { ...c, apellido: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cargo</label>
              <input
                value={editando.cargo ?? ""}
                onChange={(e) => setEditando((c) => c && { ...c, cargo: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Identificación</label>
              <input
                value={editando.identificacion ?? ""}
                onChange={(e) => setEditando((c) => c && { ...c, identificacion: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Módulos que puede trabajar</label>
              <div className="space-y-1.5">
                {MODULOS_PERMISOS.map((m) => (
                  <label key={m.modulo} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editando.permisos.includes(m.modulo)}
                      onChange={() => togglePermisoEdit(m.modulo)}
                      className="w-4 h-4 accent-[#F5A623]"
                    />
                    <span className="text-sm text-gray-700">
                      {m.icon} {m.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={guardarEdicion}
                disabled={savingEdit}
                className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm"
              >
                {savingEdit ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={cerrarEditar} className="text-sm text-gray-400 hover:text-gray-600">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
