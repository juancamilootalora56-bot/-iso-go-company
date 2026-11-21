// Sedes de la empresa (tabla sedes_empresa) — cada una con su coordenada
// capturada una sola vez ("usar mi ubicación actual" parado en el lugar) y
// un radio permitido, usados por Control de Asistencia para validar que la
// marcación de entrada/salida se haga físicamente en la sede.

export type Sede = {
  id: string;
  profile_id: string;
  nombre: string;
  direccion: string | null;
  latitud: number;
  longitud: number;
  radio_metros: number;
  created_at: string;
};

export const RADIO_METROS_DEFECTO = 150;

// Distancia en metros entre dos coordenadas (fórmula de Haversine).
export function distanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
