-- Control de Asistencia es un servicio especial con costo adicional, no
-- parte del plan base. Queda bloqueado con candado hasta que se habilite
-- manualmente por cliente (no hay autoservicio ni checkout).
--
-- Ejecutar en: proyecto Supabase de iso-go-company
--   Dashboard → SQL Editor → New query → pegar todo → Run

alter table public.profiles
  add column if not exists asistencia_habilitada boolean not null default false;

-- Para habilitarlo a un cliente puntual una vez que contrata el servicio:
--   update public.profiles set asistencia_habilitada = true where id = '<uuid del cliente>';
