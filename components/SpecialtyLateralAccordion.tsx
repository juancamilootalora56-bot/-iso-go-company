"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Target,
  ShieldAlert,
  TrendingUp,
  Settings,
  Users,
  Lightbulb,
  Building2,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  target: Target,
  "shield-alert": ShieldAlert,
  "trending-up": TrendingUp,
  settings: Settings,
  users: Users,
  lightbulb: Lightbulb,
  building: Building2,
};

export interface SpecialtyItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  result: string;
  features: string[];
  image?: string;
  icon: string;
  href: string;
  ctaLabel: string;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function DetailPanel({ item }: { item: SpecialtyItem }) {
  return (
    <div
      key={item.id}
      className="bg-white rounded-2xl border border-[#F5A623]/30 shadow-md p-8 md:p-10 mb-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Especialidad {item.number}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3 mt-1">{item.title}</h2>
          <p className="text-[#F5A623] font-semibold text-lg mb-4 italic">"{item.tagline}"</p>
          <p className="text-gray-700 leading-relaxed mb-6">{item.description}</p>

          <div className="bg-gradient-to-br from-[#262626] to-[#1A1A1A] rounded-xl p-4 mb-6 shadow-sm">
            <h4 className="text-[#F5A623] text-xs font-bold uppercase tracking-wider mb-2">
              Resultado que obtienes
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">{item.result}</p>
          </div>

          <Link
            href={item.href}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-3 rounded-lg hover:bg-[#e09410] transition-colors inline-block"
          >
            {item.ctaLabel}
          </Link>
        </div>

        <div className="bg-gradient-to-br from-[#F4F4F4] to-[#ECECEC] rounded-2xl p-6 md:p-8 shadow-sm">
          <h4 className="font-bold text-[#1A1A1A] mb-4">Lo que incluye</h4>
          <ul className="space-y-3">
            {item.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#F5A623] rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-gray-700 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SpecialtyLateralAccordion({ items }: { items: SpecialtyItem[] }) {
  const [active, setActive] = useState(0);
  const rows = chunk(items, 3);
  const activeItem = items[active];
  const activeRowIndex = Math.floor(active / 3);

  return (
    <div className="space-y-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex}>
          <div className="flex h-[280px] md:h-[320px] gap-2">
            {row.map((item) => {
              const globalIndex = items.indexOf(item);
              const isActive = globalIndex === active;
              const Icon = iconMap[item.icon] || ClipboardList;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(globalIndex)}
                  className="group relative overflow-hidden rounded-2xl transition-[flex-grow] duration-700 ease-out text-left focus:outline-none"
                  style={{ flexGrow: isActive ? 5 : 1, flexBasis: 0, flexShrink: 1 }}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 80vw"
                      className="object-cover grayscale-[20%] saturate-75 contrast-110 transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#262626] to-[#1A1A1A]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/70 via-[#1A1A1A]/20 to-[#F5A623]/25 mix-blend-multiply" />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-500 ${
                      isActive ? "opacity-100" : "opacity-70"
                    }`}
                  />

                  <span
                    className={`absolute top-4 left-4 flex items-center justify-center rounded-lg bg-[#F5A623] transition-all duration-300 ${
                      isActive ? "w-11 h-11" : "w-9 h-9"
                    }`}
                  >
                    <Icon className={isActive ? "w-5 h-5 text-[#1A1A1A]" : "w-4 h-4 text-[#1A1A1A]"} strokeWidth={2} />
                  </span>
                  <span className="absolute top-5 right-4 text-[10px] font-bold text-white/60 uppercase tracking-wider">
                    {item.number}
                  </span>

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3
                      className={`font-bold leading-snug transition-all duration-300 ${
                        isActive ? "text-lg md:text-xl mb-2" : "text-sm line-clamp-2"
                      }`}
                    >
                      {item.title}
                    </h3>
                    {isActive && (
                      <p className="text-sm text-gray-200 italic line-clamp-2 hidden md:block">"{item.tagline}"</p>
                    )}
                  </div>

                  {isActive && (
                    <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-[#F5A623]/30 rotate-45 z-10" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Panel de detalle: aparece justo debajo de la fila seleccionada, sin recortar contenido */}
          {rowIndex === activeRowIndex && <DetailPanel item={activeItem} />}
        </div>
      ))}
    </div>
  );
}
