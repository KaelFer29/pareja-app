drop policy "Eliminar fotos propias" on public.photos;

create policy "Eliminar fotos de la pareja"
on public.photos for delete
to authenticated
using ((select private.is_couple_member(couple_id)));

drop policy "Eliminar archivos de fotos propias" on storage.objects;

create policy "Eliminar archivos de fotos de la pareja"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'photos'
  and (select private.is_couple_member(private.first_folder_uuid(name)))
);
