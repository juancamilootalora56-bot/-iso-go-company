"use client";

import { useParams } from "next/navigation";
import GestionSection from "@/components/dashboard/GestionSection";

export default function GestionComercialPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <GestionSection
      locale={locale}
      titulo="Gestión Comercial"
      descripcion="Clientes, satisfacción y seguimiento de ventas."
      subsecciones={[
        { icon: "🤝", titulo: "Clientes", descripcion: "Base de clientes y seguimiento comercial." },
        { icon: "😊", titulo: "Satisfacción del cliente", descripcion: "Encuestas y resultados de satisfacción." },
        { icon: "📣", titulo: "Reclamos y sugerencias", descripcion: "Registro y gestión de reclamos de clientes." },
        { icon: "💹", titulo: "Seguimiento de ventas", descripcion: "Indicadores comerciales y cumplimiento de metas." },
      ]}
    />
  );
}
