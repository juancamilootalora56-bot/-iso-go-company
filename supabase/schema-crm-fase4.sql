-- ============================================================
-- CRM interno — Fase 4: Cotizaciones (con ítems detallados)
--
-- Ejecutar en: proyecto Supabase de iso-go-company
--   Dashboard → SQL Editor → New query → pegar todo → Run
--
-- Requiere schema-crm.sql y schema-crm-fase2.sql ya corridos
-- (perfiles_internos, es_admin_interno, leads, clientes).
-- ============================================================

create sequence if not exists public.cotizaciones_numero_seq;

create table if not exists public.cotizaciones (
  id             uuid primary key default gen_random_uuid(),
  created_by     uuid not null references public.perfiles_internos(id) on delete set null,

  numero         text not null unique default ('COT-' || lpad(nextval('cotizaciones_numero_seq')::text, 4, '0')),

  lead_id        uuid references public.leads(id) on delete set null,
  cliente_id     uuid references public.clientes(id) on delete set null,

  estado         text not null default 'borrador' check (estado in (
                   'borrador', 'enviada', 'aceptada', 'rechazada'
                 )),
  notas          text,
  total          numeric(12,2) not null default 0,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists cotizaciones_created_by_idx on public.cotizaciones (created_by);
create index if not exists cotizaciones_estado_idx on public.cotizaciones (estado);

drop trigger if exists trg_cotizaciones_updated_at on public.cotizaciones;
create trigger trg_cotizaciones_updated_at
  before update on public.cotizaciones
  for each row execute function public.set_updated_at();

create table if not exists public.cotizacion_items (
  id              uuid primary key default gen_random_uuid(),
  cotizacion_id   uuid not null references public.cotizaciones(id) on delete cascade,
  orden           int not null default 1,
  descripcion     text not null,
  cantidad        numeric(10,2) not null default 1,
  precio_unitario numeric(12,2) not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists cotizacion_items_cotizacion_id_idx on public.cotizacion_items (cotizacion_id);

-- ------------------------------------------------------------
-- Recalcular el total de la cotización cada vez que cambian sus ítems.
-- ------------------------------------------------------------
create or replace function public.recalcular_total_cotizacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cotizacion_id uuid;
begin
  v_cotizacion_id := coalesce(new.cotizacion_id, old.cotizacion_id);

  update public.cotizaciones
  set total = (
    select coalesce(sum(cantidad * precio_unitario), 0)
    from public.cotizacion_items
    where cotizacion_id = v_cotizacion_id
  )
  where id = v_cotizacion_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_items_recalc_insert on public.cotizacion_items;
create trigger trg_items_recalc_insert
  after insert or update or delete on public.cotizacion_items
  for each row execute function public.recalcular_total_cotizacion();

-- ------------------------------------------------------------
-- RLS — comercial ve/edita lo suyo; admin ve/edita todo.
-- ------------------------------------------------------------
alter table public.cotizaciones enable row level security;
alter table public.cotizacion_items enable row level security;

drop policy if exists "cotizaciones_select" on public.cotizaciones;
create policy "cotizaciones_select" on public.cotizaciones
  for select to authenticated
  using (created_by = auth.uid() or public.es_admin_interno());

drop policy if exists "cotizaciones_insert" on public.cotizaciones;
create policy "cotizaciones_insert" on public.cotizaciones
  for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "cotizaciones_update" on public.cotizaciones;
create policy "cotizaciones_update" on public.cotizaciones
  for update to authenticated
  using (created_by = auth.uid() or public.es_admin_interno())
  with check (created_by = auth.uid() or public.es_admin_interno());

drop policy if exists "cotizaciones_delete" on public.cotizaciones;
create policy "cotizaciones_delete" on public.cotizaciones
  for delete to authenticated
  using (created_by = auth.uid() or public.es_admin_interno());

-- Ítems: el acceso sigue al de la cotización padre.
drop policy if exists "items_all" on public.cotizacion_items;
create policy "items_all" on public.cotizacion_items
  for all to authenticated
  using (exists (
    select 1 from public.cotizaciones c
    where c.id = cotizacion_id and (c.created_by = auth.uid() or public.es_admin_interno())
  ))
  with check (exists (
    select 1 from public.cotizaciones c
    where c.id = cotizacion_id and (c.created_by = auth.uid() or public.es_admin_interno())
  ));

-- ------------------------------------------------------------
-- GRANTs — requeridos por la API de datos desde el 30/10/2026.
-- ------------------------------------------------------------
grant select, insert, update, delete on public.cotizaciones to authenticated;
grant select, insert, update, delete on public.cotizaciones to service_role;
grant select, insert, update, delete on public.cotizacion_items to authenticated;
grant select, insert, update, delete on public.cotizacion_items to service_role;
grant usage on sequence public.cotizaciones_numero_seq to authenticated;
grant usage on sequence public.cotizaciones_numero_seq to service_role;
