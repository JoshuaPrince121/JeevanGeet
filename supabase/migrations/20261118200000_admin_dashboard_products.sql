create table if not exists public.gospel_content (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('article', 'ministry_report')),
  title text not null,
  category text not null,
  summary text not null,
  cover_path text not null,
  body text not null,
  testimony text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gospel_content_testimony_kind check (
    testimony is null or kind = 'ministry_report'
  )
);

create index if not exists gospel_content_published_idx
  on public.gospel_content (kind, published_at desc)
  where is_published;

alter table public.gospel_content enable row level security;

grant select on public.gospel_content to anon, authenticated;
grant insert, update, delete on public.gospel_content to authenticated;

drop policy if exists "Anyone can read published gospel content"
  on public.gospel_content;
create policy "Anyone can read published gospel content"
  on public.gospel_content for select
  using (
    is_published
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "Admins can create gospel content"
  on public.gospel_content;
create policy "Admins can create gospel content"
  on public.gospel_content for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update gospel content"
  on public.gospel_content;
create policy "Admins can update gospel content"
  on public.gospel_content for update
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete gospel content"
  on public.gospel_content;
create policy "Admins can delete gospel content"
  on public.gospel_content for delete
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create table if not exists public.shop_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  price_minor integer not null check (price_minor >= 0),
  currency text not null default 'INR' check (currency = 'INR'),
  image_path text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shop_products_published_idx
  on public.shop_products (created_at desc)
  where is_published;

alter table public.shop_products enable row level security;

grant select on public.shop_products to anon, authenticated;

drop policy if exists "Anyone can read published shop products"
  on public.shop_products;
create policy "Anyone can read published shop products"
  on public.shop_products for select
  using (is_published);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'gospel-content',
  'gospel-content',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view gospel content images"
  on storage.objects;
create policy "Anyone can view gospel content images"
  on storage.objects for select
  using (bucket_id = 'gospel-content');

drop policy if exists "Admins can upload gospel content images"
  on storage.objects;
create policy "Admins can upload gospel content images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'gospel-content'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "Admins can update gospel content images"
  on storage.objects;
create policy "Admins can update gospel content images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'gospel-content'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    bucket_id = 'gospel-content'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "Admins can delete gospel content images"
  on storage.objects;
create policy "Admins can delete gospel content images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'gospel-content'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
