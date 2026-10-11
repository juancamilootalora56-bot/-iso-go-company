export type Cliente = {
  id: string;
  logo: string | null; // data URL (base64)

  // Datos de la empresa
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  sector: string;
  direccion: string;
  ciudad: string;
  pais: string;
  telefono: string;
  email: string;
  sitioWeb: string;

  // Persona de contacto
  contactoNombre: string;
  contactoCargo: string;
  contactoTelefono: string;
  contactoEmail: string;

  // Condiciones comerciales
  formaPago: string;
  moneda: string;
  limiteCredito: string;
  descuentoHabitual: string;

  // Estado
  estado: string;
  fechaRegistro: string;
  observaciones: string;
};

export const SECTORES_CLIENTE = [
  "Construcción",
  "Retail / Comercio",
  "Industria / Manufactura",
  "Servicios profesionales",
  "Tecnología",
  "Salud",
  "Educación",
  "Alimentos y bebidas",
  "Gobierno / Sector público",
  "Otro",
];

export const FORMAS_PAGO_CLIENTE = [
  "Contado",
  "Crédito 15 días",
  "Crédito 30 días",
  "Crédito 60 días",
  "Crédito 90 días",
  "Otro",
];

export const MONEDAS_CLIENTE = ["Guaraníes (PYG)", "Dólares (USD)", "Otro"];

export const ESTADOS_CLIENTE = ["Activo", "Inactivo", "Prospecto"];

export function colorEstadoCliente(estado: string) {
  switch (estado) {
    case "Activo":
      return "#22C55E";
    case "Prospecto":
      return "#F5A623";
    case "Inactivo":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function clienteVacio(): Cliente {
  return {
    id: crypto.randomUUID(),
    logo: null,
    razonSocial: "",
    nombreComercial: "",
    ruc: "",
    sector: "",
    direccion: "",
    ciudad: "",
    pais: "Paraguay",
    telefono: "",
    email: "",
    sitioWeb: "",
    contactoNombre: "",
    contactoCargo: "",
    contactoTelefono: "",
    contactoEmail: "",
    formaPago: "",
    moneda: "",
    limiteCredito: "",
    descuentoHabitual: "",
    estado: "Prospecto",
    fechaRegistro: new Date().toISOString().slice(0, 10),
    observaciones: "",
  };
}

export function parseClientes(contenido: string): Cliente[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
