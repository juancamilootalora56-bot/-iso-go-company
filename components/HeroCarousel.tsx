"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { HexagonOutline } from "@/components/HexagonDecor";

interface Slide {
  id: number;
  bg: string;
  content: React.ReactNode;
}

function useCarousel(total: number, interval = 6000) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const goTo = useCallback((i: number) => setCurrent(i), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval, paused]);

  return { current, next, prev, goTo, setPaused };
}

export default function HeroCarousel({ locale }: { locale: string }) {
  const slides = [
    {
      id: 0,
      bg: "bg-[#1A1A1A]",
      content: (
        <div className="relative overflow-hidden min-h-[82vh] flex items-center w-full">
          {/* Decorative */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-16 top-0 bottom-0 w-48 opacity-30" style={{ background: "#F5A623", transform: "skewX(-8deg)" }} />
            <div className="absolute left-24 top-0 bottom-0 w-12 opacity-15" style={{ background: "#F5A623", transform: "skewX(-8deg)" }} />
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-5" style={{ background: "radial-gradient(ellipse at 80% 50%, #F5A623 0%, transparent 70%)" }} />
            <HexagonOutline size={300} color="#F5A623" className="absolute -right-16 -bottom-16 opacity-10" />
            <HexagonOutline size={150} color="#F5A623" className="absolute right-48 top-16 opacity-10" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 w-full">
            <div className="max-w-3xl">
              <span className="inline-block bg-[#F5A623] text-[#1A1A1A] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                Certificación ISO + Automatización
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
                Convertimos tu certificación ISO en un sistema de gestión automatizado que impulsa el crecimiento real de tu empresa.
              </h1>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
                No solo te certificamos. Te construimos el sistema de gestión que mantiene vivo el certificado y convierte tus procesos en ventaja competitiva.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/${locale}/contacto`} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-8 py-4 rounded-lg hover:bg-[#e09410] transition-colors text-lg text-center">
                  Cotiza tu certificación →
                </Link>
                <Link href={`/${locale}/certificaciones`} className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-[#1A1A1A] transition-colors text-lg text-center">
                  Conoce nuestro proceso
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap gap-6 items-center">
                {[
                  { value: "200+", label: "Empresas certificadas" },
                  { value: "11+", label: "Normas ISO" },
                  { value: "15+", label: "Años de experiencia" },
                  { value: "98%", label: "Tasa de certificación" },
                ].map((stat, i) => (
                  <div key={stat.value} className="flex items-center gap-6">
                    {i > 0 && <div className="w-px h-10 bg-gray-700" />}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#F5A623]">{stat.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      bg: "bg-[#F5A623]",
      content: (
        <div className="relative overflow-hidden min-h-[82vh] flex items-center w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block bg-[#1A1A1A] text-[#F5A623] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                  Norma Estrella
                </span>
                <h2 className="text-5xl md:text-6xl font-black text-[#1A1A1A] mb-2">ISO 9001</h2>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">Gestión de Calidad</h3>
                <p className="text-xl text-[#1A1A1A] font-semibold mb-4 italic">
                  "La norma que convierte tu empresa en una máquina de resultados rentables y escalables"
                </p>
                <p className="text-[#1A1A1A] leading-relaxed mb-6 text-base">
                  ISO 9001 estandariza tus procesos para que tu empresa funcione igual de bien sin depender de ti. Escala sin perder calidad, reduce costos operativos hasta un 25% y accede a contratos corporativos que antes estaban fuera de tu alcance.
                </p>
                <div className="flex flex-wrap gap-2 mb-7">
                  {["↓ 25% costos operativos", "↑ 40% retención de clientes", "✓ Acceso a licitaciones"].map((badge) => (
                    <span key={badge} className="text-xs font-bold bg-[#1A1A1A] text-[#F5A623] px-3 py-1.5 rounded-full">{badge}</span>
                  ))}
                </div>
                <Link href={`/${locale}/contacto`} className="inline-block bg-[#1A1A1A] text-white font-bold px-8 py-4 rounded-lg hover:bg-[#333] transition-colors text-lg">
                  Quiero esta certificación →
                </Link>
              </div>
              <div>
                <Image
                  src="/certificacion-9001.jpg"
                  alt="Certificación ISO 9001"
                  width={700}
                  height={500}
                  className="rounded-2xl shadow-2xl w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      bg: "bg-[#1A1A1A]",
      content: (
        <div className="relative overflow-hidden min-h-[82vh] flex items-center w-full">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-16 top-0 bottom-0 w-48 opacity-20" style={{ background: "#F5A623", transform: "skewX(-8deg)" }} />
            <HexagonOutline size={300} color="#F5A623" className="absolute -right-16 -bottom-16 opacity-10" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-[#F5A623] text-sm font-bold uppercase tracking-widest">Certificación especializada</span>
                <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6 text-white">Certificación Kosher</h2>
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  Accede a mercados de alto valor con el respaldo de la certificación más reconocida del mundo alimentario
                </p>
                <Link href={`/${locale}/contacto`} className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-8 py-4 rounded-lg hover:bg-[#e09410] transition-colors text-lg">
                  Cotiza tu certificación Kosher →
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center gap-6">
                <Image
                  src="/kosher.png"
                  alt="Certificación Kosher"
                  width={280}
                  height={280}
                  className="object-contain drop-shadow-2xl brightness-0 invert"
                />
                <p className="text-center text-white/70 text-sm font-light tracking-widest uppercase max-w-[260px] leading-relaxed border-t border-white/20 pt-4">
                  Celebramos una alianza diseñada para elevar el estándar de tu empresa.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      bg: "bg-[#111111]",
      content: (
        <div className="relative overflow-hidden min-h-[82vh] flex items-center w-full">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-5" style={{ background: "radial-gradient(ellipse at 80% 50%, #F5A623 0%, transparent 70%)" }} />
            <HexagonOutline size={200} color="#F5A623" className="absolute right-10 top-10 opacity-10" />
            <HexagonOutline size={350} color="#F5A623" className="absolute -right-20 bottom-0 opacity-5" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 w-full">
            <div className="max-w-2xl">
              <span className="text-[#F5A623] text-sm font-bold uppercase tracking-widest">Tecnología propia</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6 text-white">Plataforma de Gestión ISO Go</h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-10">
                El software que hace que tu certificación trabaje todos los días del año. Dashboards, alertas automáticas, control documental y trazabilidad en tiempo real.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  "Control documental automatizado",
                  "Alertas de vencimiento",
                  "Trazabilidad de procesos",
                  "Preparación para auditorías",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#F5A623] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-gray-300 text-sm">{feat}</span>
                  </div>
                ))}
              </div>
              <Link href={`/${locale}/software`} className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-8 py-4 rounded-lg hover:bg-[#e09410] transition-colors text-lg">
                Solicita una demo →
              </Link>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const { current, next, prev, goTo, setPaused } = useCarousel(slides.length, 6000);

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="relative">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`${slide.bg} transition-opacity duration-700 ${
              i === current ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"
            }`}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
        aria-label="Anterior"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
        aria-label="Siguiente"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 h-2.5 bg-[#F5A623]"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
