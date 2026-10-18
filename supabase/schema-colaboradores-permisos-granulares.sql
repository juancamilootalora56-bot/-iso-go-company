-- ============================================================
-- Colaboradores del portal del cliente — permisos granulares
--
-- Ejecutar en: proyecto Supabase de iso-go-company
--   Dashboard → SQL Editor → New query → pegar todo → Run
--
-- Dos cambios sobre client_colaboradores:
--
-- 1. `empleado_id`: liga el login del colaborador con su ficha ya
--    cargada en Alta de Personal (lib/personal.ts, guardada como JSON
--    dentro de gestion_documentos — por eso es `text`, no una FK real,
--    es el mismo patrón que usa el resto del sistema para ese módulo).
--    El alta de colaborador deja de pedir nombre/apellido/cargo de
--    nuevo: se elige a la persona ya existente.
--
-- 2. `permisos` pasa de `text[]` (solo nombre de módulo) a `jsonb`,
--    con esta forma:
--      {
--        "compras": { "completo": true },
--        "talento_humano": {
--          "actividades": {
--            "requisicion_pedidos": { "etapas": ["Solicitud"] },
--            "inscripcion_proveedores": true
--          }
--        }
--      }
--    - Si el módulo es `{ "completo": true }`, el colaborador ve y usa
--      todas las actividades de ese módulo (como era antes).
--    - Si no, solo ve las actividades listadas en "actividades". Cada
--      actividad es `true` (acceso completo a esa actividad) o, para
--      actividades tipo pipeline (hoy solo Requisición de Pedidos),
--      `{ "etapas": [...] }` para limitar a ciertas etapas.
--    - La RLS de gestion_documentos (acceso a datos) sigue siendo a
--      nivel de MÓDULO solamente — ahí no hay forma práctica de filtrar
--      por actividad/etapa sin reestructurar cómo se guardan los datos
--      de cada módulo. El filtro por actividad/etapa es una capa extra
--      en la aplicación (qué ve y qué puede tocar en pantalla), no un
--      límite de base de datos. Para un equipo propio de confianza es
--      un compromiso razonable; no lo uses para separar datos entre
--      organizaciones que no confían entre sí.
-- ============================================================

alter table public.client_colaboradores
  add column if not exists empleado_id text;

-- --- Primero hay que soltar las políticas viejas: dependen de la columna
-- `permisos` (text[]) y no dejan ni borrarla ni cambiarle el tipo. ---

drop policy if exists "gestion_documentos_select_own" on public.gestion_documentos;
drop policy if exists "gestion_documentos_insert_own" on public.gestion_documentos;
drop policy if exists "gestion_documentos_update_own" on public.gestion_documentos;

-- --- Migrar permisos de text[] a jsonb ---

alter table public.client_colaboradores
  add column if not exists permisos_jsonb jsonb not null default '{}'::jsonb;

update public.client_colaboradores
set permisos_jsonb = (
  select coalesce(jsonb_object_agg(m, jsonb_build_object('completo', true)), '{}'::jsonb)
  from unnest(permisos) as m
)
where permisos is not null and array_length(permisos, 1) > 0;

alter table public.client_colaboradores drop column if exists permisos;
alter table public.client_colaboradores rename column permisos_jsonb to permisos;

-- --- RLS de gestion_documentos: el check `= any(c.permisos)` sobre
-- array ya no aplica con jsonb — se reemplaza por el operador `?`
-- (existencia de la clave de módulo en el objeto, sin importar si es
-- "completo" o una lista de actividades: a nivel de base de datos el
-- acceso sigue siendo por módulo completo, el detalle de actividad lo
-- filtra la aplicación). ---

create policy "gestion_documentos_select_own" on public.gestion_documentos
  for select using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.client_colaboradores c
      where c.id = auth.uid()
        and c.owner_id = gestion_documentos.profile_id
        and c.activo
        and c.permisos ? gestion_documentos.modulo
    )
  );

create policy "gestion_documentos_insert_own" on public.gestion_documentos
  for insert with check (
    auth.uid() = profile_id
    or exists (
      select 1 from public.client_colaboradores c
      where c.id = auth.uid()
        and c.owner_id = gestion_documentos.profile_id
        and c.activo
        and c.permisos ? gestion_documentos.modulo
    )
  );

create policy "gestion_documentos_update_own" on public.gestion_documentos
  for update using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.client_colaboradores c
      where c.id = auth.uid()
        and c.owner_id = gestion_documentos.profile_id
        and c.activo
        and c.permisos ? gestion_documentos.modulo
    )
  );
