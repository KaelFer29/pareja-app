create table public.lists (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  title text not null check (btrim(title) <> '' and char_length(title) <= 60),
  created_at timestamptz not null default now(),
  unique (id, couple_id)
);

create table public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null,
  couple_id uuid not null,
  content text not null check (btrim(content) <> '' and char_length(content) <= 200),
  done boolean not null default false,
  done_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (list_id, couple_id) references public.lists (id, couple_id) on delete cascade
);

create index lists_couple_id_created_at_idx on public.lists (couple_id, created_at);
create index lists_created_by_idx on public.lists (created_by);
create index list_items_list_id_created_at_idx on public.list_items (list_id, created_at);
create index list_items_couple_id_idx on public.list_items (couple_id);
create index list_items_done_by_idx on public.list_items (done_by);

create function private.set_done_by()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.done_by = case when new.done then (select auth.uid()) end;
  return new;
end;
$$;

create trigger list_items_set_done_by
before update of done on public.list_items
for each row
when (old.done is distinct from new.done)
execute function private.set_done_by();

alter table public.lists enable row level security;
alter table public.list_items enable row level security;

revoke all on public.lists, public.list_items from anon, authenticated;
grant select, delete on public.lists, public.list_items to authenticated;
grant insert (couple_id, title) on public.lists to authenticated;
grant update (title) on public.lists to authenticated;
grant insert (list_id, couple_id, content) on public.list_items to authenticated;
grant update (content, done) on public.list_items to authenticated;

create policy "Ver listas de la pareja"
on public.lists for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Crear listas en la pareja"
on public.lists for insert
to authenticated
with check (
  (select private.is_couple_member(couple_id))
  and created_by = (select auth.uid())
);

create policy "Editar listas de la pareja"
on public.lists for update
to authenticated
using ((select private.is_couple_member(couple_id)))
with check ((select private.is_couple_member(couple_id)));

create policy "Eliminar listas de la pareja"
on public.lists for delete
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Ver elementos de la pareja"
on public.list_items for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Crear elementos en la pareja"
on public.list_items for insert
to authenticated
with check ((select private.is_couple_member(couple_id)));

create policy "Editar elementos de la pareja"
on public.list_items for update
to authenticated
using ((select private.is_couple_member(couple_id)))
with check ((select private.is_couple_member(couple_id)));

create policy "Eliminar elementos de la pareja"
on public.list_items for delete
to authenticated
using ((select private.is_couple_member(couple_id)));

alter publication supabase_realtime add table public.lists, public.list_items;
