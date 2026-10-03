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
  const [rol, setRol] = useState<"comercial" | "tecnico" | "admin">("comercial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/crm/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nombre, rol }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al invitar");
        return;
      }
      setSuccess(`Invitación enviada a ${email}`);
      setEmail("");
      setNombre("");
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Colaboradores</h1>

      <form
        onSubmit={handleInvite}
        className="bg-[#242424] border border-white/5 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@isogo.company"
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Opcional"
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Rol</label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as typeof rol)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
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
          {loading ? "Invitando..." : "Invitar"}
        </button>

        {error && <p className="md:col-span-4 text-red-400 text-sm">{error}</p>}
        {success && <p className="md:col-span-4 text-green-400 text-sm">{success}</p>}
      </form>

      <div className="bg-[#242424] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-400">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map((c) => (
              <tr key={c.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">{c.nombre || "—"}</td>
                <td className="px-4 py-3 text-gray-400">{c.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs uppercase font-bold text-[#F5A623]">{c.rol}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={c.activo ? "text-green-400" : "text-gray-500"}>
                    {c.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleActivo(c.id, c.activo)}
                    className="text-xs text-gray-400 hover:text-white underline"
                  >
                    {c.activo ? "Desactivar" : "Reactivar"}
                  </button>
                </td>
              </tr>
            ))}
            {colaboradores.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
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
