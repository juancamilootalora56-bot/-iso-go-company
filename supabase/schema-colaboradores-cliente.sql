-- ============================================================
-- Colaboradores del portal del cliente: cada empresa (dueño del
-- portal) puede crear accesos para su propio equipo, con permisos
-- por módulo (qué secciones de "Gestión de..." puede trabajar cada
-- colaborador). No tiene relación con perfiles_internos (eso es
-- el equipo de Iso Go en el CRM).
-- ============================================================

create table if not exists public.client_colaboradores (
  id              uuid primary key references auth.users(id) on delete cascade,
  owner_id        uuid not null references auth.users(id) on delete cascade,
  nombre          text not null,
  apellido        text not null,
  cargo           text,
  identificacion  text,
  foto            text, -- data URL (base64), mismo patrón que el resto del sistema
  permisos        text[] not null default '{}', -- módulos: 'gerencia', 'talento_humano', 'compras', 'comercial', 'operativa', 'diseno_desarrollo'
  activo          boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists client_colaboradores_owner_idx
  on public.client_colaboradores (owner_id);

alter table public.client_colaboradores enable row level security;

drop policy if exists "client_colaboradores_owner_all" on public.client_colaboradores;
create policy "client_colaboradores_owner_all" on public.client_colaboradores
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "client_colaboradores_self_select" on public.client_colaboradores;
create policy "client_colaboradores_self_select" on public.client_colaboradores
  for select using (auth.uid() = id);

grant select, insert, update, delete on public.client_colaboradores to authenticated;
grant select, insert, update, delete on public.client_colaboradores to service_role;

-- Un colaborador activo puede leer el perfil (logo, nombre de empresa) de su dueño,
-- para que el panel se personalice igual que si fuera el dueño.
drop policy if exists "colaborador_views_owner_profile" on public.profiles;
create policy "colaborador_views_owner_profile" on public.profiles
  for select using (
    exists (
      select 1 from public.client_colaboradores c
      where c.id = auth.uid() and c.owner_id = profiles.id and c.activo
    )
  );

-- Ampliar gestion_documentos para que un colaborador activo, con permiso sobre
-- el módulo correspondiente, pueda leer/escribir los documentos de su empresa
-- (antes solo el dueño podía, vía auth.uid() = profile_id).
drop policy if exists "gestion_documentos_select_own" on public.gestion_documentos;
create policy "gestion_documentos_select_own" on public.gestion_documentos
  for select using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.client_colaboradores c
      where c.id = auth.uid()
        and c.owner_id = gestion_documentos.profile_id
        and c.activo
        and gestion_documentos.modulo = any(c.permisos)
    )
  );

drop policy if exists "gestion_documentos_insert_own" on public.gestion_documentos;
create policy "gestion_documentos_insert_own" on public.gestion_documentos
  for insert with check (
    auth.uid() = profile_id
    or exists (
      select 1 from public.client_colaboradores c
      where c.id = auth.uid()
        and c.owner_id = gestion_documentos.profile_id
        and c.activo
        and gestion_documentos.modulo = any(c.permisos)
    )
  );

drop policy if exists "gestion_documentos_update_own" on public.gestion_documentos;
create policy "gestion_documentos_update_own" on public.gestion_documentos
  for update using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.client_colaboradores c
      where c.id = auth.uid()
        and c.owner_id = gestion_documentos.profile_id
        and c.activo
        and gestion_documentos.modulo = any(c.permisos)
    )
  );
