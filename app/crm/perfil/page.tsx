"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CrmPerfilPage() {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      setEmail(session.user.email ?? "");
      const { data: perfil } = await supabase
        .from("perfiles_internos")
        .select("nombre, rol")
        .eq("id", session.user.id)
        .maybeSingle();
      setNombre(perfil?.nombre ?? null);
      setRol(perfil?.rol ?? null);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]";
  const labelClass = "block text-xs font-medium text-[#8A8478] mb-1";

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>

      <div className="bg-white border border-[#E8E2D8] rounded-2xl p-6 mb-6 space-y-2 text-sm">
        <p><span className="text-[#8A8478]">Nombre:</span> {nombre || "—"}</p>
        <p><span className="text-[#8A8478]">Email:</span> {email}</p>
        <p><span className="text-[#8A8478]">Rol:</span> <span className="uppercase text-[#F5A623] font-bold">{rol}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E8E2D8] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#2D2A26]">Cambiar contraseña</h2>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Contraseña actualizada correctamente.
          </div>
        )}

        <div>
          <label className={labelClass}>Nueva contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    </div>
  );
}
