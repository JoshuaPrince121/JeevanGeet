create table if not exists public.gospel_content (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('article', 'ministry_report')),
  title text not null,
  category text not null,
  summary text not null,
  cover_path text not null default '',
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

alter table public.gospel_content
  add column if not exists source_url text;

create unique index if not exists gospel_content_source_url_unique_idx
  on public.gospel_content (source_url);

create index if not exists gospel_content_published_idx
  on public.gospel_content (kind, published_at desc)
  where is_published;

alter table public.gospel_content enable row level security;
grant select on public.gospel_content to anon, authenticated;

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

create table if not exists public.daily_verse (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  verse_text text not null,
  verse_reference text not null,
  source_url text not null,
  linked_article_id uuid references public.gospel_content (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_verse_date_idx
  on public.daily_verse (date desc);

alter table public.daily_verse enable row level security;
grant select on public.daily_verse to anon, authenticated;

drop policy if exists "Anyone can read daily verses" on public.daily_verse;
create policy "Anyone can read daily verses"
  on public.daily_verse for select
  using (true);