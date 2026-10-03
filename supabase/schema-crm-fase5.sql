-- ============================================================
-- CRM interno — Fase 5: ficha de cliente detallada
-- Ejecutar después de schema-crm-fase4.sql
-- ============================================================

alter table public.clientes
  add column if not exists rubro             text,
  add column if not exists cargo             text,
  add column if not exists num_colaboradores int,
  add column if not exists num_procesos      int,
  add column if not exists direccion         text;

-- El trigger de graduación (fase 2) copiaba nombre/empresa/email/
-- telefono/norma_interes/notas. Lo actualizamos para que también
-- copie rubro, cargo y valor_estimado como referencia.
create or replace function public.graduar_lead_a_cliente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.etapa = 'ganado' and (old.etapa is distinct from 'ganado') then
    insert into public.clientes (
      lead_id, created_by, nombre, empresa, rubro, cargo,
      email, telefono, norma_interes, notas
    )
    values (
      new.id, new.created_by, new.nombre, new.empresa, new.rubro, new.cargo,
      new.email, new.telefono, new.norma_interes, new.notas
    )
    on conflict do nothing;
  end if;
  return new;
end;
$$;
