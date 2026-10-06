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
        { icon: "🔄", imagen: "/gestion-operativa/mapa_procesos.jpg", titulo: "Mapa de procesos", descripcion: "Procesos clave de tu operación diaria." },
        { icon: "📐", imagen: "/gestion-operativa/indicadores_proceso.jpg", titulo: "Indicadores de proceso", descripcion: "KPIs de desempeño operativo." },
        { icon: "⚠️", imagen: "/gestion-operativa/no_conformidades.jpg", titulo: "No conformidades", descripcion: "Registro y tratamiento de no conformidades." },
        { icon: "🚀", imagen: "/gestion-operativa/mejora_continua.jpg", titulo: "Mejora continua", descripcion: "Acciones de mejora y su seguimiento." },
      ]}
    />
  );
}
