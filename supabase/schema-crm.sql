-- ============================================================
-- CRM interno — Fase 1: roles y colaboradores
--
-- Ejecutar en: proyecto Supabase de iso-go-company
--   Dashboard → SQL Editor → New query → pegar todo → Run
--
-- Separado de `profiles` (clientes del sitio público). Esta tabla
-- es solo para colaboradores internos (admin / comercial / tecnico)
-- que acceden a /crm. El alta es SIEMPRE por invitación de un admin
-- (no hay self-signup para este rol).
-- ============================================================

create table if not exists public.perfiles_internos (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  nombre     text,
  rol        text not null default 'comercial' check (rol in ('admin', 'comercial', 'tecnico')),
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Helper: ¿el usuario actual es admin interno?
-- SECURITY DEFINER para evitar recursión de RLS.
-- ------------------------------------------------------------
create or replace function public.es_admin_interno()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfiles_internos
    where id = auth.uid() and rol = 'admin' and activo = true
  );
$$;

-- ------------------------------------------------------------
-- Helper: ¿el usuario actual es colaborador interno activo
-- (cualquier rol)? Usado por el middleware/layout de /crm.
-- ------------------------------------------------------------
create or replace function public.es_colaborador_interno()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfiles_internos
    where id = auth.uid() and activo = true
  );
$$;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.perfiles_internos enable row level security;

drop policy if exists "ver_propio_perfil" on public.perfiles_internos;
create policy "ver_propio_perfil" on public.perfiles_internos
  for select to authenticated
  using (id = auth.uid() or public.es_admin_interno());

drop policy if exists "admin_actualiza" on public.perfiles_internos;
create policy "admin_actualiza" on public.perfiles_internos
  for update to authenticated
  using (public.es_admin_interno())
  with check (public.es_admin_interno());

drop policy if exists "admin_borra" on public.perfiles_internos;
create policy "admin_borra" on public.perfiles_internos
  for delete to authenticated
  using (public.es_admin_interno());

-- Insert: solo vía service_role (API de invitación), nunca desde el cliente.

-- ------------------------------------------------------------
-- GRANTs — requeridos por la API de datos (ver nota del 24/9/2026:
-- desde 30/10/2026 Supabase no los otorga automáticamente).
-- ------------------------------------------------------------
grant select, update, delete on public.perfiles_internos to authenticated;
grant select, insert, update, delete on public.perfiles_internos to service_role;

-- ------------------------------------------------------------
-- Primer admin (cambiá el email si hace falta antes de correr)
-- Nota: esto solo funciona si el usuario YA existe en auth.users
-- (p. ej. ya se registró antes como cliente). Si no, invitalo
-- primero desde el panel /crm/admin/colaboradores una vez armado,
-- o creá el usuario manualmente desde el dashboard de Supabase.
-- ------------------------------------------------------------
insert into public.perfiles_internos (id, email, nombre, rol)
select id, email, raw_user_meta_data ->> 'full_name', 'admin'
from auth.users
where email = 'juancamilootalora56@gmail.com'
on conflict (id) do update set rol = 'admin', activo = true;
