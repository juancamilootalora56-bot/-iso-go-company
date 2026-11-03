// Diagnóstico de Evaluación del Sistema de Gestión de Calidad — ISO 9001:2015
//
// Cuestionario de autoevaluación (gap-analysis) con 7 cláusulas y 152 ítems.
// Cada ítem se responde en una escala fija de 4 niveles (A/B/C/D), igual
// para todos los ítems — lo que cambia es el texto de cada pregunta, no el
// puntaje máximo posible (siempre 10).

export type OpcionDiagnostico = {
  letra: "A" | "B" | "C" | "D";
  valor: 10 | 5 | 3 | 0;
  label: string;
  descripcion: string;
};

export const OPCIONES_DIAGNOSTICO: OpcionDiagnostico[] = [
  { letra: "A", valor: 10, label: "Cumple completamente", descripcion: "Se establece, se implementa y se mantiene." },
  { letra: "B", valor: 5, label: "Cumple parcialmente", descripcion: "Se establece, se implementa, no se mantiene." },
  { letra: "C", valor: 3, label: "Cumple el mínimo", descripcion: "Se establece, no se implementa, no se mantiene." },
  { letra: "D", valor: 0, label: "No cumple", descripcion: "No se establece, no se implementa, no se mantiene." },
];

export type ItemDiagnostico = { id: string; texto: string };
export type SubclausulaDiagnostico = { numeral: string; titulo: string; items: ItemDiagnostico[] };
export type ClausulaDiagnostico = { numero: string; titulo: string; subclausulas: SubclausulaDiagnostico[] };

export const CLAUSULAS_DIAGNOSTICO: ClausulaDiagnostico[] = [
  {
    numero: "4",
    titulo: "Contexto de la Organización",
    subclausulas: [
      {
        numeral: "4.1",
        titulo: "Comprensión de la organización y su contexto",
        items: [
          { id: "4.1", texto: "Se determinan las cuestiones externas e internas que son pertinentes para el propósito y dirección estratégica de la organización." },
          { id: "4.2", texto: "Se realiza el seguimiento y la revisión de la información sobre estas cuestiones externas e internas." },
        ],
      },
      {
        numeral: "4.2",
        titulo: "Comprensión de las necesidades y expectativas de las partes interesadas",
        items: [
          { id: "4.3", texto: "Se ha determinado las partes interesadas y los requisitos de estas partes interesadas para el sistema de gestión de calidad." },
          { id: "4.4", texto: "Se realiza el seguimiento y la revisión de la información sobre estas partes interesadas y sus requisitos." },
        ],
      },
      {
        numeral: "4.3",
        titulo: "Determinación del alcance del sistema de gestión de calidad",
        items: [
          { id: "4.5", texto: "El alcance del SGC se ha determinado según: procesos operativos, productos y servicios, instalaciones físicas, ubicación geográfica." },
          { id: "4.6", texto: "El alcance del SGC se ha determinado teniendo en cuenta los problemas externos e internos, las partes interesadas y sus productos y servicios." },
          { id: "4.7", texto: "Se tiene disponible y documentado el alcance del sistema de gestión." },
          { id: "4.8", texto: "Se tiene justificado y/o documentado los requisitos (exclusiones) que no son aplicables para el sistema de gestión." },
        ],
      },
      {
        numeral: "4.4",
        titulo: "Sistema de gestión de la calidad y sus procesos",
        items: [
          { id: "4.9", texto: "Se tienen identificados los procesos necesarios para el sistema de gestión de la organización." },
          { id: "4.10", texto: "Se tienen establecidos los criterios para la gestión de los procesos teniendo en cuenta las responsabilidades, procedimientos, medidas de control e indicadores de desempeño necesarios que permitan la efectiva operación y control de los mismos." },
          { id: "4.11", texto: "Se mantiene y conserva información documentada que permita apoyar la operación de estos procesos." },
        ],
      },
    ],
  },
  {
    numero: "5",
    titulo: "Liderazgo",
    subclausulas: [
      {
        numeral: "5.1",
        titulo: "Liderazgo y compromiso gerencial",
        items: [
          { id: "5.1", texto: "Se demuestra responsabilidad por parte de la alta dirección para la eficacia del SGC." },
        ],
      },
      {
        numeral: "5.1.2",
        titulo: "Enfoque al cliente",
        items: [
          { id: "5.2", texto: "La gerencia garantiza que los requisitos de los clientes se determinan y se cumplen." },
          { id: "5.3", texto: "Se determinan y consideran los riesgos y oportunidades que puedan afectar a la conformidad de los productos y servicios y a la capacidad de aumentar la satisfacción del cliente." },
        ],
      },
      {
        numeral: "5.2.1",
        titulo: "Establecimiento de la política",
        items: [
          { id: "5.4", texto: "La política de calidad con la que cuenta actualmente la organización está acorde con los propósitos establecidos." },
        ],
      },
      {
        numeral: "5.2.2",
        titulo: "Comunicación de la política de calidad",
        items: [
          { id: "5.5", texto: "Se tiene disponible a las partes interesadas, se ha comunicado dentro de la organización." },
        ],
      },
      {
        numeral: "5.3",
        titulo: "Roles, responsabilidades y autoridades en la organización",
        items: [
          { id: "5.6", texto: "Se han establecido y comunicado las responsabilidades y autoridades para los roles pertinentes en toda la organización." },
        ],
      },
    ],
  },
  {
    numero: "6",
    titulo: "Planificación",
    subclausulas: [
      {
        numeral: "6.1",
        titulo: "Acciones para abordar riesgos y oportunidades",
        items: [
          { id: "6.1", texto: "Se han establecido los riesgos y oportunidades que deben ser abordados para asegurar que el SGC logre los resultados esperados." },
          { id: "6.2", texto: "La organización ha previsto las acciones necesarias para abordar estos riesgos y oportunidades y los ha integrado en los procesos del sistema." },
        ],
      },
      {
        numeral: "6.2",
        titulo: "Objetivos de la calidad y planificación para lograrlos",
        items: [
          { id: "6.3", texto: "¿Qué acciones se han planificado para el logro de los objetivos del SIG y los programas de gestión?" },
          { id: "6.4", texto: "Se mantiene información documentada sobre estos objetivos." },
        ],
      },
      {
        numeral: "6.3",
        titulo: "Planificación de los cambios",
        items: [
          { id: "6.5", texto: "¿Existe un proceso definido para determinar la necesidad de cambios en el SGC y la gestión de su implementación?" },
        ],
      },
    ],
  },
  {
    numero: "7",
    titulo: "Apoyo",
    subclausulas: [
      {
        numeral: "7.1.1",
        titulo: "Recursos — Generalidades",
        items: [
          { id: "7.1", texto: "La organización ha determinado y proporcionado los recursos necesarios para el establecimiento, implementación, mantenimiento y mejora continua del SGC (incluidos los requisitos de las personas, medioambientales y de infraestructura)." },
        ],
      },
      {
        numeral: "7.1.5.1",
        titulo: "Recursos de seguimiento y medición — Generalidades",
        items: [
          { id: "7.2", texto: "En caso de que el monitoreo o medición se utilice para pruebas de conformidad de productos y servicios a los requisitos especificados, ¿se han determinado los recursos necesarios para garantizar un seguimiento válido y fiable, así como la medición de los resultados?" },
        ],
      },
      {
        numeral: "7.1.5.2",
        titulo: "Trazabilidad de las mediciones",
        items: [
          { id: "7.3", texto: "Dispone de métodos eficaces para garantizar la trazabilidad durante el proceso operacional." },
        ],
      },
      {
        numeral: "7.1.6",
        titulo: "Conocimientos de la organización",
        items: [
          { id: "7.4", texto: "¿Ha determinado la organización los conocimientos necesarios para el funcionamiento de sus procesos y el logro de la conformidad de los productos y servicios, y ha implementado un proceso de experiencias adquiridas?" },
        ],
      },
      {
        numeral: "7.2",
        titulo: "Competencia",
        items: [
          { id: "7.5", texto: "La organización se ha asegurado de que las personas que puedan afectar al rendimiento del SGC son competentes en cuestión de una adecuada educación, formación y experiencia, y ha adoptado las medidas necesarias para asegurar que puedan adquirir la competencia necesaria." },
        ],
      },
      {
        numeral: "7.3",
        titulo: "Toma de conciencia",
        items: [
          { id: "7.6", texto: "Existe una metodología definida para la evaluación de la eficacia de las acciones formativas emprendidas." },
        ],
      },
      {
        numeral: "7.4",
        titulo: "Comunicación",
        items: [
          { id: "7.7", texto: "Se tiene definido un procedimiento para las comunicaciones internas y externas del SIG dentro de la organización." },
        ],
      },
      {
        numeral: "7.5.1",
        titulo: "Información documentada — Generalidades",
        items: [
          { id: "7.8", texto: "Se ha establecido la información documentada requerida por la norma y necesaria para la implementación y funcionamiento eficaces del SGC." },
        ],
      },
      {
        numeral: "7.5.2",
        titulo: "Creación y actualización",
        items: [
          { id: "7.9", texto: "Existe una metodología documentada adecuada para la revisión y actualización de documentos." },
        ],
      },
      {
        numeral: "7.5.3",
        titulo: "Control de la información documentada",
        items: [
          { id: "7.10", texto: "Se tiene un procedimiento para el control de la información documentada requerida por el SGC." },
        ],
      },
    ],
  },
  {
    numero: "8",
    titulo: "Operación",
    subclausulas: [
      {
        numeral: "8.1",
        titulo: "Planificación y control operacional",
        items: [
          { id: "8.1", texto: "Se planifican, implementan y controlan los procesos necesarios para cumplir los requisitos para la provisión de servicios." },
          { id: "8.2", texto: "La salida de esta planificación es adecuada para las operaciones de la organización." },
          { id: "8.3", texto: "Se asegura que los procesos contratados externamente estén controlados." },
          { id: "8.4", texto: "Se revisan las consecuencias de los cambios no previstos, tomando acciones para mitigar cualquier efecto adverso." },
        ],
      },
      {
        numeral: "8.2.1",
        titulo: "Comunicación con el cliente",
        items: [
          { id: "8.5", texto: "La comunicación con los clientes incluye información relativa a los productos y servicios." },
          { id: "8.6", texto: "Se obtiene la retroalimentación de los clientes relativa a los productos y servicios, incluyendo las quejas." },
          { id: "8.7", texto: "Se establecen los requisitos específicos para las acciones de contingencia, cuando sea pertinente." },
        ],
      },
      {
        numeral: "8.2.2",
        titulo: "Determinación de los requisitos para los productos y servicios",
        items: [
          { id: "8.8", texto: "Se determinan los requisitos legales y reglamentarios para los productos y servicios que se ofrecen y aquellos considerados necesarios para la organización." },
        ],
      },
      {
        numeral: "8.2.3",
        titulo: "Revisión de los requisitos para los productos y servicios",
        items: [
          { id: "8.9", texto: "La organización se asegura que tiene la capacidad de cumplir los requisitos de los productos y servicios ofrecidos." },
          { id: "8.10", texto: "La organización revisa los requisitos del cliente antes de comprometerse a suministrar productos y servicios a este." },
          { id: "8.11", texto: "Se confirman los requisitos del cliente antes de la aceptación por parte de estos, cuando no se ha proporcionado información documentada al respecto." },
          { id: "8.12", texto: "Se asegura que se resuelvan las diferencias existentes entre los requisitos del contrato o pedido y los expresados previamente." },
          { id: "8.13", texto: "Se conserva la información documentada sobre cualquier requisito nuevo para los servicios." },
        ],
      },
      {
        numeral: "8.2.4",
        titulo: "Cambios en los requisitos para los productos y servicios",
        items: [
          { id: "8.14", texto: "Las personas son conscientes de los cambios en los requisitos de los productos y servicios, y se modifica la información documentada pertinente a estos cambios." },
        ],
      },
      {
        numeral: "8.3.1",
        titulo: "Diseño y desarrollo — Generalidades",
        items: [
          { id: "8.15", texto: "Se establece, implementa y mantiene un proceso de diseño y desarrollo que sea adecuado para asegurar la posterior provisión de los servicios." },
        ],
      },
      {
        numeral: "8.3.2",
        titulo: "Planificación del diseño y desarrollo",
        items: [
          { id: "8.16", texto: "La organización determina todas las etapas y controles necesarios para el diseño y desarrollo de productos y servicios." },
          { id: "8.17", texto: "Al determinar los requisitos esenciales para los tipos específicos de productos y servicios a desarrollar, se consideran los requisitos funcionales y de desempeño, y los requisitos legales y reglamentarios." },
          { id: "8.18", texto: "Se resuelven las entradas del diseño y desarrollo que son contradictorias." },
          { id: "8.19", texto: "Se conserva información documentada sobre las entradas del diseño y desarrollo." },
        ],
      },
      {
        numeral: "8.3.4",
        titulo: "Controles del diseño y desarrollo",
        items: [
          { id: "8.20", texto: "Se aplican los controles al proceso de diseño y desarrollo, y se definen los resultados a lograr." },
          { id: "8.21", texto: "Se realizan las revisiones para evaluar la capacidad de los resultados del diseño y desarrollo para cumplir los requisitos." },
          { id: "8.22", texto: "Se realizan actividades de verificación para asegurar que las salidas del diseño y desarrollo cumplen los requisitos de las entradas." },
          { id: "8.23", texto: "Se aplican controles al proceso de diseño y desarrollo para asegurar que se toma cualquier acción necesaria sobre los problemas determinados durante las revisiones, o las actividades de verificación y validación." },
          { id: "8.24", texto: "Se conserva información documentada sobre las acciones tomadas." },
        ],
      },
      {
        numeral: "8.3.5",
        titulo: "Salidas del diseño y desarrollo",
        items: [
          { id: "8.25", texto: "Se asegura que las salidas del diseño y desarrollo cumplen los requisitos de las entradas." },
          { id: "8.26", texto: "Se asegura que las salidas del diseño y desarrollo son adecuadas para los procesos posteriores para la provisión de productos y servicios." },
          { id: "8.27", texto: "Se asegura que las salidas del diseño y desarrollo incluyen o hacen referencia a los requisitos de seguimiento y medición, cuando sea apropiado, y a los criterios de aceptación." },
          { id: "8.28", texto: "Se asegura que las salidas del diseño y desarrollo especifican las características de los productos y servicios que son esenciales para su propósito previsto y su provisión segura y correcta." },
          { id: "8.29", texto: "Se conserva información documentada sobre las salidas del diseño y desarrollo." },
        ],
      },
      {
        numeral: "8.3.6",
        titulo: "Cambios del diseño y desarrollo",
        items: [
          { id: "8.30", texto: "Se identifican, revisan y controlan los cambios hechos durante el diseño y desarrollo de los productos y servicios." },
          { id: "8.31", texto: "Se conserva la información documentada sobre los cambios del diseño y desarrollo, los resultados de las revisiones, la autorización de los cambios, y las acciones tomadas para prevenir los impactos adversos." },
        ],
      },
      {
        numeral: "8.4.1",
        titulo: "Control de procesos, productos y servicios suministrados externamente — Generalidades",
        items: [
          { id: "8.32", texto: "La organización asegura que los procesos, productos y servicios suministrados externamente son conformes a los requisitos." },
          { id: "8.33", texto: "Se determinan los controles a aplicar a los procesos, productos y servicios suministrados externamente." },
          { id: "8.34", texto: "Se determina y aplica criterios para la evaluación, selección, seguimiento del desempeño y la reevaluación de los proveedores externos." },
          { id: "8.35", texto: "Se conserva información documentada de estas actividades." },
        ],
      },
      {
        numeral: "8.4.2",
        titulo: "Tipo y alcance del control",
        items: [
          { id: "8.36", texto: "La organización se asegura que los procesos, productos y servicios suministrados externamente no afectan de manera adversa a la capacidad de la organización de entregar productos y servicios conformes de manera coherente a sus clientes." },
          { id: "8.37", texto: "Se definen los controles a aplicar a un proveedor externo y las salidas resultantes." },
          { id: "8.38", texto: "Considera el impacto potencial de los procesos, productos y servicios suministrados externamente en la capacidad de la organización de cumplir los requisitos del cliente y los legales y reglamentarios aplicables." },
          { id: "8.39", texto: "Se asegura que los procesos suministrados externamente permanecen dentro del control de su sistema de gestión de la calidad." },
          { id: "8.40", texto: "Se determina la verificación o actividades necesarias para asegurar que los procesos, productos y servicios cumplen con los requisitos." },
        ],
      },
      {
        numeral: "8.4.3",
        titulo: "Información para los proveedores externos",
        items: [
          { id: "8.41", texto: "La organización comunica a los proveedores externos sus requisitos para los procesos, productos y servicios." },
          { id: "8.42", texto: "Se comunica la aprobación de productos y servicios, métodos, procesos y equipos, y la liberación de productos y servicios." },
          { id: "8.43", texto: "Se comunica la competencia, incluyendo cualquier calificación requerida de las personas." },
          { id: "8.44", texto: "Se comunican las interacciones del proveedor externo con la organización." },
          { id: "8.45", texto: "Se comunica el control y seguimiento del desempeño del proveedor externo aplicado por la organización." },
        ],
      },
      {
        numeral: "8.5.1",
        titulo: "Control de la producción y de la provisión del servicio",
        items: [
          { id: "8.46", texto: "Se implementa la producción y provisión del servicio bajo condiciones controladas." },
          { id: "8.47", texto: "Dispone de información documentada que defina las características de los productos a producir, servicios a prestar, o las actividades a desempeñar." },
          { id: "8.48", texto: "Dispone de información documentada que defina los resultados a alcanzar." },
          { id: "8.49", texto: "Se controla la disponibilidad y el uso de recursos de seguimiento y medición adecuados." },
          { id: "8.50", texto: "Se controla la implementación de actividades de seguimiento y medición en las etapas apropiadas." },
          { id: "8.51", texto: "Se controla el uso de la infraestructura y el entorno adecuado para la operación de los procesos." },
          { id: "8.52", texto: "Se controla la designación de personas competentes." },
          { id: "8.53", texto: "Se controla la validación y revalidación periódica de la capacidad para alcanzar los resultados planificados." },
          { id: "8.54", texto: "Se controla la implementación de acciones para prevenir los errores humanos." },
          { id: "8.55", texto: "Se controla la implementación de actividades de liberación, entrega y posteriores a la entrega." },
        ],
      },
      {
        numeral: "8.5.2",
        titulo: "Identificación y trazabilidad",
        items: [
          { id: "8.56", texto: "La organización utiliza medios apropiados para identificar las salidas de los productos y servicios." },
          { id: "8.57", texto: "Identifica el estado de las salidas con respecto a los requisitos." },
          { id: "8.58", texto: "Se conserva información documentada para permitir la trazabilidad." },
        ],
      },
      {
        numeral: "8.5.3",
        titulo: "Propiedad perteneciente a los clientes o proveedores externos",
        items: [
          { id: "8.59", texto: "La organización cuida la propiedad de los clientes o proveedores externos mientras está bajo el control de la organización o siendo utilizada por la misma." },
          { id: "8.60", texto: "Se identifica, verifica, protege y salvaguarda la propiedad de los clientes o de los proveedores externos suministrada para su utilización o incorporación en los productos y servicios." },
          { id: "8.61", texto: "Se informa al cliente o proveedor externo cuando su propiedad se pierde, deteriora o de algún otro modo se considera inadecuada para el uso, y se conserva la información documentada sobre lo ocurrido." },
        ],
      },
      {
        numeral: "8.5.4",
        titulo: "Preservación",
        items: [
          { id: "8.62", texto: "La organización preserva las salidas en la producción y prestación del servicio, en la medida necesaria para asegurar la conformidad con los requisitos." },
        ],
      },
      {
        numeral: "8.5.5",
        titulo: "Actividades posteriores a la entrega",
        items: [
          { id: "8.63", texto: "Se cumplen los requisitos para las actividades posteriores a la entrega asociadas con los productos y servicios." },
          { id: "8.64", texto: "Al determinar el alcance de las actividades posteriores a la entrega, la organización consideró los requisitos legales y reglamentarios." },
          { id: "8.65", texto: "Se consideran las consecuencias potenciales no deseadas asociadas a sus productos y servicios." },
          { id: "8.66", texto: "Se considera la naturaleza, el uso y la vida útil prevista de sus productos y servicios." },
          { id: "8.67", texto: "Considera los requisitos del cliente." },
          { id: "8.68", texto: "Considera la retroalimentación del cliente." },
        ],
      },
      {
        numeral: "8.5.6",
        titulo: "Control de cambios",
        items: [
          { id: "8.69", texto: "La organización revisa y controla los cambios en la producción o la prestación del servicio para asegurar la conformidad con los requisitos." },
          { id: "8.70", texto: "Se conserva información documentada que describa la revisión de los cambios, las personas que autorizan, o cualquier acción que surja de la revisión." },
        ],
      },
      {
        numeral: "8.6",
        titulo: "Liberación de los productos y servicios",
        items: [
          { id: "8.71", texto: "La organización implementa las disposiciones planificadas para verificar que se cumplen los requisitos de los productos y servicios." },
          { id: "8.72", texto: "Se conserva la información documentada sobre la liberación de los productos y servicios." },
          { id: "8.73", texto: "Existe evidencia de la conformidad con los criterios de aceptación." },
          { id: "8.74", texto: "Existe trazabilidad a las personas que autorizan la liberación." },
        ],
      },
      {
        numeral: "8.7",
        titulo: "Control de las salidas no conformes",
        items: [
          { id: "8.75", texto: "La organización se asegura que las salidas no conformes con sus requisitos se identifican y se controlan para prevenir su uso o entrega." },
          { id: "8.76", texto: "La organización toma las acciones adecuadas de acuerdo a la naturaleza de la no conformidad y su efecto sobre la conformidad de los productos y servicios." },
          { id: "8.77", texto: "Se verifica la conformidad con los requisitos cuando se corrigen las salidas no conformes." },
          { id: "8.78", texto: "La organización trata las salidas no conformes de una o más maneras." },
          { id: "8.79", texto: "La organización conserva información documentada que describa la no conformidad, las acciones tomadas, las concesiones obtenidas, e identifique la autoridad que decide la acción con respecto a la no conformidad." },
        ],
      },
    ],
  },
  {
    numero: "9",
    titulo: "Evaluación del Desempeño",
    subclausulas: [
      {
        numeral: "9.1.1",
        titulo: "Seguimiento, medición, análisis y evaluación — Generalidades",
        items: [
          { id: "9.1", texto: "La organización determina qué necesita seguimiento y medición." },
          { id: "9.2", texto: "Determina los métodos de seguimiento, medición, análisis y evaluación para asegurar resultados válidos." },
          { id: "9.3", texto: "Determina cuándo se lleva a cabo el seguimiento y la medición." },
          { id: "9.4", texto: "Determina cuándo analizar y evaluar los resultados del seguimiento y medición." },
          { id: "9.5", texto: "Evalúa el desempeño y la eficacia del SGC." },
          { id: "9.6", texto: "Conserva información documentada como evidencia de los resultados." },
        ],
      },
      {
        numeral: "9.1.2",
        titulo: "Satisfacción del cliente",
        items: [
          { id: "9.7", texto: "La organización realiza seguimiento de las percepciones de los clientes del grado en que se cumplen sus necesidades y expectativas." },
          { id: "9.8", texto: "Determina los métodos para obtener, realizar el seguimiento y revisar la información." },
        ],
      },
      {
        numeral: "9.1.3",
        titulo: "Análisis y evaluación",
        items: [
          { id: "9.9", texto: "La organización analiza y evalúa los datos y la información que surgen del seguimiento y la medición." },
        ],
      },
      {
        numeral: "9.2",
        titulo: "Auditoría interna",
        items: [
          { id: "9.10", texto: "La organización lleva a cabo auditorías internas a intervalos planificados." },
          { id: "9.11", texto: "Las auditorías proporcionan información sobre el SGC conforme con los requisitos propios de la organización y los requisitos ISO 9001:2015." },
          { id: "9.12", texto: "La organización planifica, establece, implementa y mantiene uno o varios programas de auditoría." },
          { id: "9.13", texto: "Define los criterios de auditoría y el alcance para cada una." },
          { id: "9.14", texto: "Selecciona los auditores y lleva a cabo auditorías para asegurar la objetividad y la imparcialidad del proceso." },
          { id: "9.15", texto: "Asegura que los resultados de las auditorías se informan a la dirección." },
          { id: "9.16", texto: "Realiza las correcciones y toma las acciones correctivas adecuadas." },
          { id: "9.17", texto: "Conserva información documentada como evidencia de la implementación del programa de auditoría y los resultados." },
        ],
      },
      {
        numeral: "9.3.1",
        titulo: "Revisión por la dirección — Generalidades",
        items: [
          { id: "9.18", texto: "La alta dirección revisa el SGC a intervalos planificados, para asegurar su conveniencia, adecuación, eficacia y alineación continua con la estrategia de la organización." },
        ],
      },
      {
        numeral: "9.3.2",
        titulo: "Entradas de la revisión por la dirección",
        items: [
          { id: "9.19", texto: "La alta dirección planifica y lleva a cabo la revisión incluyendo consideraciones sobre el estado de las acciones de las revisiones previas." },
          { id: "9.20", texto: "Considera los cambios en las cuestiones externas e internas que sean pertinentes al SGC." },
          { id: "9.21", texto: "Considera la información sobre el desempeño y la eficiencia del SGC." },
          { id: "9.22", texto: "Considera los resultados de las auditorías." },
          { id: "9.23", texto: "Considera el desempeño de los proveedores externos." },
          { id: "9.24", texto: "Considera la adecuación de los recursos." },
          { id: "9.25", texto: "Considera la eficiencia de las acciones tomadas para abordar los riesgos y las oportunidades." },
          { id: "9.26", texto: "Se consideran las oportunidades de mejora." },
        ],
      },
      {
        numeral: "9.3.3",
        titulo: "Salidas de la revisión por la dirección",
        items: [
          { id: "9.27", texto: "Las salidas de la revisión incluyen decisiones y acciones relacionadas con oportunidades de mejora." },
          { id: "9.28", texto: "Incluyen cualquier necesidad de cambio en el SGC." },
          { id: "9.29", texto: "Incluye las necesidades de recursos." },
          { id: "9.30", texto: "Se conserva información documentada como evidencia de los resultados de las revisiones." },
        ],
      },
    ],
  },
  {
    numero: "10",
    titulo: "Mejora",
    subclausulas: [
      {
        numeral: "10.1",
        titulo: "Generalidades",
        items: [
          { id: "10.1", texto: "La organización ha determinado y seleccionado las oportunidades de mejora e implementado las acciones necesarias para cumplir con los requisitos del cliente y mejorar su satisfacción." },
        ],
      },
      {
        numeral: "10.2",
        titulo: "No conformidad y acción correctiva",
        items: [
          { id: "10.2", texto: "La organización reacciona ante la no conformidad, toma acciones para controlarla y corregirla." },
          { id: "10.3", texto: "Evalúa la necesidad de acciones para eliminar las causas de la no conformidad." },
          { id: "10.4", texto: "Implementa cualquier acción necesaria ante una no conformidad." },
          { id: "10.5", texto: "Revisa la eficacia de cualquier acción correctiva tomada." },
          { id: "10.6", texto: "Actualiza los riesgos y oportunidades de ser necesario." },
          { id: "10.7", texto: "Hace cambios al SGC si fuera necesario." },
          { id: "10.8", texto: "Las acciones correctivas son apropiadas a los efectos de las no conformidades encontradas." },
          { id: "10.9", texto: "Se conserva información documentada como evidencia de la naturaleza de las no conformidades, cualquier acción tomada y los resultados de la acción correctiva." },
        ],
      },
      {
        numeral: "10.3",
        titulo: "Mejora continua",
        items: [
          { id: "10.10", texto: "La organización mejora continuamente la conveniencia, adecuación y eficacia del SGC." },
          { id: "10.11", texto: "Considera los resultados del análisis y evaluación, y las salidas de la revisión por la dirección, para determinar si hay necesidades u oportunidades de mejora." },
        ],
      },
    ],
  },
];

export const TOTAL_ITEMS_DIAGNOSTICO = CLAUSULAS_DIAGNOSTICO.reduce(
  (acc, c) => acc + c.subclausulas.reduce((a2, s) => a2 + s.items.length, 0),
  0
);

export type AccionRecomendada = "Mantener" | "Mejorar" | "Implementar";

export function accionPorPorcentaje(pct: number): AccionRecomendada {
  if (pct >= 80) return "Mantener";
  if (pct >= 50) return "Mejorar";
  return "Implementar";
}

export function colorAccion(accion: AccionRecomendada): string {
  switch (accion) {
    case "Mantener":
      return "#22C55E";
    case "Mejorar":
      return "#F5A623";
    case "Implementar":
      return "#EF4444";
  }
}

export type CalificacionGlobal = "Alto" | "Medio" | "Bajo";

export function calificacionGlobalPorPorcentaje(pct: number): CalificacionGlobal {
  if (pct >= 75) return "Alto";
  if (pct >= 40) return "Medio";
  return "Bajo";
}

export function colorCalificacionGlobal(cal: CalificacionGlobal): string {
  switch (cal) {
    case "Alto":
      return "#22C55E";
    case "Medio":
      return "#F5A623";
    case "Bajo":
      return "#EF4444";
  }
}

export type ResultadoClausula = {
  numero: string;
  titulo: string;
  puntajeObtenido: number;
  puntajeMaximo: number;
  porcentaje: number;
  accion: AccionRecomendada;
};

export type ResultadoDiagnostico = {
  clausulas: ResultadoClausula[];
  puntajeObtenido: number;
  puntajeMaximo: number;
  porcentajeGlobal: number;
  calificacion: CalificacionGlobal;
};

export function calcularResultados(respuestas: Record<string, number>): ResultadoDiagnostico {
  const clausulas: ResultadoClausula[] = CLAUSULAS_DIAGNOSTICO.map((c) => {
    const items = c.subclausulas.flatMap((s) => s.items);
    const puntajeMaximo = items.length * 10;
    const puntajeObtenido = items.reduce((acc, item) => acc + (respuestas[item.id] ?? 0), 0);
    const porcentaje = puntajeMaximo > 0 ? Math.round((puntajeObtenido / puntajeMaximo) * 100) : 0;
    return {
      numero: c.numero,
      titulo: c.titulo,
      puntajeObtenido,
      puntajeMaximo,
      porcentaje,
      accion: accionPorPorcentaje(porcentaje),
    };
  });

  const puntajeObtenido = clausulas.reduce((acc, c) => acc + c.puntajeObtenido, 0);
  const puntajeMaximo = clausulas.reduce((acc, c) => acc + c.puntajeMaximo, 0);
  const porcentajeGlobal = puntajeMaximo > 0 ? Math.round((puntajeObtenido / puntajeMaximo) * 100) : 0;

  return {
    clausulas,
    puntajeObtenido,
    puntajeMaximo,
    porcentajeGlobal,
    calificacion: calificacionGlobalPorPorcentaje(porcentajeGlobal),
  };
}

export function cantidadRespondidas(respuestas: Record<string, number>): number {
  return CLAUSULAS_DIAGNOSTICO.reduce(
    (acc, c) => acc + c.subclausulas.reduce((a2, s) => a2 + s.items.filter((i) => i.id in respuestas).length, 0),
    0
  );
}
