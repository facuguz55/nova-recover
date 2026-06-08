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

-- Columnas para tracking de workflows n8n por cliente
alter table onboarding_data
  add column if not exists n8n_workflow_tracking text,
  add column if not exists n8n_workflow_recuperador text,
  add column if not exists n8n_workflow_conversiones text,
  add column if not exists n8n_client_id text;

-- Columnas para config de email (template y asunto personalizables)
alter table onboarding_data
  add column if not exists email_sender_name text,
  add column if not exists email_template_id text default 'dark-minimal',
  add column if not exists email_subject text default 'Completaste tu carrito en {store}';

-- =============================================
-- Tablas operativas de n8n (escritas via anon key)
-- =============================================

-- Clicks en el link de tracking (WebhookTracking workflow)
create table if not exists clicks_tracking (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,       -- n8n client ID (slug, ej: "tienda-abc123")
  email text not null,
  checkout_url text,
  fecha_click timestamptz default now()
);

alter table clicks_tracking enable row level security;
-- n8n escribe via anon key
create policy "clicks_anon_insert" on clicks_tracking
  for insert to anon with check (true);
-- App lee via sesión autenticada
create policy "clicks_auth_select" on clicks_tracking
  for select to authenticated using (true);

-- Emails de recuperación enviados (Recuperador workflow)
create table if not exists emails_enviados (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,       -- n8n client ID (slug)
  email text not null,
  fecha timestamptz default now(),
  unique (client_id, email)
);

alter table emails_enviados enable row level security;
create policy "emails_anon_insert" on emails_enviados
  for insert to anon with check (true);
create policy "emails_anon_select" on emails_enviados
  for select to anon using (true);
create policy "emails_auth_select" on emails_enviados
  for select to authenticated using (true);

-- Conversiones detectadas (VerificarConversiones workflow)
create table if not exists conversiones (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,       -- n8n client ID (slug)
  email text,
  nombre_cliente text,
  id_orden text not null,
  total_orden text,
  fecha_orden timestamptz,
  fecha_click timestamptz,
  fecha_verificacion timestamptz,
  utm_campaign text,
  unique (client_id, id_orden)
);

alter table conversiones enable row level security;
create policy "conversiones_anon_insert" on conversiones
  for insert to anon with check (true);
create policy "conversiones_auth_select" on conversiones
  for select to authenticated using (true);

-- Carritos abandonados detectados por el Recuperador workflow
-- client_id acá es el UUID de Supabase (a diferencia de las otras tablas)
create table if not exists abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,       -- Supabase user UUID
  customer_email text not null,
  customer_name text,
  checkout_url text,
  abandoned_at timestamptz default now(),
  status text default 'pending', -- pending | emailed | recovered
  email_sent_at timestamptz,
  created_at timestamptz default now(),
  unique (client_id, customer_email)
);

alter table abandoned_carts enable row level security;
create policy "carts_anon_insert" on abandoned_carts
  for insert to anon with check (true);
create policy "carts_anon_update" on abandoned_carts
  for update to anon using (true) with check (true);
create policy "carts_auth_select" on abandoned_carts
  for select to authenticated using (auth.uid() = client_id);
