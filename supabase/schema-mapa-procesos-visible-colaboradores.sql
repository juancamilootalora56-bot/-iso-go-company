-- El widget "Mapa de Procesos" del home del dashboard se muestra a TODOS
-- los colaboradores activos, sin importar qué módulos tengan habilitados
-- (es información organizacional, no datos sensibles de gestión). Pero la
-- RLS de gestion_documentos solo deja leer modulo='gerencia' a quien tenga
-- ese permiso explícito, así que un colaborador sin acceso al módulo de
-- Gerencia veía el mapa como "no configurado" aunque el dueño ya lo había
-- armado (bug real, detectado con la cuenta de Indigo Construcciones).
--
-- Esta política adicional (permisiva, se suma a las existentes con OR) deja
-- leer puntualmente esas dos claves a cualquier colaborador activo del
-- dueño, sin tocar el resto de los datos de gerencia ni los permisos de
-- escritura (inserción/edición del mapa sigue exigiendo el permiso de
-- "gerencia", como hasta ahora).

drop policy if exists "gestion_documentos_select_mapa_procesos" on public.gestion_documentos;
create policy "gestion_documentos_select_mapa_procesos" on public.gestion_documentos
  for select using (
    gestion_documentos.modulo = 'gerencia'
    and gestion_documentos.item_key in ('mapa_procesos_seleccion', 'mapa_procesos_clasificacion')
    and exists (
      select 1 from public.client_colaboradores c
      where c.id = auth.uid()
        and c.owner_id = gestion_documentos.profile_id
        and c.activo
    )
  );
