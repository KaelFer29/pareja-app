create function private.first_folder_uuid(object_name text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when split_part(object_name, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(object_name, '/', 1)::uuid
  end;
$$;

revoke execute on function private.first_folder_uuid(text) from public, anon;
grant execute on function private.first_folder_uuid(text) to authenticated;

alter table public.profiles
add constraint profiles_avatar_path_owned
check (avatar_path is null or avatar_path like id::text || '/%');

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  uploaded_by uuid default auth.uid() references public.profiles (id) on delete set null,
  storage_path text not null unique,
  caption text check (char_length(caption) <= 300),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  created_at timestamptz not null default now(),
  constraint photos_storage_path_matches check (storage_path = couple_id::text || '/' || id::text || '.jpg')
);

create index photos_couple_id_created_at_idx on public.photos (couple_id, created_at desc, id desc);
create index photos_uploaded_by_idx on public.photos (uploaded_by);

alter table public.photos enable row level security;

revoke all on public.photos from anon, authenticated;
grant select, delete on public.photos to authenticated;
grant insert (id, couple_id, storage_path, caption, width, height) on public.photos to authenticated;

create policy "Ver fotos de la pareja"
on public.photos for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Subir fotos a la pareja"
on public.photos for insert
to authenticated
with check (
  (select private.is_couple_member(couple_id))
  and uploaded_by = (select auth.uid())
);

create policy "Eliminar fotos propias"
on public.photos for delete
to authenticated
using (
  uploaded_by = (select auth.uid())
  and (select private.is_couple_member(couple_id))
);

alter publication supabase_realtime add table public.photos;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('photos', 'photos', false, 10485760, array['image/jpeg']),
  ('avatars', 'avatars', false, 5242880, array['image/jpeg']);

create policy "Ver archivos de fotos de la pareja"
on storage.objects for select
to authenticated
using (
  bucket_id = 'photos'
  and (select private.is_couple_member(private.first_folder_uuid(name)))
);

create policy "Subir archivos de fotos a la pareja"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'photos'
  and (select private.is_couple_member(private.first_folder_uuid(name)))
);

create policy "Eliminar archivos de fotos propias"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'photos'
  and owner_id = (select auth.uid())::text
  and (select private.is_couple_member(private.first_folder_uuid(name)))
);

create policy "Ver avatares propios y de la pareja"
on storage.objects for select
to authenticated
using (
  bucket_id = 'avatars'
  and (
    private.first_folder_uuid(name) = (select auth.uid())
    or (select private.shares_couple_with(private.first_folder_uuid(name)))
  )
);

create policy "Subir avatar propio"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and private.first_folder_uuid(name) = (select auth.uid())
);

create policy "Eliminar avatar propio"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and private.first_folder_uuid(name) = (select auth.uid())
);
