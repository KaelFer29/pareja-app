alter table public.photos
add column updated_at timestamptz not null default now();

update public.photos
set updated_at = created_at;

create trigger photos_set_updated_at
before update on public.photos
for each row
when (old.caption is distinct from new.caption)
execute function private.set_updated_at();

grant update (caption) on public.photos to authenticated;

create policy "Editar fotos de la pareja"
on public.photos for update
to authenticated
using ((select private.is_couple_member(couple_id)))
with check ((select private.is_couple_member(couple_id)));
