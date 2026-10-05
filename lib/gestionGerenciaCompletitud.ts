import { FODA_CATEGORIAS, itemKeyFoda } from "@/lib/fodaItems";
import { parseSeleccion } from "@/lib/partesInteresadasItems";
import { parseProductos } from "@/lib/productosEstrella";
import { parseLista as parseListaProcesos } from "@/lib/mapaProcesos";
import { parseValores } from "@/lib/valoresEstructura";
import { parseObjetivos } from "@/lib/objetivosCalidad";
import { parseNodos } from "@/lib/estructuraOrganizacional";

export function estaCompletoActividad(itemKey: string, docs: Record<string, string>) {
  if (itemKey === "foda") {
    return FODA_CATEGORIAS.some((c) => (docs[itemKeyFoda(c.key)] ?? "").trim().length > 0);
  }
  if (itemKey === "matriz_cliente_partes_interesadas") {
    const seleccion = parseSeleccion(docs["matriz_cliente_partes_interesadas_seleccion"] ?? "");
    return Object.values(seleccion).some((arr) => arr.length > 0);
  }
  if (itemKey === "matriz_productos_estrella") {
    return parseProductos(docs[itemKey] ?? "").length > 0;
  }
  if (itemKey === "mapa_procesos") {
    return parseListaProcesos(docs["mapa_procesos_seleccion"] ?? "").length > 0;
  }
  if (itemKey === "matriz_gestion_riesgos") {
    return Object.keys(docs).some(
      (k) => k.startsWith("riesgos_matriz_") && docs[k] && docs[k] !== "[]"
    );
  }
  if (itemKey === "valores_organizacionales") {
    return parseValores(docs["valores_lista"] ?? "").some((v) => v.nombre.trim().length > 0);
  }
  if (itemKey === "objetivos_calidad") {
    return parseObjetivos(docs[itemKey] ?? "").length > 0;
  }
  if (itemKey === "estructura_organizacional") {
    return parseNodos(docs[itemKey] ?? "").length > 0;
  }
  return (docs[itemKey] ?? "").trim().length > 0;
}

export function contarRiesgos(docs: Record<string, string>) {
  let total = 0;
  Object.keys(docs).forEach((k) => {
    if (!k.startsWith("riesgos_matriz_")) return;
    try {
      const parsed = JSON.parse(docs[k] || "[]");
      if (Array.isArray(parsed)) total += parsed.length;
    } catch {
      // ignore
    }
  });
  return total;
}
