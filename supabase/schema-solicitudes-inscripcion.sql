-- ============================================================
-- Solicitudes de inscripción + Panel de administración (/admin)
--
-- Ejecutar en: proyecto Supabase de iso-go-company
--   Dashboard → SQL Editor → New query → pegar todo → Run
--
-- Reemplaza el self-signup público: el formulario de /auth/register
-- ya NO crea una cuenta de inmediato. Solo guarda una "solicitud de
-- inscripción" (sin login, sin contraseña, sin sesión). El admin la
-- revisa en /admin, gestiona la reunión/acuerdo por fuera del sistema,
-- y recién al aprobarla se crea la cuenta real por invitación — nadie
-- tiene credenciales de ningún tipo antes de ese paso.
--
-- `admins` es un concepto nuevo, separado de `perfiles_internos`
-- (que es el staff del CRM en /crm). Acá solo se gestiona quién puede
-- entrar a /admin a aprobar inscripciones a la plataforma.
-- ============================================================

create table if not exists public.admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  nombre     text,
  created_at timestamptz not null default now()
);

create table if not exists public.solicitudes_inscripcion (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null,
  email             text not null,
  empresa           text not null,
  sector            text,
  pais              text,
  telefono          text,
  normas_interes    text[] not null default '{}',
  como_nos_conocio  text,
  estado            text not null default 'pendiente'
                      check (estado in ('pendiente', 'en_conversacion', 'aprobada', 'rechazada')),
  notas_admin       text,
  resuelto_por      uuid references auth.users(id),
  usuario_creado_id uuid references auth.users(id),
  fecha_solicitud   timestamptz not null default now(),
  fecha_resolucion  timestamptz
);

-- ------------------------------------------------------------
-- Helper: ¿el usuario actual puede administrar solicitudes de
-- inscripción? SECURITY DEFINER para evitar recursión de RLS.
-- ------------------------------------------------------------
create or replace function public.es_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- RLS — admins
-- ------------------------------------------------------------
alter table public.admins enable row level security;

drop policy if exists "admin_ve_admins" on public.admins;
create policy "admin_ve_admins" on public.admins
  for select to authenticated
  using (public.es_admin());

-- Insert/update/delete: solo vía service_role, nunca desde el cliente.

-- ------------------------------------------------------------
-- RLS — solicitudes_inscripcion
-- ------------------------------------------------------------
alter table public.solicitudes_inscripcion enable row level security;

-- Cualquiera (incluso sin login) puede dejar una solicitud.
drop policy if exists "cualquiera_solicita" on public.solicitudes_inscripcion;
create policy "cualquiera_solicita" on public.solicitudes_inscripcion
  for insert to anon, authenticated
  with check (true);

-- Solo admins pueden ver y gestionar las solicitudes.
drop policy if exists "admin_ve_solicitudes" on public.solicitudes_inscripcion;
create policy "admin_ve_solicitudes" on public.solicitudes_inscripcion
  for select to authenticated
  using (public.es_admin());

drop policy if exists "admin_actualiza_solicitudes" on public.solicitudes_inscripcion;
create policy "admin_actualiza_solicitudes" on public.solicitudes_inscripcion
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- ------------------------------------------------------------
-- GRANTs — requeridos por la API de datos (desde el 30/10/2026
-- Supabase no los otorga automáticamente en tablas nuevas).
-- ------------------------------------------------------------
grant select on public.admins to authenticated;
grant select, insert, update, delete on public.admins to service_role;

grant insert on public.solicitudes_inscripcion to anon;
grant select, update on public.solicitudes_inscripcion to authenticated;
grant select, insert, update, delete on public.solicitudes_inscripcion to service_role;

-- ------------------------------------------------------------
-- Primer admin (cambiá el email si hace falta antes de correr).
-- Nota: esto solo funciona si el usuario YA existe en auth.users.
-- juancamilootalora56@gmail.com ya debería existir (es el mismo
-- email cargado como admin del CRM en schema-crm.sql). Si la
-- consulta no inserta ninguna fila, significa que todavía no hay
-- cuenta con ese email — hay que invitarla primero.
-- ------------------------------------------------------------
insert into public.admins (id, email, nombre)
select id, email, raw_user_meta_data ->> 'full_name'
from auth.users
where email = 'juancamilootalora56@gmail.com'
on conflict (id) do nothing;
