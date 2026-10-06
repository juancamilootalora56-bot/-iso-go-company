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
        { icon: "🧪", imagen: "/gestion-diseno-desarrollo/proyectos_diseno.jpg", titulo: "Proyectos de diseño", descripcion: "Proyectos activos de diseño y desarrollo." },
        { icon: "📋", imagen: "/gestion-diseno-desarrollo/especificaciones_tecnicas.jpg", titulo: "Especificaciones técnicas", descripcion: "Requisitos y especificaciones de cada proyecto." },
        { icon: "🔍", imagen: "/gestion-diseno-desarrollo/validacion_verificacion.jpg", titulo: "Validación y verificación", descripcion: "Resultados de pruebas y validaciones." },
        { icon: "🔧", imagen: "/gestion-diseno-desarrollo/control_cambios.jpg", titulo: "Control de cambios", descripcion: "Historial de cambios de diseño y sus aprobaciones." },
      ]}
    />
  );
}
