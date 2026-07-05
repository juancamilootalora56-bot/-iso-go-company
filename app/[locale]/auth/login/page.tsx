"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LoginPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="bg-[#242424] rounded-2xl p-8 shadow-2xl border border-white/5 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-[#F5A623] rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-3">
        Plataforma en construcción
      </h1>
      <p className="text-gray-400 text-sm leading-relaxed mb-8">
        Estamos trabajando para ofrecerte la mejor experiencia. Pronto podrás acceder a tu dashboard de certificaciones ISO.
      </p>

      <div className="bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl p-5 mb-8">
        <p className="text-[#F5A623] font-semibold text-sm mb-1">🚀 Lanzamiento próximo</p>
        <p className="text-gray-400 text-xs leading-relaxed">
          Si ya eres cliente, nos pondremos en contacto contigo directamente cuando la plataforma esté lista.
        </p>
      </div>

      <Link
        href={`/${locale}/contacto`}
        className="block w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-3 rounded-lg hover:bg-[#e09410] transition-colors mb-4"
      >
        Cotiza tu certificación →
      </Link>

      <Link
        href={`/${locale}`}
        className="block w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}
