"use client";

import { useParams } from "next/navigation";
import GestionSection from "@/components/dashboard/GestionSection";

export default function GestionTalentoHumanoPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <GestionSection
      locale={locale}
      titulo="Gestión del Talento Humano"
      descripcion="Perfiles de cargo, capacitaciones y desarrollo de tu equipo."
      subsecciones={[
        { icon: "🪪", titulo: "Perfiles de cargo", descripcion: "Funciones, requisitos y competencias de cada puesto." },
        { icon: "🎓", titulo: "Capacitaciones", descripcion: "Plan y registro de capacitaciones del personal." },
        { icon: "📝", titulo: "Evaluación de desempeño", descripcion: "Seguimiento periódico del desempeño de cada colaborador." },
        { icon: "🚪", titulo: "Inducción de personal", descripcion: "Proceso de incorporación de nuevos integrantes." },
      ]}
    />
  );
}
