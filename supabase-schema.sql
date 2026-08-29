-- Run this once in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query).

-- 1. Table that holds one row per song
create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  week_of date not null,
  pdf_path text not null,
  audio_path text,
  notes text,
  created_at timestamptz default now()
);

alter table songs enable row level security;

drop policy if exists "Public can view songs" on songs;
create policy "Public can view songs"
  on songs for select
  using (true);

drop policy if exists "Authenticated can add songs" on songs;
create policy "Authenticated can add songs"
  on songs for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete songs" on songs;
create policy "Authenticated can delete songs"
  on songs for delete
  using (auth.role() = 'authenticated');

-- 2. Storage buckets for the actual PDF and audio files
insert into storage.buckets (id, name, public)
  values ('sheet-music', 'sheet-music', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('recordings', 'recordings', true)
  on conflict (id) do nothing;

-- 3. Storage policies: anyone can view/download, only logged-in admin can upload/delete
drop policy if exists "Public read sheet-music" on storage.objects;
create policy "Public read sheet-music"
  on storage.objects for select
  using (bucket_id = 'sheet-music');

drop policy if exists "Public read recordings" on storage.objects;
create policy "Public read recordings"
  on storage.objects for select
  using (bucket_id = 'recordings');

drop policy if exists "Authenticated upload sheet-music" on storage.objects;
create policy "Authenticated upload sheet-music"
  on storage.objects for insert
  with check (bucket_id = 'sheet-music' and auth.role() = 'authenticated');

drop policy if exists "Authenticated upload recordings" on storage.objects;
create policy "Authenticated upload recordings"
  on storage.objects for insert
  with check (bucket_id = 'recordings' and auth.role() = 'authenticated');

drop policy if exists "Authenticated delete sheet-music" on storage.objects;
create policy "Authenticated delete sheet-music"
  on storage.objects for delete
  using (bucket_id = 'sheet-music' and auth.role() = 'authenticated');

drop policy if exists "Authenticated delete recordings" on storage.objects;
create policy "Authenticated delete recordings"
  on storage.objects for delete
  using (bucket_id = 'recordings' and auth.role() = 'authenticated');
