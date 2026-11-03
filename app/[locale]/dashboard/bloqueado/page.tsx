"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function ModuloBloqueadoPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden text-center">
        <div className="relative bg-[#1A1A1A] p-8 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <p className="text-[#F5A623] text-[11px] font-bold uppercase tracking-wide">Período de diagnóstico</p>
            <h1 className="text-white text-xl font-bold mt-1">Este módulo es parte del acceso completo</h1>
          </div>
        </div>

        <div className="p-8 space-y-5">
          <p className="text-gray-500 text-sm leading-relaxed">
            Tu cuenta todavía está en el período de diagnóstico inicial, donde podés explorar el Inicio y tu Perfil.
            Cuando cerremos el acuerdo con tu asesor, se habilita el resto de los módulos de gestión (Gerencia,
            Talento Humano, Compras, Comercial, Operativa, Diseño y Desarrollo, Calidad) con todo tu sistema de
            gestión funcionando.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <a
              href="https://wa.me/595982859051"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm"
            >
              Hablar con un asesor →
            </a>
            <Link
              href={`/${locale}/dashboard`}
              className="text-sm text-gray-400 hover:text-[#1A1A1A] font-semibold px-4 py-2.5"
            >
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
