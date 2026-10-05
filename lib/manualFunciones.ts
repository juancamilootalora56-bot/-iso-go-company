export type ItemLista = { id: string; texto: string };

export type ManualFunciones = {
  codigo: string;
  version: string;
  fechaElaboracion: string;
  nivelCargo: string;
  cargoSuperior: string;
  cargosQueSupervisa: string;

  objetivoCargo: string;

  funcionesPrincipales: ItemLista[];
  funcionesSecundarias: ItemLista[];

  relacionesInternas: string;
  relacionesExternas: string;

  formacionRequerida: string;
  experienciaRequerida: string;
  competenciasTecnicas: string;
  competenciasBlandas: string;

  indicadoresDesempeno: ItemLista[];
  autoridadDecision: string;
  recursosACargo: string;

  elaboradoPor: string;
  revisadoPor: string;
  aprobadoPor: string;
};

export const NIVELES_CARGO = ["Directivo", "Coordinación / Jefatura", "Profesional / Técnico", "Operativo / Auxiliar"];

export function itemVacio(): ItemLista {
  return { id: crypto.randomUUID(), texto: "" };
}

export function manualVacio(): ManualFunciones {
  return {
    codigo: "",
    version: "01",
    fechaElaboracion: "",
    nivelCargo: "",
    cargoSuperior: "",
    cargosQueSupervisa: "",
    objetivoCargo: "",
    funcionesPrincipales: [itemVacio(), itemVacio(), itemVacio()],
    funcionesSecundarias: [itemVacio()],
    relacionesInternas: "",
    relacionesExternas: "",
    formacionRequerida: "",
    experienciaRequerida: "",
    competenciasTecnicas: "",
    competenciasBlandas: "",
    indicadoresDesempeno: [itemVacio()],
    autoridadDecision: "",
    recursosACargo: "",
    elaboradoPor: "",
    revisadoPor: "",
    aprobadoPor: "",
  };
}

export function parseManual(contenido: string): ManualFunciones {
  const base = manualVacio();
  if (!contenido) return base;
  try {
    const parsed = JSON.parse(contenido);
    return {
      ...base,
      ...parsed,
      funcionesPrincipales: Array.isArray(parsed.funcionesPrincipales) && parsed.funcionesPrincipales.length > 0 ? parsed.funcionesPrincipales : base.funcionesPrincipales,
      funcionesSecundarias: Array.isArray(parsed.funcionesSecundarias) && parsed.funcionesSecundarias.length > 0 ? parsed.funcionesSecundarias : base.funcionesSecundarias,
      indicadoresDesempeno: Array.isArray(parsed.indicadoresDesempeno) && parsed.indicadoresDesempeno.length > 0 ? parsed.indicadoresDesempeno : base.indicadoresDesempeno,
    };
  } catch {
    return base;
  }
}

export function manualCompleto(m: ManualFunciones): boolean {
  return (
    m.objetivoCargo.trim().length > 0 ||
    m.funcionesPrincipales.some((f) => f.texto.trim().length > 0)
  );
}
