drop table public.list_items;
drop table public.lists;
drop function private.set_done_by();

create table public.events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  title text not null check (btrim(title) <> '' and char_length(title) <= 80),
  details text not null default '' check (char_length(details) <= 2000),
  starts_on date not null,
  ends_on date,
  start_time time,
  end_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (ends_on is null or ends_on >= starts_on),
  constraint events_end_time_needs_start check (end_time is null or start_time is not null),
  constraint events_end_time_after_start check (
    end_time is null or (ends_on is not null and ends_on > starts_on) or end_time >= start_time
  )
);

create index events_couple_id_starts_on_idx on public.events (couple_id, starts_on);
create index events_created_by_idx on public.events (created_by);

create trigger events_set_updated_at
before update on public.events
for each row execute function private.set_updated_at();

alter table public.events enable row level security;

revoke all on public.events from anon, authenticated;
grant select, delete on public.events to authenticated;
grant insert (couple_id, title, details, starts_on, ends_on, start_time, end_time)
  on public.events to authenticated;
grant update (title, details, starts_on, ends_on, start_time, end_time)
  on public.events to authenticated;

create policy "Ver eventos de la pareja"
on public.events for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Crear eventos en la pareja"
on public.events for insert
to authenticated
with check (
  (select private.is_couple_member(couple_id))
  and created_by = (select auth.uid())
);

create policy "Editar eventos de la pareja"
on public.events for update
to authenticated
using ((select private.is_couple_member(couple_id)))
with check ((select private.is_couple_member(couple_id)));

create policy "Eliminar eventos de la pareja"
on public.events for delete
to authenticated
using ((select private.is_couple_member(couple_id)));

alter publication supabase_realtime add table public.events;

create function private.notify_new_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.push_to_partner(
    new.couple_id,
    new.created_by,
    private.sender_name(new.created_by) || ' agregó un plan',
    new.title || ' · ' || to_char(new.starts_on, 'DD/MM')
      || coalesce(' ' || to_char(new.start_time, 'HH24:MI'), ''),
    '/calendar/' || new.id
  );
  return null;
end;
$$;

create trigger events_notify_partner
after insert on public.events
for each row execute function private.notify_new_event();

revoke execute on function private.notify_new_event() from public, anon, authenticated;
