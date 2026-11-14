"use client";

import { useEffect, useState } from "react";

// Lee el logo de la empresa (ya cargado como data URL en profile.logo_url) y
// calcula un color promedio representativo, ignorando blancos, negros y
// grises casi puros (fondo/transparencia típica de un logo) para quedarnos
// con el color de marca real. Se usa para que documentos formales (como el
// Compromiso de la Dirección) salgan personalizados por cliente sin que
// tengan que elegir nada.
export function useColorDesdeLogo(logoUrl: string | null | undefined): string | null {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!logoUrl) {
      setColor(null);
      return;
    }
    let cancelado = false;
    const img = new window.Image();
    img.onload = () => {
      if (cancelado) return;
      try {
        const canvas = document.createElement("canvas");
        const w = (canvas.width = Math.min(img.naturalWidth || 80, 80));
        const h = (canvas.height = Math.min(img.naturalHeight || 80, 80));
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);

        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 200) continue;
          const rr = data[i];
          const gg = data[i + 1];
          const bb = data[i + 2];
          const max = Math.max(rr, gg, bb);
          const min = Math.min(rr, gg, bb);
          const sat = max === 0 ? 0 : (max - min) / max;
          const lum = (rr + gg + bb) / 3;
          if (lum > 235 || lum < 25 || sat < 0.18) continue;
          r += rr;
          g += gg;
          b += bb;
          n++;
        }

        if (n < 10) {
          setColor(null);
          return;
        }
        r = Math.round(r / n);
        g = Math.round(g / n);
        b = Math.round(b / n);
        setColor(`#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`);
      } catch {
        // Logo externo (no data URL) u otro error de canvas — nos quedamos sin color.
        setColor(null);
      }
    };
    img.onerror = () => setColor(null);
    img.src = logoUrl;
    return () => {
      cancelado = true;
    };
  }, [logoUrl]);

  return color;
}

// Aclara (cantidad > 0) u oscurece (cantidad < 0) un color hex, para armar
// degradés a partir de un único color de marca.
export function ajustarColor(hex: string, cantidad: number): string {
  const limpio = hex.replace("#", "");
  const num = parseInt(limpio, 16);
  if (Number.isNaN(num)) return hex;
  const ajustar = (canal: number) => Math.max(0, Math.min(255, Math.round(canal + 255 * cantidad)));
  const r = ajustar((num >> 16) & 0xff);
  const g = ajustar((num >> 8) & 0xff);
  const b = ajustar(num & 0xff);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
