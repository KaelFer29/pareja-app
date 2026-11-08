alter table public.notes
add column position integer;

with ordered as (
  select
    id,
    row_number() over (
      partition by couple_id
      order by pinned desc, updated_at desc, id asc
    ) as next_position
  from public.notes
)
update public.notes as notes
set position = ordered.next_position
from ordered
where notes.id = ordered.id;

alter table public.notes
alter column position set not null;

alter table public.notes
alter column position set default 0;

create index notes_couple_id_position_idx
  on public.notes (couple_id, pinned desc, position asc, id asc);

create function private.notes_assign_position()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.position is null or new.position = 0 then
    select coalesce(max(position), 0) + 1
    into new.position
    from public.notes
    where couple_id = new.couple_id;
  end if;
  return new;
end;
$$;

create trigger notes_assign_position
before insert on public.notes
for each row execute function private.notes_assign_position();

revoke execute on function private.notes_assign_position() from public, anon, authenticated;

drop index if exists notes_couple_id_order_idx;

grant update (position) on public.notes to authenticated;

create function private.reorder_notes(target_couple_id uuid, ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_couple_member(target_couple_id) then
    raise exception 'not_couple_member';
  end if;

  update public.notes as notes
  set position = positions.ordinality
  from unnest(ordered_ids) with ordinality as positions(id, ordinality)
  where notes.id = positions.id
    and notes.couple_id = target_couple_id;
end;
$$;

create function public.reorder_notes(target_couple_id uuid, ordered_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform private.reorder_notes(target_couple_id, ordered_ids);
end;
$$;

revoke execute on function private.reorder_notes(uuid, uuid[]) from public, anon, authenticated;
revoke execute on function public.reorder_notes(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_notes(uuid, uuid[]) to authenticated;
