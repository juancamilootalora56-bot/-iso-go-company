-- ============================================================
-- CRM interno — Fase 2: Leads, Pipeline y Clientes
--
-- Ejecutar en: proyecto Supabase de iso-go-company
--   Dashboard → SQL Editor → New query → pegar todo → Run
--
-- Requiere que ya esté corrido schema-crm.sql (perfiles_internos,
-- es_admin_interno()).
-- ============================================================

create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  created_by     uuid not null references public.perfiles_internos(id) on delete set null,

  nombre         text not null,
  empresa        text,
  email          text,
  telefono       text,
  norma_interes  text,           -- ej. "ISO 9001", "Kosher", etc. (texto libre por ahora)

  etapa          text not null default 'lead_nuevo' check (etapa in (
                   'lead_nuevo', 'contactado', 'reunion', 'presentacion',
                   'demo', 'negociacion', 'ganado', 'perdido'
                 )),
  notas          text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists leads_etapa_idx on public.leads (etapa);
create index if not exists leads_created_by_idx on public.leads (created_by);

create table if not exists public.clientes (
  id             uuid primary key default gen_random_uuid(),
  lead_id        uuid references public.leads(id) on delete set null,
  created_by     uuid not null references public.perfiles_internos(id) on delete set null,

  nombre         text not null,
  empresa        text,
  email          text,
  telefono       text,
  norma_interes  text,
  notas          text,

  created_at     timestamptz not null default now()
);
create index if not exists clientes_created_by_idx on public.clientes (created_by);

-- ------------------------------------------------------------
-- Trigger: al marcar un lead como "ganado", crear/actualizar el
-- cliente correspondiente automáticamente.
-- ------------------------------------------------------------
create or replace function public.graduar_lead_a_cliente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.etapa = 'ganado' and (old.etapa is distinct from 'ganado') then
    insert into public.clientes (lead_id, created_by, nombre, empresa, email, telefono, norma_interes, notas)
    values (new.id, new.created_by, new.nombre, new.empresa, new.email, new.telefono, new.norma_interes, new.notas)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_graduar_lead on public.leads;
create trigger trg_graduar_lead
  after update of etapa on public.leads
  for each row execute function public.graduar_lead_a_cliente();

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RLS — comercial ve/edita lo suyo; admin ve/edita todo; tecnico no accede.
-- ------------------------------------------------------------
alter table public.leads enable row level security;
alter table public.clientes enable row level security;

drop policy if exists "leads_select" on public.leads;
create policy "leads_select" on public.leads
  for select to authenticated
  using (created_by = auth.uid() or public.es_admin_interno());

drop policy if exists "leads_insert" on public.leads;
create policy "leads_insert" on public.leads
  for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "leads_update" on public.leads;
create policy "leads_update" on public.leads
  for update to authenticated
  using (created_by = auth.uid() or public.es_admin_interno())
  with check (created_by = auth.uid() or public.es_admin_interno());

drop policy if exists "leads_delete" on public.leads;
create policy "leads_delete" on public.leads
  for delete to authenticated
  using (created_by = auth.uid() or public.es_admin_interno());

drop policy if exists "clientes_select" on public.clientes;
create policy "clientes_select" on public.clientes
  for select to authenticated
  using (created_by = auth.uid() or public.es_admin_interno());

drop policy if exists "clientes_update" on public.clientes;
create policy "clientes_update" on public.clientes
  for update to authenticated
  using (created_by = auth.uid() or public.es_admin_interno())
  with check (created_by = auth.uid() or public.es_admin_interno());

-- insert en clientes: solo vía el trigger (security definer), nunca directo desde el cliente.

-- ------------------------------------------------------------
-- GRANTs — requeridos por la API de datos desde el 30/10/2026.
-- ------------------------------------------------------------
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.leads to service_role;
grant select, update on public.clientes to authenticated;
grant select, insert, update, delete on public.clientes to service_role;
