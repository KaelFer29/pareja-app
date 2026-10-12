create table public.notes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  author_id uuid default auth.uid() references public.profiles (id) on delete set null,
  title text not null default '' check (char_length(title) <= 120),
  content text not null default '' check (char_length(content) <= 10000),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_not_empty check (btrim(title) <> '' or btrim(content) <> '')
);

create index notes_couple_id_order_idx on public.notes (couple_id, pinned desc, updated_at desc);
create index notes_author_id_idx on public.notes (author_id);

create trigger notes_set_updated_at
before update on public.notes
for each row
when (old.title is distinct from new.title or old.content is distinct from new.content)
execute function private.set_updated_at();

alter table public.notes enable row level security;

revoke all on public.notes from anon, authenticated;
grant select, delete on public.notes to authenticated;
grant insert (couple_id, title, content, pinned) on public.notes to authenticated;
grant update (title, content, pinned) on public.notes to authenticated;

create policy "Ver notas de la pareja"
on public.notes for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Crear notas en la pareja"
on public.notes for insert
to authenticated
with check (
  (select private.is_couple_member(couple_id))
  and author_id = (select auth.uid())
);

create policy "Editar notas de la pareja"
on public.notes for update
to authenticated
using ((select private.is_couple_member(couple_id)))
with check ((select private.is_couple_member(couple_id)));

create policy "Eliminar notas de la pareja"
on public.notes for delete
to authenticated
using ((select private.is_couple_member(couple_id)));

alter publication supabase_realtime add table public.notes;
