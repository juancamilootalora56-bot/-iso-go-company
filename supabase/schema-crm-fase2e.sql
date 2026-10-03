-- ============================================================
-- CRM interno — Fase 2e: completar campos de contacto en todos
-- los formularios (Cotizaciones y Clientes), para que compartan
-- las mismas características que Leads.
-- ============================================================

-- Cotizaciones: persona de contacto, cargo, rubro y dirección
alter table public.cotizaciones
  add column if not exists contacto  text,
  add column if not exists cargo     text,
  add column if not exists rubro     text,
  add column if not exists direccion text;

-- Clientes: dueño o representante
alter table public.clientes
  add column if not exists representante text;

-- Actualizamos el trigger de graduación para copiar también
-- representante, dirección y N° de colaboradores desde el lead.
create or replace function public.graduar_lead_a_cliente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.etapa = 'ganado' and (old.etapa is distinct from 'ganado') then
    insert into public.clientes (
      lead_id, created_by, nombre, empresa, representante, rubro, cargo,
      email, telefono, direccion, num_colaboradores, norma_interes, notas, valor
    )
    values (
      new.id, new.created_by, new.nombre, new.empresa, new.representante, new.rubro, new.cargo,
      new.email, new.telefono, new.direccion, new.num_colaboradores, new.norma_interes, new.notas, new.valor_estimado
    )
    on conflict do nothing;
  end if;
  return new;
end;
$$;
