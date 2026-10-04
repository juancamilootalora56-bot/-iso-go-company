"use client";

import { useParams } from "next/navigation";
import GestionSection from "@/components/dashboard/GestionSection";

export default function GestionOperativaPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <GestionSection
      locale={locale}
      titulo="Gestión Operativa"
      descripcion="Procesos, indicadores y mejora continua de tu operación."
      subsecciones={[
        { icon: "🔄", titulo: "Mapa de procesos", descripcion: "Procesos clave de tu operación diaria." },
        { icon: "📐", titulo: "Indicadores de proceso", descripcion: "KPIs de desempeño operativo." },
        { icon: "⚠️", titulo: "No conformidades", descripcion: "Registro y tratamiento de no conformidades." },
        { icon: "🚀", titulo: "Mejora continua", descripcion: "Acciones de mejora y su seguimiento." },
      ]}
    />
  );
}
