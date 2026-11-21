-- ============================================================
-- Control de Asistencia: sedes de la empresa (una o varias) y
-- registro de marcación de entrada/salida geolocalizada.
--
-- Ejecutar en: proyecto Supabase de iso-go-company
--   Dashboard → SQL Editor → New query → pegar todo → Run
-- ============================================================

create table if not exists public.sedes_empresa (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references auth.users(id) on delete cascade,
  nombre        text not null,
  direccion     text,
  latitud       double precision not null,
  longitud      double precision not null,
  radio_metros  integer not null default 150,
  created_at    timestamptz not null default now()
);

create index if not exists sedes_empresa_profile_idx on public.sedes_empresa (profile_id);

alter table public.sedes_empresa enable row level security;

drop policy if exists "sedes_empresa_owner_all" on public.sedes_empresa;
create policy "sedes_empresa_owner_all" on public.sedes_empresa
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- Un colaborador activo necesita leer las sedes de su empresa para poder
-- marcar su propia asistencia (validar su ubicación contra la de su sede).
drop policy if exists "sedes_empresa_colaborador_select" on public.sedes_empresa;
create policy "sedes_empresa_colaborador_select" on public.sedes_empresa
  for select using (
    exists (
      select 1 from public.client_colaboradores c
      where c.id = auth.uid() and c.owner_id = sedes_empresa.profile_id and c.activo
    )
  );

grant select, insert, update, delete on public.sedes_empresa to authenticated;
grant select, insert, update, delete on public.sedes_empresa to service_role;

-- ============================================================
-- Registro de marcación de entrada/salida
-- ============================================================

create table if not exists public.registro_asistencia (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null references auth.users(id) on delete cascade,
  empleado_id       text not null, -- mismo patrón que client_colaboradores.empleado_id: id dentro del JSON de Alta de Personal, no FK real
  sede_id           uuid references public.sedes_empresa(id) on delete set null,
  fecha             date not null,
  tipo              text not null check (tipo in ('entrada', 'salida')),
  marcado_en        timestamptz not null default now(),
  lat               double precision not null,
  lng               double precision not null,
  distancia_metros  double precision not null,
  dentro_de_radio   boolean not null,
  created_at        timestamptz not null default now()
);

create index if not exists registro_asistencia_profile_idx
  on public.registro_asistencia (profile_id, empleado_id, fecha);

alter table public.registro_asistencia enable row level security;

-- El dueño tiene acceso total (incluye corregir o borrar una marcación).
drop policy if exists "registro_asistencia_owner_all" on public.registro_asistencia;
create policy "registro_asistencia_owner_all" on public.registro_asistencia
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- Un colaborador activo con el módulo "talento_humano" habilitado (acceso de
-- base, igual que Calendario de Colaboradores) puede leer los registros de
-- su empresa -- la app filtra del lado del cliente a quién le muestra cada
-- uno (personasVisiblesEquipo), mismo compromiso que el resto del sistema.
drop policy if exists "registro_asistencia_colaborador_select" on public.registro_asistencia;
create policy "registro_asistencia_colaborador_select" on public.registro_asistencia
  for select using (
    exists (
      select 1 from public.client_colaboradores c
      where c.id = auth.uid()
        and c.owner_id = registro_asistencia.profile_id
        and c.activo
        and c.permisos ? 'talento_humano'
    )
  );

-- Un colaborador solo puede insertar marcaciones a su propio nombre --
-- nunca a nombre de otro empleado -- y nunca puede editar o borrar una
-- marcación ya hecha (eso queda reservado al dueño, para correcciones).
drop policy if exists "registro_asistencia_colaborador_insert" on public.registro_asistencia;
create policy "registro_asistencia_colaborador_insert" on public.registro_asistencia
  for insert with check (
    exists (
      select 1 from public.client_colaboradores c
      where c.id = auth.uid()
        and c.owner_id = registro_asistencia.profile_id
        and c.activo
        and c.permisos ? 'talento_humano'
        and c.empleado_id = registro_asistencia.empleado_id
    )
  );

grant select, insert, update, delete on public.registro_asistencia to authenticated;
grant select, insert, update, delete on public.registro_asistencia to service_role;
