-- ============================================================
-- Portal del cliente — Gestión de la Gerencia: las 13 actividades
-- (Compromiso por la Dirección, FODA, Matrices, Mapa de procesos,
-- Misión/Visión/Valores, Política y Objetivos de Calidad, Alcance,
-- Estructura Organizacional).
--
-- Una sola tabla genérica: cada actividad es un documento de texto
-- editable por el cliente, identificado por item_key.
-- ============================================================

create table if not exists public.gestion_documentos (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references auth.users(id) on delete cascade,
  modulo      text not null,            -- 'gerencia', 'talento_humano', etc.
  item_key    text not null,            -- 'compromiso_dir', 'foda', ...
  contenido   text,
  updated_at  timestamptz not null default now(),
  unique (profile_id, modulo, item_key)
);

create index if not exists gestion_documentos_profile_idx
  on public.gestion_documentos (profile_id, modulo);

alter table public.gestion_documentos enable row level security;

drop policy if exists "gestion_documentos_select_own" on public.gestion_documentos;
create policy "gestion_documentos_select_own" on public.gestion_documentos
  for select using (auth.uid() = profile_id);

drop policy if exists "gestion_documentos_insert_own" on public.gestion_documentos;
create policy "gestion_documentos_insert_own" on public.gestion_documentos
  for insert with check (auth.uid() = profile_id);

drop policy if exists "gestion_documentos_update_own" on public.gestion_documentos;
create policy "gestion_documentos_update_own" on public.gestion_documentos
  for update using (auth.uid() = profile_id);

grant select, insert, update on public.gestion_documentos to authenticated;
grant select, insert, update on public.gestion_documentos to service_role;

drop trigger if exists trg_gestion_documentos_updated_at on public.gestion_documentos;
create trigger trg_gestion_documentos_updated_at
  before update on public.gestion_documentos
  for each row execute function public.set_updated_at();
