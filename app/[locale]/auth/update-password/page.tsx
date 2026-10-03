"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const supabase = createClient();
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setError("El enlace de recuperación es inválido o expiró. Solicita uno nuevo.");
        setSessionReady(true);
      });
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) setError("El enlace de recuperación es inválido o expiró. Solicita uno nuevo.");
        setSessionReady(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError("No se pudo actualizar la contraseña. El enlace puede haber expirado — solicita uno nuevo.");
      } else {
        setDone(true);
        setTimeout(() => router.push(`/${locale}/auth/login`), 2000);
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="bg-[#242424] rounded-2xl p-8 shadow-2xl border border-white/5 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Contraseña actualizada</h2>
        <p className="text-gray-400 text-sm">Redirigiendo al inicio de sesión…</p>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="bg-[#242424] rounded-2xl p-8 shadow-2xl border border-white/5 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Verificando enlace…</h2>
        <p className="text-gray-400 text-sm">Un momento por favor</p>
      </div>
    );
  }

  return (
    <div className="bg-[#242424] rounded-2xl p-8 shadow-2xl border border-white/5">
      <h1 className="text-2xl font-bold text-white mb-2 text-center">Nueva contraseña</h1>
      <p className="text-gray-400 text-sm text-center mb-8">
        Elegí una contraseña nueva para tu cuenta
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Nueva contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623] transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-3 rounded-lg hover:bg-[#e09410] transition-colors disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        <Link href={`/${locale}/auth/login`} className="text-[#F5A623] hover:text-[#e09410] font-medium">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
