create function private.storage_usage()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  total bigint;
begin
  select coalesce(sum((objects.metadata ->> 'size')::bigint), 0)
  into total
  from storage.objects as objects
  where (
    objects.bucket_id = 'photos'
    and private.is_couple_member(private.first_folder_uuid(objects.name))
  )
  or (
    objects.bucket_id = 'avatars'
    and (
      private.first_folder_uuid(objects.name) = (select auth.uid())
      or private.shares_couple_with(private.first_folder_uuid(objects.name))
    )
  );

  return total;
end;
$$;

create function public.storage_usage()
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return private.storage_usage();
end;
$$;

revoke execute on function private.storage_usage() from public, anon, authenticated;
revoke execute on function public.storage_usage() from public, anon;
grant execute on function public.storage_usage() to authenticated;
