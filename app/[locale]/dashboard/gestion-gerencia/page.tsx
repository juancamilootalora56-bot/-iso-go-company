"use client";

import { useParams } from "next/navigation";
import GestionSection from "@/components/dashboard/GestionSection";

export default function GestionGerenciaPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <GestionSection
      locale={locale}
      titulo="Gestión de la Gerencia"
      descripcion="Dirección estratégica, política de calidad y seguimiento de tu sistema de gestión."
      subsecciones={[
        { icon: "🎯", titulo: "Política y objetivos de calidad", descripcion: "Definí y seguí los objetivos estratégicos de tu sistema de gestión." },
        { icon: "🗂️", titulo: "Organigrama y roles", descripcion: "Estructura organizacional y responsabilidades del sistema de gestión." },
        { icon: "📅", titulo: "Revisión por la dirección", descripcion: "Registro de las reuniones periódicas de revisión gerencial." },
        { icon: "📊", titulo: "Indicadores estratégicos", descripcion: "Panel de indicadores clave para la toma de decisiones." },
      ]}
    />
  );
}
