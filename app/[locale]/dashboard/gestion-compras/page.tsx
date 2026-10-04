"use client";

import { useParams } from "next/navigation";
import GestionSection from "@/components/dashboard/GestionSection";

export default function GestionComprasPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <GestionSection
      locale={locale}
      titulo="Gestión de Compras"
      descripcion="Proveedores, evaluaciones y control de tus adquisiciones."
      subsecciones={[
        { icon: "🏭", titulo: "Proveedores", descripcion: "Listado y datos de contacto de tus proveedores." },
        { icon: "✅", titulo: "Evaluación de proveedores", descripcion: "Criterios de selección y desempeño de cada proveedor." },
        { icon: "🧾", titulo: "Órdenes de compra", descripcion: "Registro y seguimiento de las compras realizadas." },
        { icon: "📦", titulo: "Control de recepción", descripcion: "Verificación de productos y servicios recibidos." },
      ]}
    />
  );
}
