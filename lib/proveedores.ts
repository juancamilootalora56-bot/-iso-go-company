export type Proveedor = {
  id: string;
  logo: string | null; // data URL (base64)

  // Datos de la empresa
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  rubro: string;
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
  plazoEntrega: string;
  montoMinimo: string;

  // Datos bancarios
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  titularCuenta: string;

  // Estado
  estado: string;
  fechaRegistro: string;
  observaciones: string;
};

export const RUBROS_PROVEEDOR = [
  "Materias primas",
  "Insumos y materiales",
  "Equipos y maquinaria",
  "Tecnología / Software",
  "Logística y transporte",
  "Servicios profesionales",
  "Mantenimiento",
  "Construcción",
  "Alimentos y bebidas",
  "Otro",
];

export const FORMAS_PAGO = [
  "Contado",
  "Crédito 15 días",
  "Crédito 30 días",
  "Crédito 60 días",
  "Crédito 90 días",
  "Otro",
];

export const MONEDAS = ["Guaraníes (PYG)", "Dólares (USD)", "Otro"];

export const TIPOS_CUENTA = ["Cuenta corriente", "Caja de ahorro"];

export const ESTADOS_PROVEEDOR = ["Activo", "Inactivo", "En evaluación"];

export function colorEstadoProveedor(estado: string) {
  switch (estado) {
    case "Activo":
      return "#22C55E";
    case "En evaluación":
      return "#F5A623";
    case "Inactivo":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function proveedorVacio(): Proveedor {
  return {
    id: crypto.randomUUID(),
    logo: null,
    razonSocial: "",
    nombreComercial: "",
    ruc: "",
    rubro: "",
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
    plazoEntrega: "",
    montoMinimo: "",
    banco: "",
    tipoCuenta: "",
    numeroCuenta: "",
    titularCuenta: "",
    estado: "En evaluación",
    fechaRegistro: new Date().toISOString().slice(0, 10),
    observaciones: "",
  };
}

export function parseProveedores(contenido: string): Proveedor[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
