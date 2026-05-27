
-- Roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- Properties
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location text not null,
  price_amount numeric not null default 0,
  price_currency text not null default 'Rs',
  price_suffix text default 'M',
  status text not null default 'For Sale',
  badge text default 'New Listing',
  bedrooms int not null default 0,
  bathrooms int not null default 0,
  sqft int not null default 0,
  description text default '',
  features jsonb not null default '[]'::jsonb,
  latitude double precision,
  longitude double precision,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.properties to anon, authenticated;
grant insert, update, delete on public.properties to authenticated;
grant all on public.properties to service_role;
alter table public.properties enable row level security;

create policy "Anyone reads published properties" on public.properties
  for select to anon, authenticated using (is_published = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert properties" on public.properties
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update properties" on public.properties
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete properties" on public.properties
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Property images
create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  storage_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.property_images to anon, authenticated;
grant insert, update, delete on public.property_images to authenticated;
grant all on public.property_images to service_role;
alter table public.property_images enable row level security;

create policy "Anyone reads property images" on public.property_images
  for select to anon, authenticated using (true);
create policy "Admins insert images" on public.property_images
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update images" on public.property_images
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete images" on public.property_images
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create index property_images_property_id_idx on public.property_images(property_id, sort_order);

-- Leads
create table public.property_leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  full_name text not null,
  email text not null,
  whatsapp text,
  message text,
  created_at timestamptz not null default now()
);
grant insert on public.property_leads to anon, authenticated;
grant select on public.property_leads to authenticated;
grant all on public.property_leads to service_role;
alter table public.property_leads enable row level security;

create policy "Anyone submits leads" on public.property_leads
  for insert to anon, authenticated with check (true);
create policy "Admins read leads" on public.property_leads
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger properties_set_updated_at before update on public.properties
  for each row execute function public.set_updated_at();

-- Storage bucket
insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true)
  on conflict (id) do nothing;

create policy "Public read property images"
  on storage.objects for select using (bucket_id = 'property-images');
create policy "Admins upload property images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'property-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update property images"
  on storage.objects for update to authenticated
  using (bucket_id = 'property-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete property images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'property-images' and public.has_role(auth.uid(), 'admin'));

-- Seed initial properties matching current homepage
insert into public.properties (slug, title, location, price_amount, price_suffix, bedrooms, bathrooms, sqft, description, features, latitude, longitude, sort_order) values
('azure-skyline-penthouse', 'Azure Skyline Penthouse', 'Grand Baie, Mauritius', 7.5, 'M', 3, 2, 2400,
 'A stunning penthouse with panoramic ocean views, floor-to-ceiling windows, and a private rooftop terrace. Located in the heart of Grand Baie, this residence offers the perfect blend of luxury and convenience.',
 '["Private rooftop terrace","Floor-to-ceiling ocean views","Smart home automation","Private elevator","Concierge service"]'::jsonb,
 -20.0136, 57.5803, 1),
('oceanfront-villa-estate', 'Oceanfront Villa Estate', 'Tamarin Bay', 12.2, 'M', 5, 4, 4800,
 'A magnificent oceanfront estate set on a private cove. Five bedrooms, infinity pool, private beach access and lush tropical gardens. The ultimate luxury retreat.',
 '["Private beach access","Infinity pool","Tropical gardens","Home cinema","Wine cellar","Staff quarters"]'::jsonb,
 -20.3289, 57.3786, 2),
('modern-garden-residence', 'Modern Garden Residence', 'Floreal Heights', 5.9, 'M', 4, 3, 3100,
 'Contemporary architecture surrounded by mature gardens. Four spacious bedrooms, open-plan living and a chef-grade kitchen designed for entertaining.',
 '["Chef''s kitchen","Mature private gardens","Double garage","Solar power","Underfloor heating"]'::jsonb,
 -20.2731, 57.4892, 3),
('coral-cliff-house', 'The Coral Cliff House', 'Black River', 9.4, 'M', 4, 3, 3600,
 'Perched on a coral cliff with sweeping west-coast sunset views. Open volumes, polished concrete, and seamless indoor-outdoor flow.',
 '["Cliffside infinity pool","Sunset terrace","Outdoor kitchen","Smart shading","EV charging"]'::jsonb,
 -20.4047, 57.3658, 4),
('marina-view-apartment', 'Marina View Apartment', 'Port Louis Waterfront', 6.8, 'M', 2, 2, 1800,
 'A sleek waterfront apartment overlooking the marina. Walk-in wardrobes, designer kitchen and direct access to the boardwalk and dining.',
 '["Marina-facing balcony","Designer kitchen","Concierge","Gym & spa access","Secure parking"]'::jsonb,
 -20.1619, 57.5012, 5),
('heritage-manor', 'The Heritage Manor', 'Moka', 15.1, 'M', 6, 5, 6200,
 'A restored colonial estate on private grounds with six bedrooms, library, formal dining and a wraparound veranda. Heritage charm with modern comforts.',
 '["Restored heritage","Private grounds","Library & study","Wine cellar","Pool house","Staff cottage"]'::jsonb,
 -20.2350, 57.4900, 6);

insert into public.property_images (property_id, url, sort_order)
select id, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80', 0 from public.properties where slug='azure-skyline-penthouse'
union all select id, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80', 1 from public.properties where slug='azure-skyline-penthouse'
union all select id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80', 2 from public.properties where slug='azure-skyline-penthouse'
union all select id, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80', 0 from public.properties where slug='oceanfront-villa-estate'
union all select id, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80', 1 from public.properties where slug='oceanfront-villa-estate'
union all select id, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80', 0 from public.properties where slug='modern-garden-residence'
union all select id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80', 0 from public.properties where slug='coral-cliff-house'
union all select id, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80', 0 from public.properties where slug='marina-view-apartment'
union all select id, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80', 0 from public.properties where slug='heritage-manor';
