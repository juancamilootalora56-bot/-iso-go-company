"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Colaborador = {
  id: string;
  email: string;
  nombre: string | null;
  rol: "admin" | "comercial" | "tecnico";
  activo: boolean;
  created_at: string;
};

export default function ColaboradoresClient({
  initialColaboradores,
}: {
  initialColaboradores: Colaborador[];
}) {
  const [colaboradores, setColaboradores] = useState(initialColaboradores);
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"comercial" | "tecnico" | "admin">("comercial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState<{ email: string; password: string } | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreado(null);

    try {
      const res = await fetch("/api/crm/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nombre, rol, password: password || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear el usuario");
        return;
      }
      setCreado({ email, password: data.password });
      setEmail("");
      setNombre("");
      setPassword("");
      setRol("comercial");

      const supabase = createClient();
      const { data: updated } = await supabase
        .from("perfiles_internos")
        .select("id, email, nombre, rol, activo, created_at")
        .order("created_at", { ascending: false });
      if (updated) setColaboradores(updated);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActivo(id: string, activo: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("perfiles_internos")
      .update({ activo: !activo })
      .eq("id", id);
    if (!error) {
      setColaboradores((prev) =>
        prev.map((c) => (c.id === id ? { ...c, activo: !activo } : c))
      );
    }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`¿Eliminar definitivamente a ${email}? Vas a poder volver a invitarlo después.`)) return;
    setError(null);
    const res = await fetch("/api/crm/colaboradores", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "No se pudo eliminar");
      return;
    }
    setColaboradores((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Colaboradores</h1>

      <form
        onSubmit={handleInvite}
        className="bg-white border border-[#E8E2D8] rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
      >
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@isogo.company"
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] placeholder-[#B5AEA0] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Opcional"
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] placeholder-[#B5AEA0] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Contraseña</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Generar automática"
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] placeholder-[#B5AEA0] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Rol</label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as typeof rol)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          >
            <option value="comercial">Comercial</option>
            <option value="tecnico">Técnico</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {loading ? "Creando..." : "Crear usuario"}
        </button>

        {error && <p className="md:col-span-5 text-red-500 text-sm">{error}</p>}

        {creado && (
          <div className="md:col-span-5 bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            <p className="text-green-700 font-semibold mb-1">Usuario creado. Compartile estos datos:</p>
            <p className="text-[#2D2A26]">
              Email: <span className="font-mono font-semibold">{creado.email}</span>
            </p>
            <p className="text-[#2D2A26]">
              Contraseña: <span className="font-mono font-semibold">{creado.password}</span>
            </p>
            <p className="text-[#8A8478] text-xs mt-2">
              Puede cambiarla luego desde su perfil dentro del CRM.
            </p>
          </div>
        )}
      </form>

      <div className="bg-white border border-[#E8E2D8] rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-[#E8E2D8] text-left text-[#8A8478]">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map((c) => (
              <tr key={c.id} className="border-b border-[#E8E2D8] last:border-0">
                <td className="px-4 py-3">{c.nombre || "—"}</td>
                <td className="px-4 py-3 text-[#8A8478]">{c.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs uppercase font-bold text-[#F5A623]">{c.rol}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={c.activo ? "text-green-600" : "text-[#8A8478]"}>
                    {c.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => toggleActivo(c.id, c.activo)}
                    className="text-xs text-[#8A8478] hover:text-[#2D2A26] underline mr-3"
                  >
                    {c.activo ? "Desactivar" : "Reactivar"}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.email)}
                    className="text-xs text-[#8A8478] hover:text-red-500 underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {colaboradores.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#8A8478]">
                  Todavía no hay colaboradores invitados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
