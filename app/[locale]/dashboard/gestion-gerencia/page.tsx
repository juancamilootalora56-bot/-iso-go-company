"use client";

import GestionDocumentos, { type ItemGestion } from "@/components/dashboard/GestionDocumentos";

const ITEMS: ItemGestion[] = [
  {
    key: "compromiso_direccion",
    titulo: "Compromiso por la Dirección",
    icono: "✍️",
    descripcion: "Declaración del compromiso de la alta dirección con el sistema de gestión.",
    placeholder: "Ej: La Dirección de [empresa] se compromete a liderar, promover y asegurar los recursos necesarios para la implementación y mejora continua del sistema de gestión...",
  },
  {
    key: "foda",
    titulo: "FODA",
    icono: "🧭",
    descripcion: "Fortalezas, Oportunidades, Debilidades y Amenazas de la organización.",
    placeholder: "Fortalezas:\n- ...\n\nOportunidades:\n- ...\n\nDebilidades:\n- ...\n\nAmenazas:\n- ...",
  },
  {
    key: "matriz_cliente_partes_interesadas",
    titulo: "Matriz del Cliente y Partes Interesadas",
    icono: "🧑‍🤝‍🧑",
    descripcion: "Identificación de clientes y partes interesadas, sus necesidades y expectativas.",
    placeholder: "Parte interesada | Necesidad / expectativa | Cómo la atendemos\nClientes | ... | ...\nColaboradores | ... | ...\nProveedores | ... | ...",
  },
  {
    key: "matriz_productos_estrella",
    titulo: "Matriz de Productos Estrella",
    icono: "⭐",
    descripcion: "Productos o servicios clave de la organización y su relevancia estratégica.",
    placeholder: "Producto / servicio | Participación | Importancia estratégica\n...",
  },
  {
    key: "matriz_gestion_riesgos",
    titulo: "Matriz de la Gestión de Riesgos",
    icono: "⚠️",
    descripcion: "Riesgos y oportunidades identificados, su valoración y tratamiento.",
    placeholder: "Riesgo / oportunidad | Probabilidad | Impacto | Acción de tratamiento\n...",
  },
  {
    key: "mapa_procesos",
    titulo: "Mapa de Procesos",
    icono: "🗺️",
    descripcion: "Procesos estratégicos, operativos y de apoyo de la organización.",
    placeholder: "Procesos estratégicos: ...\nProcesos operativos: ...\nProcesos de apoyo: ...",
  },
  {
    key: "mision",
    titulo: "Misión",
    icono: "🎯",
    descripcion: "Razón de ser de la organización.",
    placeholder: "Ej: Somos una empresa dedicada a... que busca...",
  },
  {
    key: "vision",
    titulo: "Visión",
    icono: "🔭",
    descripcion: "Hacia dónde se proyecta la organización a futuro.",
    placeholder: "Ej: Ser reconocidos en [año] como...",
  },
  {
    key: "valores_organizacionales",
    titulo: "Valores Organizacionales",
    icono: "💎",
    descripcion: "Principios que guían el comportamiento de la organización.",
    placeholder: "Ej:\n- Integridad\n- Compromiso\n- Mejora continua\n- ...",
  },
  {
    key: "politica_calidad",
    titulo: "Política de Calidad",
    icono: "📜",
    descripcion: "Declaración formal del compromiso de la organización con la calidad.",
    placeholder: "Ej: [Empresa] se compromete a satisfacer los requisitos de sus clientes y partes interesadas, cumpliendo con la normativa aplicable y promoviendo la mejora continua de su sistema de gestión...",
  },
  {
    key: "alcance_sistema",
    titulo: "Alcance del Sistema",
    icono: "📐",
    descripcion: "Límites y aplicabilidad del sistema de gestión.",
    placeholder: "Ej: El presente sistema de gestión aplica a los procesos de [...] de [empresa], ubicados en [...], y cubre las actividades de [...].",
  },
  {
    key: "objetivos_calidad",
    titulo: "Objetivos de Calidad",
    icono: "📊",
    descripcion: "Objetivos medibles derivados de la política de calidad.",
    placeholder: "Objetivo | Meta | Indicador | Responsable\n...",
  },
  {
    key: "estructura_organizacional",
    titulo: "Estructura Organizacional",
    icono: "🏢",
    descripcion: "Organigrama y responsabilidades dentro del sistema de gestión.",
    placeholder: "Ej: Gerencia General > Gerencia de Calidad > Responsables de proceso...",
  },
];

export default function GestionGerenciaPage() {
  return (
    <GestionDocumentos
      modulo="gerencia"
      titulo="Gestión de la Gerencia"
      descripcion="Completá cada actividad del direccionamiento estratégico de tu sistema de gestión."
      items={ITEMS}
    />
  );
}
