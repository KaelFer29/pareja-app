grant execute on function private.reorder_notes(uuid, uuid[]) to authenticated;

with ordered as (
  select
    id,
    row_number() over (
      partition by couple_id
      order by pinned desc, created_at desc, id asc
    ) as next_position
  from public.notes
)
update public.notes as notes
set position = ordered.next_position
from ordered
where notes.id = ordered.id;

create or replace function private.notes_assign_position()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.position is null or new.position = 0 then
    select coalesce(min(position), 1) - 1
    into new.position
    from public.notes
    where couple_id = new.couple_id;
  end if;
  return new;
end;
$$;

revoke execute on function private.notes_assign_position() from public, anon, authenticated;
