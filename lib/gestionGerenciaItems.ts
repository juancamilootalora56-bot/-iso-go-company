export type ItemGestion = {
  key: string;
  titulo: string;
  icono: string;
  imagen?: string;
  descripcion: string;
  placeholder: string;
};

export const ITEMS_GERENCIA: ItemGestion[] = [
  {
    key: "compromiso_direccion",
    titulo: "Compromiso por la Dirección",
    icono: "✍️",
    imagen: "/gestion-gerencia/compromiso-direccion.jpg",
    descripcion: "Declaración del compromiso de la alta dirección con el sistema de gestión.",
    placeholder: "Ej: La Dirección de [empresa] se compromete a liderar, promover y asegurar los recursos necesarios para la implementación y mejora continua del sistema de gestión...",
  },
  {
    key: "foda",
    titulo: "FODA",
    icono: "🧭",
    imagen: "/gestion-gerencia/foda.jpg",
    descripcion: "Fortalezas, Oportunidades, Debilidades y Amenazas de la organización.",
    placeholder: "Fortalezas:\n- ...\n\nOportunidades:\n- ...\n\nDebilidades:\n- ...\n\nAmenazas:\n- ...",
  },
  {
    key: "matriz_cliente_partes_interesadas",
    titulo: "Matriz del Cliente y Partes Interesadas",
    icono: "🧑‍🤝‍🧑",
    imagen: "/gestion-gerencia/matriz_cliente_partes_interesadas.jpg",
    descripcion: "Identificación de clientes y partes interesadas, sus necesidades y expectativas.",
    placeholder: "Parte interesada | Necesidad / expectativa | Cómo la atendemos\nClientes | ... | ...\nColaboradores | ... | ...\nProveedores | ... | ...",
  },
  {
    key: "matriz_productos_estrella",
    titulo: "Matriz de Productos Estrella",
    icono: "⭐",
    imagen: "/gestion-gerencia/matriz_productos_estrella.jpg",
    descripcion: "Productos o servicios clave de la organización y su relevancia estratégica.",
    placeholder: "Producto / servicio | Participación | Importancia estratégica\n...",
  },
  {
    key: "mapa_procesos",
    titulo: "Mapa de Procesos",
    icono: "🗺️",
    imagen: "/gestion-gerencia/mapa_procesos.jpg",
    descripcion: "Procesos estratégicos, operativos y de apoyo de la organización.",
    placeholder: "Procesos estratégicos: ...\nProcesos operativos: ...\nProcesos de apoyo: ...",
  },
  {
    key: "matriz_gestion_riesgos",
    titulo: "Matriz de la Gestión de Riesgos",
    icono: "⚠️",
    imagen: "/gestion-gerencia/matriz_gestion_riesgos.jpg",
    descripcion: "Riesgos y oportunidades identificados, su valoración y tratamiento.",
    placeholder: "Riesgo / oportunidad | Probabilidad | Impacto | Acción de tratamiento\n...",
  },
  {
    key: "mision",
    titulo: "Misión",
    icono: "🎯",
    imagen: "/gestion-gerencia/mision.jpg",
    descripcion: "Razón de ser de la organización.",
    placeholder: "Ej: Somos una empresa dedicada a... que busca...",
  },
  {
    key: "vision",
    titulo: "Visión",
    icono: "🔭",
    imagen: "/gestion-gerencia/vision.jpg",
    descripcion: "Hacia dónde se proyecta la organización a futuro.",
    placeholder: "Ej: Ser reconocidos en [año] como...",
  },
  {
    key: "valores_organizacionales",
    titulo: "Valores Organizacionales",
    icono: "💎",
    imagen: "/gestion-gerencia/valores_organizacionales.jpg",
    descripcion: "Principios que guían el comportamiento de la organización.",
    placeholder: "Ej:\n- Integridad\n- Compromiso\n- Mejora continua\n- ...",
  },
  {
    key: "politica_calidad",
    titulo: "Política de Calidad",
    icono: "📜",
    imagen: "/gestion-gerencia/politica_calidad.jpg",
    descripcion: "Declaración formal del compromiso de la organización con la calidad.",
    placeholder: "Ej: [Empresa] se compromete a satisfacer los requisitos de sus clientes y partes interesadas, cumpliendo con la normativa aplicable y promoviendo la mejora continua de su sistema de gestión...",
  },
  {
    key: "alcance_sistema",
    titulo: "Alcance del Sistema",
    icono: "📐",
    imagen: "/gestion-gerencia/alcance_sistema.jpg",
    descripcion: "Límites y aplicabilidad del sistema de gestión.",
    placeholder: "Ej: El presente sistema de gestión aplica a los procesos de [...] de [empresa], ubicados en [...], y cubre las actividades de [...].",
  },
  {
    key: "objetivos_calidad",
    titulo: "Objetivos de Calidad",
    icono: "📊",
    imagen: "/gestion-gerencia/objetivos_calidad.jpg",
    descripcion: "Objetivos medibles derivados de la política de calidad.",
    placeholder: "Objetivo | Meta | Indicador | Responsable\n...",
  },
  {
    key: "estructura_organizacional",
    titulo: "Estructura Organizacional",
    icono: "🏢",
    imagen: "/gestion-gerencia/estructura_organizacional.jpg",
    descripcion: "Organigrama y responsabilidades dentro del sistema de gestión.",
    placeholder: "Ej: Gerencia General > Gerencia de Calidad > Responsables de proceso...",
  },
];
