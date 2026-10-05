export type TemaPanelKey = "oscuro" | "azul" | "blanco" | "verde";

export type TemaPanel = {
  label: string;
  swatch: string;
  isLight: boolean;
  bgFrom: string;
  bgTo: string;
  gridColor: string;
  textPrimary: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
};

export const TEMAS_PANEL: Record<TemaPanelKey, TemaPanel> = {
  oscuro: {
    label: "Oscuro (actual)",
    swatch: "#1A1A1A",
    isLight: false,
    bgFrom: "#1A1A1A",
    bgTo: "#2A2A2A",
    gridColor: "#ffffff",
    textPrimary: "#FFFFFF",
    textMuted: "#9CA3AF",
    cardBg: "rgba(255,255,255,0.05)",
    cardBorder: "rgba(255,255,255,0.1)",
  },
  azul: {
    label: "Azul",
    swatch: "#123A6B",
    isLight: false,
    bgFrom: "#0B2745",
    bgTo: "#15406F",
    gridColor: "#ffffff",
    textPrimary: "#FFFFFF",
    textMuted: "#9FB4CC",
    cardBg: "rgba(255,255,255,0.07)",
    cardBorder: "rgba(255,255,255,0.12)",
  },
  blanco: {
    label: "Blanco",
    swatch: "#FFFFFF",
    isLight: true,
    bgFrom: "#FFFFFF",
    bgTo: "#F3F3F3",
    gridColor: "#000000",
    textPrimary: "#1A1A1A",
    textMuted: "#6B7280",
    cardBg: "#FAFAFA",
    cardBorder: "#E5E7EB",
  },
  verde: {
    label: "Verde corporativo",
    swatch: "#0F3B28",
    isLight: false,
    bgFrom: "#0B2B1D",
    bgTo: "#15442E",
    gridColor: "#ffffff",
    textPrimary: "#FFFFFF",
    textMuted: "#9FC2AE",
    cardBg: "rgba(255,255,255,0.06)",
    cardBorder: "rgba(255,255,255,0.1)",
  },
};

export function temaPanelDe(key?: string | null): TemaPanel {
  return TEMAS_PANEL[(key as TemaPanelKey) ?? "oscuro"] ?? TEMAS_PANEL.oscuro;
}
