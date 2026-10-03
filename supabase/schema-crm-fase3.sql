-- ============================================================
-- CRM interno — Fase 3: Calendario propio (visitas/reuniones)
--
-- Ejecutar en: proyecto Supabase de iso-go-company
--   Dashboard → SQL Editor → New query → pegar todo → Run
--
-- Requiere schema-crm.sql y schema-crm-fase2.sql ya corridos.
-- ============================================================

create table if not exists public.visitas (
  id             uuid primary key default gen_random_uuid(),
  created_by     uuid not null references public.perfiles_internos(id) on delete set null,

  titulo         text not null,
  descripcion    text,
  ubicacion      text,
  fecha_inicio   timestamptz not null,
  fecha_fin      timestamptz,

  lead_id        uuid references public.leads(id) on delete set null,
  cliente_id     uuid references public.clientes(id) on delete set null,

  -- Para la futura sincronización con Google Calendar (Fase 3b).
  google_event_id text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists visitas_fecha_inicio_idx on public.visitas (fecha_inicio);
create index if not exists visitas_created_by_idx on public.visitas (created_by);

drop trigger if exists trg_visitas_updated_at on public.visitas;
create trigger trg_visitas_updated_at
  before update on public.visitas
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RLS — comercial ve/edita lo suyo; admin ve/edita todo.
-- ------------------------------------------------------------
alter table public.visitas enable row level security;

drop policy if exists "visitas_select" on public.visitas;
create policy "visitas_select" on public.visitas
  for select to authenticated
  using (created_by = auth.uid() or public.es_admin_interno());

drop policy if exists "visitas_insert" on public.visitas;
create policy "visitas_insert" on public.visitas
  for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "visitas_update" on public.visitas;
create policy "visitas_update" on public.visitas
  for update to authenticated
  using (created_by = auth.uid() or public.es_admin_interno())
  with check (created_by = auth.uid() or public.es_admin_interno());

drop policy if exists "visitas_delete" on public.visitas;
create policy "visitas_delete" on public.visitas
  for delete to authenticated
  using (created_by = auth.uid() or public.es_admin_interno());

-- ------------------------------------------------------------
-- GRANTs — requeridos por la API de datos desde el 30/10/2026.
-- ------------------------------------------------------------
grant select, insert, update, delete on public.visitas to authenticated;
grant select, insert, update, delete on public.visitas to service_role;
