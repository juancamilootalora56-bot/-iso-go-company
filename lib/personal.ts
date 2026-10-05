export type Empleado = {
  id: string;
  foto: string | null; // data URL (base64)

  // Datos personales
  nombre: string;
  apellido: string;
  identificacion: string;
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  nacionalidad: string;
  direccion: string;
  telefono: string;
  email: string;

  // Contacto de emergencia
  contactoEmergenciaNombre: string;
  contactoEmergenciaParentesco: string;
  contactoEmergenciaTelefono: string;

  // Datos laborales
  cargo: string;
  area: string;
  fechaIngreso: string;
  tipoContrato: string;
  jornada: string;
  salario: string;
  jefeDirecto: string;

  // Formación
  nivelEducativo: string;
  profesion: string;

  observaciones: string;
};

export const GENEROS = ["Femenino", "Masculino", "Otro", "Prefiero no decir"];
export const ESTADOS_CIVILES = ["Soltero/a", "Casado/a", "Unión libre", "Divorciado/a", "Viudo/a"];
export const TIPOS_CONTRATO = ["Indefinido", "Plazo fijo", "Por obra o servicio", "Pasantía", "Temporal"];
export const JORNADAS = ["Tiempo completo", "Medio tiempo", "Por horas", "Turnos rotativos"];
export const NIVELES_EDUCATIVOS = [
  "Secundaria",
  "Técnico",
  "Universitario en curso",
  "Universitario completo",
  "Posgrado",
];

export function empleadoVacio(): Empleado {
  return {
    id: crypto.randomUUID(),
    foto: null,
    nombre: "",
    apellido: "",
    identificacion: "",
    fechaNacimiento: "",
    genero: "",
    estadoCivil: "",
    nacionalidad: "",
    direccion: "",
    telefono: "",
    email: "",
    contactoEmergenciaNombre: "",
    contactoEmergenciaParentesco: "",
    contactoEmergenciaTelefono: "",
    cargo: "",
    area: "",
    fechaIngreso: "",
    tipoContrato: "",
    jornada: "",
    salario: "",
    jefeDirecto: "",
    nivelEducativo: "",
    profesion: "",
    observaciones: "",
  };
}

export function parsePersonal(contenido: string): Empleado[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
