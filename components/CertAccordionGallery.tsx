"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export interface CertAccordionItem {
  id: string;
  name: string;
  title: string;
  tagline: string;
  benefit?: string;
  image: string;
  href?: string;
}

export default function CertAccordionGallery({
  items,
  hrefBase,
  heightClass = "h-[480px] lg:h-[560px]",
  defaultActive = 0,
}: {
  items: CertAccordionItem[];
  hrefBase?: string;
  heightClass?: string;
  defaultActive?: number;
}) {
  const [active, setActive] = useState(defaultActive);

  return (
    <div className={`hidden md:flex ${heightClass} gap-2`}>
      {items.map((item, i) => {
        const isActive = i === active;
        return (
          <Link
            key={item.id}
            href={item.href ?? `${hrefBase}#${item.id}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="group relative overflow-hidden rounded-2xl transition-[flex-grow] duration-700 ease-out"
            style={{ flexGrow: isActive ? 5 : 1, flexBasis: 0, flexShrink: 1 }}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 60vw, 80vw"
              className="object-cover grayscale-[20%] saturate-75 contrast-110 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/70 via-[#1A1A1A]/20 to-[#F5A623]/25 mix-blend-multiply" />
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-500 ${
                isActive ? "opacity-100" : "opacity-60"
              }`}
            />

            <span className="absolute top-4 left-4 text-xs font-bold text-white bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
              {item.name}
            </span>

            <div
              className={`absolute bottom-0 left-0 right-0 p-6 text-white transition-all duration-500 ${
                isActive ? "opacity-100 translate-y-0 delay-200" : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              <h3 className="text-xl font-bold mb-2 whitespace-nowrap">{item.title}</h3>
              <p className="text-sm text-gray-200 mb-3 leading-relaxed line-clamp-2 max-w-md">{item.tagline}</p>
              {item.benefit && (
                <span className="inline-block bg-[#F5A623] text-[#1A1A1A] text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                  {item.benefit}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
