-- Guardamos el email del colaborador también en esta tabla (además de
-- auth.users) para poder mostrarlo en la matriz sin necesitar la API de
-- administración cada vez.
alter table public.client_colaboradores
  add column if not exists email text;
