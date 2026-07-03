-- profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  company_name text,
  sector text, -- manufactura, alimentos, salud, tecnologia, construccion, otro
  phone text,
  country text,
  interested_norms text[], -- array of ISO norms they're interested in
  plan text default 'free', -- free, basic, pro
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- demo_access table
create table public.demo_access (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  certification_slug text, -- 'iso-9001', 'iso-14001', etc.
  activated_at timestamptz default now(),
  expires_at timestamptz default now() + interval '30 days'
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.demo_access enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can view own demo access" on public.demo_access for select using (auth.uid() = user_id);

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
