-- Tema de color elegido por el cliente para el panel (Inicio, portadas de documentos).
alter table public.profiles
  add column if not exists tema_panel text default 'oscuro';
