"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/${locale}/auth/callback?next=/${locale}/auth/update-password`,
      });
      if (error) {
        setError("Error al enviar el correo. Verifica tu email.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#242424] rounded-2xl p-8 shadow-2xl border border-white/5">
      {sent ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-[#F5A623]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Revisa tu correo</h2>
          <p className="text-gray-400 text-sm mb-6">
            Te enviamos un enlace para restablecer tu contraseña a{" "}
            <span className="text-white font-medium">{email}</span>
          </p>
          <Link
            href={`/${locale}/auth/login`}
            className="text-[#F5A623] hover:text-[#e09410] text-sm font-medium"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-white mb-2 text-center">
            Recuperar contraseña
          </h1>
          <p className="text-gray-400 text-sm text-center mb-8">
            Ingresa tu email y te enviamos un enlace para restablecer tu contraseña
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@empresa.com"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-3 rounded-lg hover:bg-[#e09410] transition-colors disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            <Link href={`/${locale}/auth/login`} className="text-[#F5A623] hover:text-[#e09410] font-medium">
              ← Volver al inicio de sesión
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
