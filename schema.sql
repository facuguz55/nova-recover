-- =============================================
-- Nova Recover — Supabase Schema
-- =============================================

-- Clientes
create table if not exists clients (
  id uuid references auth.users primary key,
  email text,
  name text,
  status text default 'pending', -- pending | active | inactive
  created_at timestamptz default now()
);

-- Datos de onboarding
create table if not exists onboarding_data (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  tn_store_id text,
  tn_api_token text,
  tn_disconnected_at timestamptz,
  gmail_connected boolean default false,
  sheets_connected boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Suscripciones Stripe
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text, -- active | canceled | past_due
  created_at timestamptz default now()
);

-- RLS Policies
alter table clients enable row level security;
alter table onboarding_data enable row level security;
alter table subscriptions enable row level security;

-- Clients: solo ve su propio registro
create policy "clients_self" on clients
  for all using (auth.uid() = id);

-- Onboarding: solo ve su propia data
create policy "onboarding_self" on onboarding_data
  for all using (auth.uid() = client_id);

-- Subscriptions: solo ve la suya
create policy "subscriptions_self" on subscriptions
  for all using (auth.uid() = client_id);

-- Trigger: crear registro en clients cuando se crea un usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.clients (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
