-- Excepción puntual por cliente: restringe qué pestañas ve un colaborador en
-- su propia ficha de Gestión del Personal ("Mi Ficha"). NULL/vacío (el valor
-- por defecto para todos los clientes existentes) = sin cambios, se siguen
-- viendo las 7 pestañas de siempre. Solo se setea manualmente, cliente por
-- cliente, cuando lo pidan — no hay UI para esto.

alter table public.profiles
  add column if not exists mi_ficha_tabs_colaborador text[];
