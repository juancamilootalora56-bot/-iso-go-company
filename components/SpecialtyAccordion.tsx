"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
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

export interface SpecialtyAccordionItem {
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

export default function SpecialtyAccordion({
  items,
  defaultOpen = 0,
}: {
  items: SpecialtyAccordionItem[];
  defaultOpen?: number | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const Icon = iconMap[item.icon] || ClipboardList;
        return (
          <div
            key={item.id}
            id={item.id}
            className={`rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${
              isOpen ? "border-[#F5A623]/40 shadow-lg" : "border-gray-100 shadow-sm hover:shadow-md"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center gap-4 p-5 md:p-6 text-left transition-colors"
              aria-expanded={isOpen}
            >
              {item.image ? (
                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover grayscale-[20%] saturate-75 contrast-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/60 via-[#1A1A1A]/10 to-[#F5A623]/30 mix-blend-multiply" />
                </div>
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 bg-[#F5A623] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-[#1A1A1A]" strokeWidth={2} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Especialidad {item.number}
                </span>
                <h3 className="text-lg md:text-xl font-bold text-[#1A1A1A] leading-snug">{item.title}</h3>
                {!isOpen && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1 italic hidden sm:block">"{item.tagline}"</p>
                )}
              </div>

              <span
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isOpen ? "bg-[#F5A623] border-[#F5A623] rotate-180" : "border-gray-200 text-gray-400"
                }`}
              >
                <ChevronDown className={`w-4 h-4 ${isOpen ? "text-[#1A1A1A]" : ""}`} strokeWidth={2.5} />
              </span>
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 md:px-6 pb-6 md:pb-8 pt-1 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    <div>
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
                              <svg
                                className="w-3.5 h-3.5 text-[#1A1A1A]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
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
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
