-- ============================================================
-- CRM interno — Fase 5b: costo/valor en la ficha de cliente
-- Ejecutar después de schema-crm-fase5.sql
-- ============================================================

alter table public.clientes
  add column if not exists valor numeric(14,2) default 0;

-- El trigger de graduación ahora también copia el valor_estimado del lead.
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
      email, telefono, norma_interes, notas, valor
    )
    values (
      new.id, new.created_by, new.nombre, new.empresa, new.rubro, new.cargo,
      new.email, new.telefono, new.norma_interes, new.notas, new.valor_estimado
    )
    on conflict do nothing;
  end if;
  return new;
end;
$$;
