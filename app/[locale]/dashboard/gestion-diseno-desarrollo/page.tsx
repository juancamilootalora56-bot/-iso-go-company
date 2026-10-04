"use client";

import { useParams } from "next/navigation";
import GestionSection from "@/components/dashboard/GestionSection";

export default function GestionDisenoDesarrolloPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <GestionSection
      locale={locale}
      titulo="Gestión de Diseño y Desarrollo"
      descripcion="Proyectos, especificaciones y control de cambios de tus productos o servicios."
      subsecciones={[
        { icon: "🧪", titulo: "Proyectos de diseño", descripcion: "Proyectos activos de diseño y desarrollo." },
        { icon: "📋", titulo: "Especificaciones técnicas", descripcion: "Requisitos y especificaciones de cada proyecto." },
        { icon: "🔍", titulo: "Validación y verificación", descripcion: "Resultados de pruebas y validaciones." },
        { icon: "🔧", titulo: "Control de cambios", descripcion: "Historial de cambios de diseño y sus aprobaciones." },
      ]}
    />
  );
}
