"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

const SECTORS = ["Manufactura", "Alimentos y Bebidas", "Salud y Farmacia", "Tecnología", "Construcción", "Servicios", "Otro"];
const NORMS = ["ISO 9001", "ISO 14001", "ISO 45001", "ISO/IEC 27001", "ISO 22000", "ISO 13485", "Kosher", "Otro"];

export default function PerfilPage() {
  const { user, profile } = useUser();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [interestedNorms, setInterestedNorms] = useState<string[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setCompanyName(profile.company_name || "");
      setSector(profile.sector || "");
      setPhone(profile.phone || "");
      setCountry(profile.country || "");
      setInterestedNorms(profile.interested_norms || []);
    }
  }, [profile]);

  function toggleNorm(norm: string) {
    setInterestedNorms((prev) =>
      prev.includes(norm) ? prev.filter((n) => n !== norm) : [...prev, norm]
    );
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({
        full_name: fullName,
        company_name: companyName,
        sector,
        phone,
        country,
        interested_norms: interestedNorms,
        updated_at: new Date().toISOString(),
      }).eq("id", user!.id);
      if (error) setError("Error al guardar. Intenta de nuevo.");
      else setSaved(true);
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Mínimo 8 caracteres.");
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) setPasswordError(error.message);
      else {
        setPasswordSaved(true);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordError("Error de conexión.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Mi perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Actualiza tu información personal y de empresa</p>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-[#1A1A1A]">Información personal y de empresa</h2>

        {saved && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Perfil actualizado correctamente.
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-gray-400 bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de empresa</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors"
            >
              <option value="">Selecciona</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">País</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Normas de interés</label>
          <div className="grid sm:grid-cols-2 gap-2">
            {NORMS.map((norm) => (
              <label key={norm} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={interestedNorms.includes(norm)}
                  onChange={() => toggleNorm(norm)}
                  className="w-4 h-4 accent-[#F5A623]"
                />
                <span className="text-sm text-gray-700">{norm}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-[#1A1A1A]">Cambiar contraseña</h2>

        {passwordSaved && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Contraseña actualizada correctamente.
          </div>
        )}
        {passwordError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{passwordError}</div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={changingPassword || !newPassword}
          className="bg-[#1A1A1A] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
        >
          {changingPassword ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 p-6">
        <h2 className="font-semibold text-red-700 mb-2">Zona de peligro</h2>
        <p className="text-sm text-gray-500 mb-4">
          Eliminar tu cuenta es una acción irreversible. Todos tus datos serán eliminados permanentemente.
        </p>
        <button
          type="button"
          className="border border-red-300 text-red-600 font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
          onClick={() => alert("Para eliminar tu cuenta, contacta a soporte@isogo.com")}
        >
          Eliminar mi cuenta
        </button>
      </div>
    </div>
  );
}
