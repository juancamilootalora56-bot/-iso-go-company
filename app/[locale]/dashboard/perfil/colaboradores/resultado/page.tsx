"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { MODULOS_PERMISOS, type Colaborador } from "@/lib/colaboradoresCliente";

export default function ColaboradoresResultadoPage() {
  const { user } = useUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/perfil`;

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetenado, setReseteando] = useState<string | null>(null);
  const [passwordsNuevas, setPasswordsNuevas] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("client_colaboradores")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      setColaboradores(data ?? []);
      setLoading(false);
    })();
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
          <table className="w-full text-xs min-w-[1000px] border-collapse">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
